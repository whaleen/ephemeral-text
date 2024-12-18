// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    windowControls: {
        minimize: () => ipcRenderer.send('window-minimize'),
        maximize: () => ipcRenderer.send('window-maximize'),
        close: () => ipcRenderer.send('window-close'),
        toggleFullScreen: () => ipcRenderer.send('toggle-fullscreen'),
        exitFullscreen: () => ipcRenderer.send('exit-fullscreen'),
        isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
    },
    registerKeyboardShortcuts: () => {
        window.addEventListener('keydown', (event) => {
            if (event.metaKey) {
                // Command+W for new window
                if (event.key === 'n') {
                    ipcRenderer.send('new-window');
                }
            }
        });
    },
    // Export directory methods
    selectExportDirectory: () => ipcRenderer.invoke('select-export-directory'),
    setExportDirectory: (dirPath) => ipcRenderer.invoke('set-export-directory', dirPath),
    getExportDirectory: () => ipcRenderer.invoke('get-export-directory'),
    saveFile: (directory, filename, content) => ipcRenderer.invoke('save-file', directory, filename, content),
    showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
    checkFileExists: (path) => ipcRenderer.invoke('checkFileExists', path)
});
