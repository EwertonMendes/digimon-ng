#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager, WindowEvent, Emitter};
use std::process::{Command, Stdio};
use std::io::{self, Read, Write};
use std::{thread, time::Duration};
use reqwest;
use serde::Deserialize;

#[tauri::command]
fn ollama_is_installed() -> bool {
  Command::new("ollama").arg("--version").output().is_ok()
}

#[derive(Deserialize)]
struct ModelTag {
  name: String,
}

#[derive(Deserialize)]
struct Tags {
  models: Vec<ModelTag>,
}

fn is_server_up() -> bool {
  reqwest::blocking::get("http://127.0.0.1:11434/api/tags").is_ok()
}

#[tauri::command]
fn ensure_ollama() -> bool {
  if is_server_up() {
    return true;
  }
  let _ = Command::new("ollama").arg("serve").spawn();
  for _ in 0..10 {
    if is_server_up() {
      return true;
    }
    thread::sleep(Duration::from_millis(400));
  }
  false
}

#[tauri::command]
fn ollama_has_model(name: String) -> bool {
  if let Ok(resp) = reqwest::blocking::get("http://127.0.0.1:11434/api/tags") {
    if let Ok(tags) = resp.json::<Tags>() {
      let target = name.to_lowercase();
      return tags.models.iter().any(|m| m.name.to_lowercase() == target);
    }
  }
  if let Ok(out) = Command::new("ollama").arg("list").output() {
    let target = name.to_lowercase();
    let s = String::from_utf8_lossy(&out.stdout).to_lowercase();
    return s.lines().any(|line| line.split_whitespace().next().map(|n| n == target).unwrap_or(false));
  }
  false
}

#[tauri::command]
fn ollama_install_model(app: AppHandle, model: String) -> Result<(), String> {
  tauri::async_runtime::spawn(async move {
    let mut child = Command::new("ollama")
      .arg("pull")
      .arg(&model)
      .stdout(Stdio::piped())
      .stderr(Stdio::piped())
      .spawn()
      .map_err(|e| format!("Error starting install process: {}", e))
      .unwrap();

    let mut buf = [0u8; 4096];
    let mut data: Vec<u8> = Vec::new();
    let mut last_percent: Option<String> = None;

    if let Some(mut stderr) = child.stderr.take() {
      loop {
        match stderr.read(&mut buf) {
          Ok(0) => break,
          Ok(n) => {
            data.extend_from_slice(&buf[..n]);
            if let Ok(text) = String::from_utf8(data.clone()) {
              if let Some(percent) = parse_progress(&text) {
                if last_percent.as_deref() != Some(percent.as_str()) {
                  print!("\rModel install at {}", percent);
                  io::stdout().flush().ok();
                  app.emit("ollama_install_progress", percent.clone()).ok();
                  last_percent = Some(percent);
                }
              }
              if data.len() > 10000 {
                data = data.split_off(data.len() - 100);
              }
            } else {
              if data.len() > 8192 {
                data.drain(..4096);
              }
            }
          }
          Err(e) => {
            println!("\nRead error: {}", e);
            break;
          }
        }
      }
    }

    let status = child.wait().map_err(|e| format!("Error waiting for process: {}", e)).unwrap();
    if status.success() {
      println!("\nModel install finished successfully");
      app.emit("ollama_install_done", model).ok();
    } else {
      println!("\nModel install failed");
      app.emit("ollama_install_done", String::from("Failed to install model")).ok();
    }
  });

  Ok(())
}

fn parse_progress(text: &str) -> Option<String> {
  let mut last = None;
  for seg in text.split('%') {
    let digits_rev: String = seg.chars().rev().take_while(|c| c.is_ascii_digit()).collect();
    if digits_rev.is_empty() {
      continue;
    }
    let digits: String = digits_rev.chars().rev().collect();
    if let Ok(num) = digits.parse::<u8>() {
      if num <= 100 {
        last = Some(format!("{}%", num));
      }
    }
  }
  last
}

#[tauri::command]
fn close_splashscreen(app: AppHandle) {
  if let Some(splash) = app.get_webview_window("splashscreen") {
    splash.destroy().unwrap();
  }
  if let Some(main) = app.get_webview_window("main") {
    main.show().unwrap();
  }
}

#[tauri::command]
fn exit_app(app: AppHandle) {
  app.exit(0);
}

fn main() {
  tauri::Builder
    ::default()
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
      ollama_install_model
    ])
    .run(tauri::generate_context!())
    .expect("Error while running Tauri application");
}
