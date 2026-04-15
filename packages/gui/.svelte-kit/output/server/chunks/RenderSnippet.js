import { k as getContext, l as setContext } from "./renderer.js";
class PopupManager {
  parent;
  popup = void 0;
  ignoreClose = false;
  closeTimeout = null;
  constructor(parent) {
    this.parent = parent;
  }
  open = {
    snippet: (snippet, params, args, ref) => this.openPopup(RenderSnippet, { snippet, args: params }, args.pos, args.anchor, args.align, args.offset, ref),
    component: (component, params, args, ref) => this.openPopup(component, params, args.pos, args.anchor, args.align, args.offset, ref)
  };
  openPopup(component, params, event, anchor, align = "auto", offset, ref) {
    if (this.popup && ref !== void 0 && this.popup?.ref === ref) {
      return this.popup.promise;
    }
    if (this.popup) this.close();
    this.ignoreClose = true;
    setTimeout(() => this.ignoreClose = false, 100);
    let resolver = () => {
    };
    const promise = new Promise((resolve) => {
      resolver = resolve;
    });
    if (anchor) {
      if ("currentTarget" in anchor) {
        if (anchor.currentTarget === null) throw new Error("Could not resolve popup anchor.");
        if (!(anchor.currentTarget instanceof Element)) throw new Error("Could not resolve popup anchor.");
        anchor = anchor.currentTarget;
      }
    }
    setTimeout(
      () => this.popup = {
        component,
        params,
        resolver,
        promise,
        event,
        anchor,
        align,
        offset,
        ref
      },
      this.popup ? 200 : 0
    );
    return promise;
  }
  close() {
    if (this.popup && this.closeTimeout === null && !this.ignoreClose) {
      this.closeTimeout = window.setTimeout(
        () => {
          this.popup?.resolver(void 0);
          this.popup = void 0;
          this.closeTimeout = null;
        },
        10
      );
    }
  }
  closeRoot() {
    let rootManager = this;
    while (rootManager.parent) rootManager = rootManager.parent;
    rootManager.close();
  }
  resolve(result) {
    this.popup?.resolver(result);
    this.popup = void 0;
    this.closeTimeout = null;
  }
  resolveRoot(result) {
    let rootManager = this;
    while (rootManager.parent) rootManager = rootManager.parent;
    rootManager.resolve(result);
  }
}
const POPUP_MANAGER_KEY = "atom-forge:popup-manager";
function setPopupManager(popupManager) {
  setContext(POPUP_MANAGER_KEY, popupManager);
}
function getPopupManager() {
  return getContext(POPUP_MANAGER_KEY);
}
function createPopupManager(parent) {
  let popupManager = new PopupManager(parent);
  setPopupManager(popupManager);
  return popupManager;
}
function RenderSnippet($$renderer, $$props) {
  let { snippet, args } = $$props;
  snippet($$renderer, args);
  $$renderer.push(`<!---->`);
}
export {
  RenderSnippet as R,
  createPopupManager as c,
  getPopupManager as g
};
