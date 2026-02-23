import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { createFocusTrap } from "focus-trap";
import { contains } from "@fluorescent/dom";

import { animateDrawerMenu } from "@/scripts/lib/animation";
import { on, emit } from "@/scripts/glow/events";

const sel = {
  menuButton: ".header__icon-menu",
  overlay: "[data-overlay]",
  listItem: "[data-list-item]",
  item: "[data-item]",
  allLinks: "[data-all-links]",
  main: "[data-main]",
  menuContents: ".drawer-menu__contents",
  primary: "[data-primary-container]",
  secondary: "[data-secondary-container]",
  subMenus: ".drawer-menu__list--sub",
  footer: "[data-footer]",
  close: "[data-close-drawer]",
  logo: ".drawer-menu__logo",
  // Cross border
  form: ".drawer-menu__form",
  localeInput: "[data-locale-input]",
  currencyInput: "[data-currency-input]",
};

const classes = {
  active: "active",
  visible: "visible",
  countrySelector: "drawer-menu__list--country-selector",
};

// Extra space we add to the height of the inner container
const formatHeight = h => h + 8 + "px";

const menu = node => {
  const drawerMenuAnimation = animateDrawerMenu(node);
  // Entire links container
  let primaryDepth = 0;
  // The individual link list the merchant selected
  let linksDepth = 0;

  let scrollPosition = 0;

  const focusTrap = createFocusTrap(node, { allowOutsideClick: true });

  const overlay = node.querySelector(sel.overlay);
  overlay.addEventListener("click", close);

  const menuContents = node.querySelector(sel.menuContents);
  const menuButton = document.querySelector(sel.menuButton);

  // Element that holds all links, primary and secondary
  const everything = node.querySelector(sel.allLinks);

  // This is the element that holds the one we move left and right (primary)
  // We also need to assign its height initially so we get smooth transitions
  const main = node.querySelector(sel.main);

  // Element that holds all the primary links and moves left and right
  const primary = node.querySelector(sel.primary);
  const secondary = node.querySelector(sel.secondary);

  // Cross border
  const form = node.querySelector(sel.form);
  const localeInput = node.querySelector(sel.localeInput);
  const currencyInput = node.querySelector(sel.currencyInput);

  // quick-search listener
  const quickSearchListener = on("search:open", () => {
    if (contains(node, classes.active)) close();
  });

  // Every individual menu item
  const items = node.querySelectorAll(sel.item);
  items.forEach(item => item.addEventListener("click", handleItem));

  function handleItem(e) {
    const { item } = e.currentTarget.dataset;
    // Standard link that goes to a different url
    if (item === "link") return;
    e.preventDefault();

    switch (item) {
      // Element that will navigate to child navigation list
      case "parent":
        clickParent(e);
        break;
      // Element that will navigate back up the tree
      case "back":
        clickBack(e);
        break;
      // Account, currency, and language link at the bottom
      case "viewCurrency":
      case "viewLanguage":
        handleLocalizationClick(e);
        break;
      // Back link within 'Currency' or 'Language'
      case "secondaryHeading":
        handleSecondaryHeading(e);
        break;
      // Individual language
      case "locale":
        handleLanguageChoice(e);
        break;
      // Individual currency
      case "currency":
        handleCurrencyChoice(e);
        break;
    }
  }

  function getMainHeight() {
    let mainHeight = primary.offsetHeight;
    if (secondary) {
      mainHeight += secondary.offsetHeight;
    }
    return mainHeight;
  }

  function open() {
    emit("drawer-menu:open");
    node.classList.add(classes.active);
    document.body.setAttribute("mobile-menu-open", "true");
    menuButton.setAttribute("aria-expanded", true);
    menuButton.setAttribute(
      "aria-label",
      menuButton.getAttribute("data-aria-label-opened")
    );

    setTimeout(() => {
      focusTrap.activate();
      node.classList.add(classes.visible);
      document.body.setAttribute("data-fluorescent-overlay-open", "true");

      disableBodyScroll(node, {
        hideBodyOverflow: true,
        allowTouchMove: el => {
          while (el && el !== document.body && el.id !== "main-content") {
            if (el.getAttribute("data-scroll-lock-ignore") !== null) {
              return true;
            }
            el = el.parentNode;
          }
        },
      });

      scrollPosition = window.pageYOffset;
      document.body.style.top = `-${scrollPosition}px`;
      document.body.classList.add("scroll-lock");

      if (primaryDepth === 0 && linksDepth === 0) {
        // const mainHeight = getMainHeight();
        // main.style.height = formatHeight(mainHeight);
        drawerMenuAnimation.open();
      }
    }, 50);
  }

  function close(e) {
    menuButton.setAttribute("aria-expanded", false);
    menuButton.setAttribute(
      "aria-label",
      menuButton.getAttribute("data-aria-label-closed")
    );

    e && e.preventDefault();
    focusTrap.deactivate();

    node.classList.remove(classes.visible);
    document.body.setAttribute("mobile-menu-open", "false");
    const childMenus = node.querySelectorAll(sel.subMenus);
    childMenus.forEach(childMenu => {
      childMenu.classList.remove(classes.visible);
      childMenu.setAttribute("aria-hidden", true);
    });

    setTimeout(() => {
      node.classList.remove(classes.active);
      document.body.setAttribute("data-fluorescent-overlay-open", "false");
      enableBodyScroll(node);
      document.body.classList.remove("scroll-lock");
      document.body.style.top = "";
      window.scrollTo(0, scrollPosition);
      navigate(0);
      drawerMenuAnimation.close();
    }, 350);
  }

  function clickParent(e) {
    e.preventDefault();
    const parentLink = e.currentTarget;
    parentLink.ariaExpanded = "true";

    const childMenu = parentLink.nextElementSibling;

    childMenu.classList.add(classes.visible);
    childMenu.setAttribute("aria-hidden", false);
    // main.style.height = formatHeight(childMenu.offsetHeight);

    menuContents.scrollTo(0, 0);

    navigate((linksDepth += 1));
  }

  function navigate(depth) {
    linksDepth = depth;
    primary.setAttribute("data-depth", depth);
    everything.setAttribute("data-depth", depth);
    everything.setAttribute("data-in-initial-position", depth === 0);
  }

  function navigatePrimary(depth) {
    primaryDepth = depth;
    everything.setAttribute("data-depth", depth);
    everything.setAttribute("data-in-initial-position", depth === 0);
  }

  function clickBack(e) {
    e.preventDefault();

    // const menuBefore = e.currentTarget.closest(sel.listItem).closest("ul");

    // let height = menuBefore.offsetHeight;
    // if (menuBefore == primary) {
    //   height = getMainHeight();
    // }

    // main.style.height = formatHeight(height);

    const parent = e.currentTarget.closest("ul");
    parent.classList.remove(classes.visible);

    const parentLink = parent.previousElementSibling;
    parentLink.ariaExpanded = "false";

    navigate((linksDepth -= 1));
  }

  function handleLocalizationClick(e) {
    e.preventDefault();
    navigatePrimary(1);
    const childMenu = e.currentTarget.nextElementSibling;
    childMenu.classList.add(classes.visible);
  }

  function handleSecondaryHeading(e) {
    e?.preventDefault();
    navigatePrimary(0);

    const parent = e.currentTarget.closest("ul");
    parent.classList.remove(classes.visible);
  }

  function handleCrossBorderChoice(e, input) {
    const { value } = e.currentTarget.dataset;
    input.value = value;
    close();
    form.submit();
  }

  function handleKeyboard(e) {
    if (!node.classList.contains(classes.visible)) return;

    if (e.key == "Escape" || e.keyCode === 27) {
      close();
    }
  }

  const handleLanguageChoice = e => handleCrossBorderChoice(e, localeInput);
  const handleCurrencyChoice = e => handleCrossBorderChoice(e, currencyInput);

  window.addEventListener("keydown", handleKeyboard);

  function destroy() {
    overlay.removeEventListener("click", close);
    // closeBtn.removeEventListener('click', close);
    // searchLink.removeEventListener('click', openSearch);
    items.forEach(item => item.removeEventListener("click", handleItem));
    enableBodyScroll(node);
    document.body.classList.remove("scroll-lock");
    document.body.style.top = "";
    window.scrollTo(0, scrollPosition);
    window.removeEventListener("keydown", handleKeyboard);
    quickSearchListener();
  }

  return { close, destroy, open };
};

export default menu;
