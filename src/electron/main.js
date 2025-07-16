import { app, BrowserWindow } from "electron";
import path from "path";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    fullscreen: false,
    minimizable: false,
    autoHideMenuBar: true,
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
});