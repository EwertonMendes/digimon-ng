#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager, WindowEvent};

#[tauri::command]
fn close_splashscreen(app: AppHandle) {
  app
    .get_webview_window("splashscreen")
    .unwrap()
    .destroy()
    .unwrap();
  app.get_webview_window("main").unwrap().show().unwrap();
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .on_window_event(|window, event| match event {
      WindowEvent::CloseRequested { .. } => {
        window.app_handle().exit(0);
      }
      _ => {}
    })
    .setup(|app| {
      let main_window = app.get_webview_window("main").unwrap();
      main_window.hide().unwrap();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![close_splashscreen])
    .run(tauri::generate_context!(
      "../src-tauri/tauri.conf.json",
    ))
    .expect("error while running tauri application");
}
