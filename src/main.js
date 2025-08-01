import { app, BrowserWindow } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
const { ipcMain } = require("electron");
import { loginUser, registerUser } from "./handlers/auth.js";
import {
  getProducts,
  getCategories,
  addProduct,
  editProduct,
  deleteProduct,
  getProductById,
  addCategory,
  getAllProducts,
  saveTransaction,
} from "./handlers/products.js";
import db from "./db/db.js";

ipcMain.handle("login-user", (event, credentials) => {
  return loginUser(credentials);
});
ipcMain.handle("register-user", (event, credentials) => {
  return registerUser(credentials);
});
ipcMain.handle("get-products", (event, { page, pageSize, filters }) => {
  return getProducts(page, pageSize, filters);
});
ipcMain.handle("get-categories", () => {
  return getCategories();
});
ipcMain.handle("add-product", (event, product) => {
  return addProduct(product);
});
ipcMain.handle("edit-product", (event, product) => {
  return editProduct(product);
});
ipcMain.handle("delete-product", (event, id) => {
  return deleteProduct(id);
});
ipcMain.handle("get-product-by-id", (event, id) => {
  return getProductById(id);
});
ipcMain.handle("add-category", (event, name) => {
  return addCategory(name);
});
ipcMain.handle("get-all-products", () => {
  return getAllProducts();
});
ipcMain.handle("save-transaction", (event, data) => {
  return saveTransaction(data);
});
ipcMain.handle("get-username-by-id", (event, id) => {
  try {
    const user = db.prepare("SELECT username FROM users WHERE id = ?").get(id);
    return user ? user.username : "Guest";
  } catch (err) {
    return "Guest";
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
