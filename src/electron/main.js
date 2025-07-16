import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    fullscreen: false,
    minimizable: false,
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
});

ipcMain.on("quit-app", () => {
  app.quit();
});
