// main.js
const path = require('path');
const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const fs = require('fs').promises;

async function getUniqueFilename(directory, filename) {
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    let finalPath = path.join(directory, filename);
    let counter = 1;

    try {
        while (await fs.access(finalPath).then(() => true).catch(() => false)) {
            const newName = `${basename} (${counter})${ext}`;
            finalPath = path.join(directory, newName);
            counter++;
        }
        return path.basename(finalPath);
    } catch (error) {
        console.error('Error in getUniqueFilename:', error);
        return filename;
    }
}

if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`)
    });
}

let mainWindow = null;

function createApplicationMenu() {
    const isMac = process.platform === 'darwin';
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Export Directory',
                    accelerator: 'CmdOrCtrl+E',
                    click: async () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('show-export-directory-modal');
                        }
                    }
                }
            ]
        },
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                {
                    label: 'New Window',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        if (!mainWindow) {
                            mainWindow = createWindow();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Close Window',
                    accelerator: 'CmdOrCtrl+W',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.close();
                        }
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        }
    ];

    // Add View menu with developer tools in development mode
    if (process.env.NODE_ENV === 'development') {
        template.push({
            label: 'View',
            submenu: [
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        });
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('ready', () => {
    app.setName('EphemText');
    createApplicationMenu();
    mainWindow = createWindow();
});

// Close the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        mainWindow = createWindow();
    }
});

// Function to create the main window
function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        frame: false,
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    window.loadFile('index.html');

    window.on('closed', () => {
        mainWindow = null;
    });

    return window;
}

// Export directory setup
let exportDirectory = app.getPath('documents');

function setupExportEvents() {
    ipcMain.handle('get-directory-contents', async (event, dirPath) => {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            const contents = await Promise.all(items.map(async item => {
                return {
                    name: item.name,
                    isDirectory: item.isDirectory(),
                    path: path.join(dirPath, item.name)
                };
            }));
            return contents;
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    });

    ipcMain.handle('set-export-directory', async (event, dirPath) => {
        exportDirectory = dirPath;
        return true;
    });

    ipcMain.handle('select-export-directory', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            title: 'Select Export Directory'
        });

        if (!canceled && filePaths.length > 0) {
            exportDirectory = filePaths[0];
            return exportDirectory;
        }
        return null;
    });

    ipcMain.handle('get-export-directory', () => {
        return exportDirectory;
    });
}

// File saving handler
ipcMain.handle('save-file', async (event, directory, filename, content) => {
    try {
        const uniqueFilename = await getUniqueFilename(directory, filename);
        const fullPath = path.join(directory, uniqueFilename);
        await fs.writeFile(fullPath, content, 'utf8');
        return { success: true, path: fullPath };
    } catch (error) {
        console.error('Error saving file:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Call this in your app initialization
// Window control handlers
ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
});

ipcMain.on('exit-fullscreen', () => {
    if (mainWindow && mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
    }
});

ipcMain.handle('is-fullscreen', () => {
    return mainWindow ? mainWindow.isFullScreen() : false;
});

// Show item in folder handler
ipcMain.handle('show-item-in-folder', async (event, path) => {
    shell.showItemInFolder(path);
});

// File existence checker
ipcMain.handle('checkFileExists', async (event, filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
});

setupExportEvents();
