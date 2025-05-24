import { ipcRenderer } from 'electron';

window['abyss-updater'] = {
    // Trigger the update check
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

    // Listen for the "update-available" event
    onUpdateAvailable: callback => {
        ipcRenderer.on('update-available', (_event, info) => callback(info));
    },

    onUpdateNotAvailable: callback => {
        ipcRenderer.on('update-not-available', (_event, info) => callback(info));
    },

    onUpdaterError: callback => {
        ipcRenderer.on('updator-error', (_event, info) => callback(info));
    },

    // Listen for download progress events
    onDownloadProgress: callback => {
        ipcRenderer.on('download-progress', (_event, progress) => callback(progress));
    },

    // Listen for when the update has been downloaded
    onUpdateDownloaded: callback => {
        ipcRenderer.on('update-downloaded', (_event, info) => callback(info));
    },

    // Trigger the restart to install the update
    restartToUpdate: () => ipcRenderer.invoke('restart-to-update'),
};
