// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loginUser: (data) => ipcRenderer.invoke("login-user", data),
  registerUser: (data) => ipcRenderer.invoke("register-user", data),
  getProducts: (page, pageSize, filters) =>
    ipcRenderer.invoke("get-products", { page, pageSize, filters }),
  getCategories: () => ipcRenderer.invoke("get-categories"),
  addProduct: (product) => ipcRenderer.invoke("add-product", product),
  editProduct: (product) => ipcRenderer.invoke("edit-product", product),
  deleteProduct: (id) => ipcRenderer.invoke("delete-product", id),
  getProductById: (id) => ipcRenderer.invoke("get-product-by-id", id),
  addCategory: (name) => ipcRenderer.invoke("add-category", name),
});
