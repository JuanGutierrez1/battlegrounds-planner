// Puente seguro entre el proceso principal y la ventana del overlay (window.bgOverlay).
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('bgOverlay', {
  onUpdate(callback) {
    const listener = (_event, update) => callback(update)
    ipcRenderer.on('bg-update', listener)
    ipcRenderer.send('overlay-ready')
    return () => ipcRenderer.removeListener('bg-update', listener)
  },
  enableLogConfig: () => ipcRenderer.invoke('enable-log-config'),
  close: () => ipcRenderer.send('overlay-close'),
})
