import { k as getContext, l as setContext } from "./renderer.js";
class ToastManager {
  toasts = [];
  show(message, options) {
    const id = Math.random().toString(36).slice(2);
    const newToast = { id, message, options };
    this.toasts = [...this.toasts, newToast];
    if (options?.duration !== 0) {
      setTimeout(() => this.dismiss(id), options?.duration || 3e3);
    }
    return id;
  }
  dismiss(id) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
  }
  // For custom toast components (advanced usage)
  showCustom(component, props, options) {
    const id = Math.random().toString(36).slice(2);
    const newToast = { id, message: "", options, component, props };
    this.toasts = [...this.toasts, newToast];
    if (options?.duration !== 0) {
      setTimeout(() => this.dismiss(id), options?.duration || 3e3);
    }
    return id;
  }
}
const KEY = "atom-forge:toast-manager";
function createToastManager() {
  const manager = new ToastManager();
  setToastManager(manager);
  return manager;
}
const getToastManager = () => getContext(KEY);
const setToastManager = (manager) => setContext(KEY, manager);
export {
  createToastManager as c,
  getToastManager as g
};
