import { add, listen, qs, qsa, remove, toggle } from '@fluorescent/dom'
import scrollContainer from '@/scripts/lib/scroll-container'

import section from '@/scripts/glow/section'
import { on } from 'evx'
import { emit } from 'evx'
import preventDefault from '@/scripts/utils/prevent-default'
import provideResizeObserver from '@/scripts/utils/provide-resize-observer'
import cart from '@/scripts/glow/cart'

import QuickSearch from '@/scripts/lib/header/quick-search'
import Navigation from '@/scripts/lib/header/navigation'
import Menu from '@/scripts/lib/header/drawer-menu'
import PurchaseConfirmationPopup from '@/scripts/lib/header/purchase-confirmation-popup'
import Disclosure from '@/scripts/lib/disclosure'

function setHeaderHeightVar(height) {
  document.documentElement.style.setProperty(
    '--height-header',
    Math.ceil(height) + 'px',
  )
}

function setHeaderStickyTopVar(value) {
  document.documentElement.style.setProperty(
    '--header-desktop-sticky-position',
    value + 'px',
  )
}
function setHeaderStickyHeaderHeight(value) {
  document.documentElement.style.setProperty(
    '--header-desktop-sticky-height',
    value + 'px',
  )
}

const selectors = {
  disclosure: '[data-disclosure]',
}

const classes = {
  scrollHidden: 'header-scroll-hidden',
}

function scrollHideHeader(header) {
  let lastScrollY = window.scrollY
  let isHidden = false
  const scrollThreshold = 8
  const topOffset = 32
  const bottomOffset = 32

  function shouldPreventHide() {
    const scrollY = window.scrollY
    const atBottom =
      scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - bottomOffset

    return (
      document.body.classList.contains('scroll-lock') ||
      header.classList.contains('dropdown-active') ||
      atBottom
    )
  }

  function setHidden(hidden) {
    if (isHidden === hidden) return
    isHidden = hidden
    toggle(document.documentElement, classes.scrollHidden, hidden)
  }

  function onScroll() {
    const scrollY = window.scrollY

    if (shouldPreventHide()) {
      setHidden(false)
      lastScrollY = scrollY
      return
    }

    if (scrollY <= topOffset) {
      setHidden(false)
      lastScrollY = scrollY
      return
    }

    const delta = scrollY - lastScrollY

    if (Math.abs(delta) < scrollThreshold) {
      return
    }

    setHidden(delta > 0)
    lastScrollY = scrollY
  }

  return listen(window, 'scroll', onScroll)
}

