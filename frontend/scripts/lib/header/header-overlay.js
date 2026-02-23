import { on, emit, hydrate } from "@/scripts/glow/events";

const selectors = {
  innerOverlay: ".header-overlay__inner",
};

const classes = {
  isVisible: "is-visible",
  isActive: "is-active",
};

export const events = {
  show: "headerOverlay:show",
  hide: "headerOverlay:hide",
  hiding: "headerOverlay:hiding",
};

const headerOverlay = node => {
  if (!node) return;
  const overlay = node;
  const overlayInner = node.querySelector(selectors.innerOverlay);

  const overlayShowListener = on(events.show, () => _showOverlay());
  const overlayHideListener = on(events.hide, () => _hideOverlay());

  const _showOverlay = () => {
    hydrate({ headerOverlayOpen: true });
    overlay.classList.add(classes.isActive);
    overlayInner.classList.add(classes.isVisible);
  };

  const _hideOverlay = () => {
    hydrate({ headerOverlayOpen: false });
    emit(events.hiding);
    overlayInner.classList.remove(classes.isVisible);
    overlay.classList.remove(classes.isActive);
  };

  const unload = () => {
    overlayShowListener();
    overlayHideListener();
  };

  return { unload };
};

export default headerOverlay;
