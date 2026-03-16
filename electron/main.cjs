const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
const isContainer = Boolean(process.env.CODESPACES || process.env.CI || process.env.CONTAINER);

if (isContainer) {
  // Avoid GPU init failures in headless/containerized sessions.
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    if (!isContainer) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
