const { app, BrowserWindow } = require("electron");
const path = require("path");
const PORT = 3000; // Our fixed port

function createWindow() {
  const win = new BrowserWindow({
    title: "BFT Monitoring App",
    width: 1200,
    height: 800,
    icon: path.resolve(__dirname, "public/icons/kemalak.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true, 
    },
  });

  // Load your Next.js (frontend) app
  win.loadURL(`http://localhost:${PORT}`);


}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
