import Delegate from "ftdomdelegate";
import {
  listen,
  qs,
  qsa,
  add,
  remove,
  toggle,
  contains,
} from "@fluorescent/dom";
import { emit } from "@/scripts/glow/events";
import { animateMeganav, shouldAnimate } from "@/scripts/lib/animation";

export default function Navigation(node, headerSection) {
  if (!node) return;

  const dropdownTriggers = qsa("[data-dropdown-trigger]", node);
  const meganavTriggers = qsa("[data-meganav-trigger]", node);
  const meganavs = qsa(".meganav, node");
  const nonTriggers = qsa(
    ".header__links-list > li > [data-link]:not([data-meganav-trigger]):not([data-dropdown-trigger])",
    node
  );
  const header = qs('[data-section-type="header"]', document.body);
  const primaryRow = qs(".header__links-primary", header);
  const submenuItem = qs(
    ".navigation__submenu .navigation__submenu-item",
    node
  );

  if (!dropdownTriggers) return;

  // Set submenu item height for submenu depth 2 offset
  if (submenuItem) {
    node.style.setProperty(
      "--submenu-item-height",
      `${submenuItem.clientHeight}px`
    );
  }

  const delegate = new Delegate(document.body);
  delegate.on("click", null, e => handleClick(e));
  delegate.on("mouseover", ".header-overlay__inner", e => {
    if (Shopify.designMode && headerSection.meganavOpenedFromDesignMode) {
      // Closing on shade overlay is too finicky when opened via block
      return;
    }
    closeAll(node);
  });

  meganavs.forEach(nav => {
    if (shouldAnimate(nav)) {
      animateMeganav(nav);
    }
  });

  const events = [
    listen(dropdownTriggers, "focus", e => {
      e.preventDefault();
      toggleMenu(e.currentTarget.parentNode);
    }),

    listen(dropdownTriggers, "mouseover", e => {
      e.preventDefault();
      toggleMenu(e.currentTarget.parentNode, true);
    }),

    listen(meganavTriggers, "focus", e => {
      e.preventDefault();
      showMeganav(e.target, e.target.dataset.meganavHandle);
    }),

    listen(meganavTriggers, "mouseover", e => {
      e.preventDefault();
      showMeganav(e.target, e.target.dataset.meganavHandle);
    }),

    listen(nonTriggers, "mouseover", () => {
      closeAll();
    }),

    listen(primaryRow, "mouseout", e => {
      let isMousingOutOfPrimaryRow =
        e.relatedTarget?.closest(".header__links-primary") != primaryRow;
      if (isMousingOutOfPrimaryRow) {
        closeAll();
      }
    }),

    listen(headerSection.container, "mouseleave", () => {
      remove(header, "animation--dropdowns-have-animated-once");
      remove(header, "animation--dropdowns-have-animated-more-than-once");
    }),

    listen(node, "keydown", ({ keyCode }) => {
      if (keyCode === 27) closeAll();
    }),

    listen(qsa(".header__links-list > li > a", node), "focus", () => {
      if (!userIsUsingKeyboard()) return;
      closeAll();
    }),

    listen(qsa("[data-link]", node), "focus", e => {
      e.preventDefault();

      if (!userIsUsingKeyboard()) return;

      const link = e.currentTarget;

      if (link.hasAttribute("data-dropdown-trigger")) {
        toggleMenu(link.parentNode);
      }

      const siblings = qsa("[data-link]", link.parentNode.parentNode);
      siblings.forEach(el =>
        toggle(qsa("[data-submenu]", el.parentNode), "active", el === link)
      );
    }),

    // Close everything when focus leaves the main menu and NOT into a meganav
    listen(qsa("[data-link]", node), "focusout", e => {
      if (!userIsUsingKeyboard()) return;

      if (
        e.relatedTarget &&
        !(
          e.relatedTarget.hasAttribute("data-link") ||
          e.relatedTarget.closest(".meganav")
        )
      ) {
        closeAll();
      }
    }),

    // Listen to horizontal scroll to offset inner menus
    listen(node, "scroll", () => {
      document.documentElement.style.setProperty(
        "--navigation-menu-offet",
        `${node.scrollLeft}px`
      );
    }),
  ];

  function userIsUsingKeyboard() {
    return contains(document.body, "user-is-tabbing");
  }

  function showMeganav(menuTrigger, handle) {
    const menu = qs(`.meganav[data-menu-handle="${handle}"]`, header);

    if (!menu || contains(menu, "active")) return;

    closeAll(undefined, { avoidShadeHide: true });

    menuTrigger.setAttribute("aria-expanded", true);

    if (menu.dataset.alignToTrigger) {
      alignMenuToTrigger(menu, menuTrigger);
    }

    menu.setAttribute("aria-hidden", false);
    add(header, "dropdown-active");
    add(menu, "active");
    emit("headerOverlay:show");
  }

  function alignMenuToTrigger(menu, menuTrigger) {
    if (menuTrigger) {
      const menuPositionLeft = menuTrigger.offsetLeft;

      menu.style.left = `${menuPositionLeft}px`;
      add(menu, "customAlignment");
    }
  }

  function alignSubmenu(menu, parentSubmenu) {
    const viewportWidth = window.innerWidth;
    const parentSubmenuRightPosition =
      parentSubmenu?.getBoundingClientRect()?.right;
    const availableSpace = viewportWidth - parentSubmenuRightPosition - 24;
    const menuWidth = menu.offsetWidth;

    availableSpace < menuWidth
      ? (menu.dataset.position = "left")
      : (menu.dataset.position = "right");
  }

  function toggleMenu(el, force) {
    const menu = qs("[data-submenu]", el);
    const menuTrigger = qs("[data-link]", el);
    const parentSubmenu = el.closest("[data-submenu]");

    let action;
    if (force) {
      action = "open";
    } else if (force !== undefined) {
      action = "close";
    }

    if (!action) {
      action = contains(menu, "active") ? "close" : "open";
    }

    if (action === "open") {
      // Make sure all lvl 2 submenus are closed before opening another
      if (parentSubmenu?.dataset.depth === "1") {
        closeAll(parentSubmenu, { avoidShadeHide: true });
      } else {
        closeAll(undefined, { avoidShadeHide: true });
      }
      showMenu(el, menuTrigger, menu);
    }

    if (action == "close") {
      hideMenu(el, menuTrigger, menu);
    }
  }

  function showMenu(el, menuTrigger, menu) {
    menuTrigger.setAttribute("aria-expanded", true);
    menu.setAttribute("aria-hidden", false);

    const depth = parseInt(menu.dataset.depth, 10);
    const childSubmenu = qsa('[data-depth="2"]', el);

    if (depth === 1) {
      alignMenuToTrigger(menu, menuTrigger);
    }

    if (depth === 1 && childSubmenu.length) {
      childSubmenu.forEach(sub => alignSubmenu(sub, menu));
    }

    add(menu, "active");
    add(header, "dropdown-active");
    emit("headerOverlay:show");
  }

  function hideMenu(el, menuTrigger, menu) {
    // If the toggle is closing the element from the parent close all internal
    if (contains(el.parentNode, "header__links-list")) {
      closeAll();
      return;
    }
    menuTrigger.setAttribute("aria-expanded", false);
    menu.setAttribute("aria-hidden", true);
    remove(menu, "active");
  }

  // We want to close the menu when anything is clicked that isn't a submenu
  function handleClick(e) {
    if (
      !e.target.closest("[data-submenu-parent]") &&
      !e.target.closest(".meganav") &&
      !e.target.closest("[data-search]") &&
      !e.target.closest("[data-quick-search]")
    ) {
      closeAll();
    }
  }

  function closeAll(target = node, options = {}) {
    const subMenus = qsa("[data-submenu]", target);
    const parentTriggers = qsa("[data-parent], [data-link]", target);

    remove(subMenus, "active");
    subMenus.forEach(sub => sub.setAttribute("aria-hidden", true));
    parentTriggers.forEach(trig => trig.setAttribute("aria-expanded", false));
    remove(header, "dropdown-active");

    if (!options.avoidShadeHide) {
      emit("headerOverlay:hide");
    }
  }

  function destroy() {
    delegate.off();
    events.forEach(evt => evt());
  }

  return { destroy };
}
