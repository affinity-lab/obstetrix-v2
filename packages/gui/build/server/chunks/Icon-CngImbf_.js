import { r as run, s as spread_props } from './renderer-Dl7nK692.js';
import { t as twMerge } from './bundle-mjs-xhk8uJeD.js';

const ICON_STROKE_DEFAULT = 4;
function defineIcon(icon, stroke = ICON_STROKE_DEFAULT) {
  return new IconDefiner(icon, stroke);
}
class IconDefiner {
  get component() {
    return this._component;
  }
  get stroke() {
    return this._stroke;
  }
  get classes() {
    return this._classes;
  }
  _component;
  _stroke;
  _classes = "";
  constructor(icon, stroke = ICON_STROKE_DEFAULT) {
    if (icon instanceof IconDefiner) {
      this._component = icon.component;
      this._stroke = stroke !== ICON_STROKE_DEFAULT ? stroke : icon.stroke;
      this._classes = icon.classes;
    } else {
      this._component = icon;
      this._stroke = stroke;
    }
  }
  class(classes) {
    this._classes = classes;
    return this;
  }
  setStroke(stroke) {
    this._stroke = stroke;
    return this;
  }
}
function Icon($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      icon,
      size,
      pxSize,
      stroke: strokeProp,
      class: classes,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const stroke = run(() => icon instanceof IconDefiner ? icon.stroke : strokeProp ? parseInt(strokeProp + "") : 4);
    const strokeWidth = run(() => (0.5 + (stroke - 1) * 0.25).toString());
    pxSize = run(() => typeof pxSize !== "number" && pxSize ? parseInt(pxSize) : pxSize);
    size = run(() => typeof size !== "number" && size ? parseInt(size) : size);
    pxSize = run(() => size === void 0 && pxSize === void 0 ? 20 : pxSize ?? (size ? size * 4 : 20));
    if (icon) {
      $$renderer2.push("<!--[0-->");
      const Component = icon instanceof IconDefiner ? icon.component : icon;
      if (Component) {
        $$renderer2.push("<!--[-->");
        Component($$renderer2, spread_props([
          {
            size: pxSize,
            class: icon instanceof IconDefiner ? twMerge(classes, icon.classes) : classes,
            stroke: strokeWidth,
            strokeWidth
          },
          props
        ]));
        $$renderer2.push("<!--]-->");
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push("<!--]-->");
      }
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}

export { Icon as I, defineIcon as d };
//# sourceMappingURL=Icon-CngImbf_.js.map
