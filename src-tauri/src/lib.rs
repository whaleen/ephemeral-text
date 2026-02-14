use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use tauri::menu::{Menu, MenuItem, Submenu};
use tauri::{AppHandle, Manager, State, WebviewUrl, WebviewWindowBuilder, PhysicalPosition, PhysicalSize};
use serde::{Deserialize, Serialize};

// State for managing export directory
#[derive(Default)]
pub struct ExportDirectory(Mutex<Option<PathBuf>>);

pub struct ExitState(AtomicBool);


#[derive(Debug, Clone, Serialize, Deserialize)]
struct WindowGeometry {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

#[tauri::command]
async fn save_file(
    export_dir: State<'_, ExportDirectory>,
    filename: String,
    content: String,
) -> Result<String, String> {
    let dir = export_dir.0.lock().unwrap();
    let export_path = dir.as_ref().ok_or("No export directory selected")?;
    
    let unique_filename = get_unique_filename(export_path, &filename)?;
    let full_path = export_path.join(&unique_filename);
    
    fs::write(&full_path, content).map_err(|e| e.to_string())?;
    
    Ok(full_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn select_export_directory(_app: tauri::AppHandle) -> Result<Option<String>, String> {
    // For now, let's provide a simple way to set the export directory
    // We'll use a hardcoded path that the user can change later
    if let Some(docs_dir) = dirs::document_dir() {
        Ok(Some(docs_dir.to_string_lossy().to_string()))
    } else {
        Ok(Some("/tmp".to_string()))
    }
}

#[tauri::command]
async fn set_export_directory(
    export_dir: State<'_, ExportDirectory>,
    path: String,
) -> Result<(), String> {
    let mut dir = export_dir.0.lock().unwrap();
    *dir = Some(PathBuf::from(path));
    Ok(())
}

#[tauri::command]
async fn get_export_directory(export_dir: State<'_, ExportDirectory>) -> Result<String, String> {
    let dir = export_dir.0.lock().unwrap();
    match dir.as_ref() {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => {
            // Default to Documents directory
            if let Some(docs_dir) = dirs::document_dir() {
                Ok(docs_dir.to_string_lossy().to_string())
            } else {
                Err("Unable to determine default export directory".to_string())
            }
        }
    }
}

#[tauri::command]
async fn show_item_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(std::path::Path::new(&path).parent().unwrap_or(std::path::Path::new("/")))
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
async fn check_file_exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

#[tauri::command]
async fn create_window(app: AppHandle) -> Result<(), String> {
    create_window_internal(&app)
}

fn get_unique_filename(directory: &Path, filename: &str) -> Result<String, String> {
    let path = Path::new(filename);
    let stem = path.file_stem().unwrap_or_default().to_string_lossy();
    let extension = path.extension().map(|ext| format!(".{}", ext.to_string_lossy())).unwrap_or_default();
    
    let mut final_path = directory.join(filename);
    let mut counter = 1;
    
    while final_path.exists() {
        let new_name = format!("{} ({}){}", stem, counter, extension);
        final_path = directory.join(&new_name);
        counter += 1;
    }
    
    Ok(final_path.file_name().unwrap().to_string_lossy().to_string())
}

fn create_window_internal(app: &AppHandle) -> Result<(), String> {
    let geometry = load_window_geometry(app);
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();
    let label = format!("ephemtext-{}", timestamp);

    let mut builder = WebviewWindowBuilder::new(app, label, WebviewUrl::App("/".into()))
        .title("Ephemeral Text")
        .min_inner_size(400.0, 300.0)
        .decorations(false);

    if let Some(geometry) = geometry {
        builder = builder
            .inner_size(geometry.width as f64, geometry.height as f64)
            .position(geometry.x as f64, geometry.y as f64);
    } else {
        builder = builder.inner_size(800.0, 600.0).center();
    }

    let window = builder.build().map_err(|e| e.to_string())?;

    for (existing_label, existing_window) in app.webview_windows() {
        if existing_label != window.label() {
            let _ = existing_window.close();
        }
    }

    Ok(())
}


fn window_geometry_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("window-geometry.json"))
}

fn load_window_geometry(app: &AppHandle) -> Option<WindowGeometry> {
    let path = window_geometry_path(app).ok()?;
    let contents = fs::read_to_string(path).ok()?;
    serde_json::from_str(&contents).ok()
}

fn save_window_geometry(app: &AppHandle, geometry: &WindowGeometry) -> Result<(), String> {
    let path = window_geometry_path(app)?;
    let contents = serde_json::to_string(geometry).map_err(|e| e.to_string())?;
    fs::write(path, contents).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let new_window = MenuItem::with_id(app, "new_window", "New Window", true, Some("CmdOrCtrl+N"))?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, Some("CmdOrCtrl+Q"))?;
            let app_menu = Submenu::with_items(app, "Ephemeral Text", true, &[&new_window, &quit])?;
            let menu = Menu::with_items(app, &[&app_menu])?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            match event.id().as_ref() {
                "new_window" => {
                    let _ = create_window_internal(app);
                }
                "quit" => {
                    let exit_state = app.state::<ExitState>();
                    exit_state.0.store(true, Ordering::SeqCst);
                    app.exit(0);
                }
                _ => {}
            }
        })
        .manage(ExportDirectory::default())
        .manage(ExitState(AtomicBool::new(false)))
        .invoke_handler(tauri::generate_handler![
            save_file,
            select_export_directory,
            set_export_directory,
            get_export_directory,
            show_item_in_folder,
            check_file_exists,
            create_window
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, event| {
        match event {
            tauri::RunEvent::Ready => {
                if let Some(geometry) = load_window_geometry(app_handle) {
                    if let Some(window) = app_handle.get_webview_window("main") {
                        let _ = window.set_size(PhysicalSize::new(geometry.width, geometry.height));
                        let _ = window.set_position(PhysicalPosition::new(geometry.x, geometry.y));
                    }
                }
            }
            tauri::RunEvent::WindowEvent { label, event, .. } => {
                if matches!(event, tauri::WindowEvent::Moved(_) | tauri::WindowEvent::Resized(_)) {
                    if let Some(window) = app_handle.get_webview_window(&label) {
                        if let (Ok(position), Ok(size)) = (window.outer_position(), window.inner_size()) {
                            let geometry = WindowGeometry {
                                x: position.x,
                                y: position.y,
                                width: size.width,
                                height: size.height,
                            };
                            let _ = save_window_geometry(app_handle, &geometry);
                        }
                    }
                }
            }
            tauri::RunEvent::ExitRequested { api, .. } => {
                let exit_state = app_handle.state::<ExitState>();
                if !exit_state.0.load(Ordering::SeqCst) {
                    api.prevent_exit();
                }
            }
            _ => {}
        }
    });
}
