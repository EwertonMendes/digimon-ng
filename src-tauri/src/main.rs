#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{ AppHandle, Manager, WindowEvent };
use std::{ process::Command, thread, time::Duration };

#[tauri::command]
fn ensure_ollama() -> bool {
  if reqwest::blocking::get("http://127.0.0.1:11434/api/tags").is_ok() {
    return true;
  }

  let _ = Command::new("ollama").arg("serve").spawn();

  for _ in 0..10 {
    if reqwest::blocking::get("http://127.0.0.1:11434/api/tags").is_ok() {
      return true;
    }
    thread::sleep(Duration::from_millis(400));
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
    .invoke_handler(tauri::generate_handler![close_splashscreen, exit_app, ensure_ollama])
    .run(tauri::generate_context!())
    .expect("Error while running Tauri application");
}
