const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static').path;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'resources', 'ico.ico')  // Asegúrate de que esta línea esté configurada
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  const menuTemplate = [
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/tamago0022/XMute');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('remove-audio', (event, filePath) => {
  const outputFilePath = filePath.replace(/\.(\w+)$/, '-no-audio.$1');
  const ffmpegExecutablePath = app.isPackaged ? path.join(process.resourcesPath, 'ffmpeg.exe') : ffmpegPath;

  ffmpeg(filePath)
    .setFfmpegPath(ffmpegExecutablePath)
    .outputOptions('-an')
    .save(outputFilePath)
    .on('end', () => {
      event.sender.send('audio-removed', outputFilePath);
    });
});