section('header', {
  crossBorder: {},

  onLoad() {
    const { enableStickyHeader, transparentHeader, enableHideHeaderOnScroll } = this.container.dataset
    this.cartCounts = qsa('[data-js-cart-count]', this.container)
    const cartIcon = qsa('[data-js-cart-icon]', this.container)
    const menuButtons = qsa('[data-js-menu-button]', this.container)
    const searchButtons = qsa('[data-search]', this.container)
    const headerSpace = qs('[data-header-space]', document)
    const lowerBar = qs('.header__row-desktop.lower', this.container)

    this.meganavOpenedFromDesignMode = false

    const menu = Menu(qs('[data-drawer-menu]'))

    this.purchaseConfirmationPopup = PurchaseConfirmationPopup(
      qs('[data-purchase-confirmation-popup]', document),
    )
    const navigation = Navigation(qs('[data-navigation]', this.container), this)

    // This is done here AND in an inline script so it's responsive in the theme editor before this JS is loaded.
    document.body.classList.toggle('header-transparent', !!transparentHeader)
    document.documentElement.classList.toggle(
      'sticky-header-enabled',
      !!enableStickyHeader,
    )

    document.addEventListener('visibilitychange', function logData() {
      if (document.visibilityState === 'hidden' && navigator.sendBeacon) {
        // eslint-disable-next-line no-undef , no-process-env
        navigator.sendBeacon(process.env.FLU_PING_ENDPOINT, Shopify.shop)
      }
    })

    // These all return a function for cleanup
    this.listeners = [
      on('cart:updated', ({ cart }) => {
        this.updateCartCount(cart.item_count)
      }),

      listen(document, 'apps:product-added-to-cart', () => {
        cart.get().then((cart) => {
          this.updateCartCount(cart.item_count)
        })
      }),

      listen(cartIcon, 'click', (e) => {
        const quickShop = qs('.quick-cart', document)
        if (!quickShop) return

        e.preventDefault()
        emit('quick-cart:open')
      }),
    ]

    listen(menuButtons, 'click', function (event) {
      event.preventDefault()
      if (event.currentTarget.getAttribute('aria-expanded') == 'true') {
        menu.close()
      } else {
        menu.open()
      }
    })

    // Components return a destroy function for cleanup
    this.components = [menu]

    if (searchButtons.length > 0) {
      let quickSearch = QuickSearch(
        qs("[data-quick-search-desktop]"),
        this.container
      );

      // on("drawer-menu:open", () => {
      //   quickSearch = QuickSearch(
      //     qs("[data-quick-search-mobile]"),
      //     this.container
      //   );
      // })

      this.listeners.push(
        listen(searchButtons, "click", preventDefault(quickSearch.toggleSearch))
      );
      this.components.push(quickSearch);
    }

    // navigation only exists if the header style is Inline links
    navigation && this.components.push(navigation)

    if (enableStickyHeader) {
      // Our header is always sticky (with position: sticky) however at some
      // point we want to adjust the styling (eg. box-shadow) so we toggle
      // the is-sticky class when our arbitrary space element (.header__space)
      // goes in and out of the viewport.
      this.io = new IntersectionObserver(([{ isIntersecting: visible }]) => {
        toggle(this.container, 'is-sticky', !visible)
        toggle(document.documentElement, 'sticky-header-active', !visible)
      })
      this.io.observe(headerSpace)
    }

    if (enableHideHeaderOnScroll) {
      this.listeners.push(scrollHideHeader(this.container))
    }

    // This will watch the height of the header and update the --height-header
    // css variable when necessary. That var gets used for the negative top margin
    // to render the page body under the transparent header
    provideResizeObserver().then(({ ResizeObserver }) => {
      this.ro = new ResizeObserver(([{ target }]) => {
        const headerHeight = target.offsetHeight
        const lowerBarHeight = lowerBar.offsetHeight
        const lowerBarOffset = headerHeight - lowerBarHeight

        setHeaderHeightVar(
          target.getBoundingClientRect()
            ? target.getBoundingClientRect().height
            : target.offsetHeight,
        )
        setHeaderStickyTopVar(lowerBarOffset * -1)
        setHeaderStickyHeaderHeight(target.offsetHeight - lowerBarOffset)
      })
      this.ro.observe(this.container)
    })

    // Wire up Cross Border disclosures
    const cbSelectors = qsa(selectors.disclosure, this.container)

    if (cbSelectors) {
      cbSelectors.forEach((selector) => {
        const { disclosure: d } = selector.dataset
        this.crossBorder[d] = Disclosure(selector)
      })
    }

    this.navScroller = scrollContainer(
      qs('.header__links-primary-scroll-container', this.container),
    )
  },

  updateCartCount(itemCount) {
    this.cartCounts.forEach((cartCount) => {
      cartCount.innerHTML = itemCount
    })
  },

  onBlockSelect({ target }) {
    add(this.container, 'dropdown-active')
    add(target, 'active')
    this.meganavOpenedFromDesignMode = true
    this.showHeaderOverlay()
  },

  onBlockDeselect({ target }) {
    remove(this.container, 'dropdown-active')
    remove(target, 'active')
    this.meganavOpenedFromDesignMode = false
    this.hideHeaderOverlay()
  },

  onUnload() {
    this.listeners.forEach((l) => l())
    this.components.forEach((c) => c.destroy())

    this.io && this.io.disconnect()
    this.ro && this.ro.disconnect()
    remove(document.documentElement, classes.scrollHidden)

    Object.keys(this.crossBorder).forEach((t) => this.crossBorder[t].unload())
  },

  showHeaderOverlay() {
    emit('headerOverlay:show')
  },

  hideHeaderOverlay() {
    emit('headerOverlay:hide')
  },
})
