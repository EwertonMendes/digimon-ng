#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager, WindowEvent, Emitter};
use std::process::{Command, Stdio};
use serde::Deserialize;
use reqwest::Client;
use tokio::time::sleep;
use std::time::Duration;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000 | 0x00000008;

#[derive(Deserialize)]
struct ModelTag {
  name: String,
}

#[derive(Deserialize)]
struct Tags {
  models: Vec<ModelTag>,
}

#[tauri::command]
async fn ollama_is_installed() -> bool {
  let mut cmd = Command::new("ollama");
  cmd.arg("--version").stdout(Stdio::null()).stderr(Stdio::null());
  #[cfg(target_os = "windows")]
  { cmd.creation_flags(CREATE_NO_WINDOW); }
  cmd.spawn().is_ok()
}

async fn is_server_up() -> bool {
  Client::new()
    .get("http://127.0.0.1:11434/api/tags")
    .send()
    .await
    .map(|r| r.status().is_success())
    .unwrap_or(false)
}

#[tauri::command]
async fn ensure_ollama() -> bool {
  if is_server_up().await { return true; }
  let mut cmd = Command::new("ollama");
  cmd.arg("serve").stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
  #[cfg(target_os = "windows")]
  { cmd.creation_flags(CREATE_NO_WINDOW); }
  let _ = cmd.spawn();
  for _ in 0..20 {
    if is_server_up().await { return true; }
    sleep(Duration::from_millis(500)).await;
  }
  false
}

#[tauri::command]
async fn ollama_has_model(name: String) -> bool {
  let client = Client::new();
  if let Ok(resp) = client.get("http://127.0.0.1:11434/api/tags").send().await {
    if let Ok(tags) = resp.json::<Tags>().await {
      let target = name.to_lowercase();
      if tags.models.iter().any(|m| m.name.to_lowercase() == target) { return true; }
    }
  }
  let mut cmd = Command::new("ollama");
  cmd.arg("list").stdout(Stdio::piped()).stderr(Stdio::null());
  #[cfg(target_os = "windows")]
  { cmd.creation_flags(CREATE_NO_WINDOW); }
  if let Ok(out) = cmd.output() {
    let target = name.to_lowercase();
    let s = String::from_utf8_lossy(&out.stdout).to_lowercase();
    return s.lines().any(|line| line.split_whitespace().next().map(|n| n == target).unwrap_or(false));
  }
  false
}

#[tauri::command]
async fn ollama_install_model(app: AppHandle, model: String) -> Result<(), String> {
  tauri::async_runtime::spawn(async move {
    use tokio::io::{AsyncBufReadExt, BufReader};
    use tokio::process::Command as TokioCommand;

    let mut cmd = TokioCommand::new("ollama");
    cmd.arg("pull").arg(&model).stdout(Stdio::piped()).stderr(Stdio::piped());
    #[cfg(target_os = "windows")]
    { cmd.creation_flags(CREATE_NO_WINDOW); }

    let mut child = match cmd.spawn() { Ok(c) => c, Err(e) => { let _ = app.emit("ollama_install_done", format!("Error: {}", e)); return; } };
    let stderr = match child.stderr.take() { Some(s) => s, None => { let _ = app.emit("ollama_install_done", String::from("No stderr available")); return; } };

    let mut reader = BufReader::new(stderr).lines();
    let mut last_percent: Option<String> = None;

    while let Ok(Some(line)) = reader.next_line().await {
      if let Some(percent) = parse_progress(&line) {
        if last_percent.as_deref() != Some(percent.as_str()) {
          let _ = app.emit("ollama_install_progress", percent.clone());
          last_percent = Some(percent);
        }
      }
    }

    match child.wait().await {
      Ok(status) if status.success() => { let _ = app.emit("ollama_install_done", model); }
      _ => { let _ = app.emit("ollama_install_done", String::from("Failed to install model")); }
    }
  });
  Ok(())
}

fn parse_progress(text: &str) -> Option<String> {
  let mut last = None;
  for seg in text.split('%') {
    let digits_rev: String = seg.chars().rev().take_while(|c| c.is_ascii_digit()).collect();
    if digits_rev.is_empty() { continue; }
    let digits: String = digits_rev.chars().rev().collect();
    if let Ok(num) = digits.parse::<u8>() {
      if num <= 100 { last = Some(format!("{}%", num)); }
    }
  }
  last
}

#[tauri::command]
async fn proxy_ollama_generate_once(body: String) -> Result<String, String> {
  let client = Client::new();
  let res = client.post("http://127.0.0.1:11434/api/generate").header("Content-Type", "application/json").body(body).send().await.map_err(|e| e.to_string())?;
  let text = res.text().await.map_err(|e| e.to_string())?;
  Ok(text)
}

#[tauri::command]
async fn proxy_ollama_generate_stream(app: AppHandle, body: String) -> Result<(), String> {
  use futures_util::StreamExt;
  let client = Client::new();
  let res = client.post("http://127.0.0.1:11434/api/generate").header("Content-Type", "application/json").body(body).send().await.map_err(|e| e.to_string())?;
  if !res.status().is_success() { return Err(format!("HTTP {}", res.status())); }
  let mut stream = res.bytes_stream();
  while let Some(chunk) = stream.next().await {
    match chunk {
      Ok(bytes) => {
        if let Ok(txt) = String::from_utf8(bytes.to_vec()) {
          let _ = app.emit("ollama_stream_chunk", txt);
        }
      }
      Err(e) => {
        let _ = app.emit("ollama_stream_error", e.to_string());
        break;
      }
    }
  }
  let _ = app.emit("ollama_stream_done", "");
  Ok(())
}

#[tauri::command]
fn close_splashscreen(app: AppHandle) {
  if let Some(splash) = app.get_webview_window("splashscreen") { let _ = splash.destroy(); }
  if let Some(main) = app.get_webview_window("main") { let _ = main.show(); }
}

#[tauri::command]
fn exit_app(app: AppHandle) {
  app.exit(0);
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_opener::init())
    .on_window_event(|window, event| {
      if let WindowEvent::CloseRequested { .. } = event {
        window.app_handle().exit(0);
      }
    })
    .invoke_handler(tauri::generate_handler![
      close_splashscreen,
      exit_app,
      ensure_ollama,
      ollama_is_installed,
      ollama_has_model,
      ollama_install_model,
      proxy_ollama_generate_once,
      proxy_ollama_generate_stream
    ])
    .run(tauri::generate_context!())
    .expect("Error while running Tauri application");
}
