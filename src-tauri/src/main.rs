#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager, WindowEvent};
use std::{process::Command, thread, time::Duration};
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
      ollama_has_model
    ])
    .run(tauri::generate_context!())
    .expect("Error while running Tauri application");
}
