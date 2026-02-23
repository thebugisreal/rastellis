import Delegate from 'ftdomdelegate'
import { add, remove, qs, listen } from '@fluorescent/dom'
import { createFocusTrap } from 'focus-trap'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import section from '@/scripts/glow/section'
import cart from '@/scripts/glow/cart'
import { on } from 'evx'
import { makeRequest } from '@/scripts/lib/xhr'
import QuantityButtons from '@/scripts/lib/quantity-buttons'
import CartNoteToggle from '@/scripts/lib/cart-note-toggle'
import updateInnerHTML from '@/scripts/lib/update-inner-html'
import FreeShippingBar from '@/scripts/lib/free-shipping-bar'
import animateQuickCart from '@/scripts/lib/animation/quick-cart'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import CrossSells from '@/scripts/lib/cross-sells'
import dispatchCustomEvent from '@/scripts/lib/dispatch-custom-event'

const selectors = {
  cartWrapper: '.quick-cart__wrapper',
  innerContainer: '.quick-cart__container',
  overlay: '.quick-cart__overlay',
  closeButton: '.quick-cart__close-icon',
  footer: '.quick-cart__footer',
  items: '.quick-cart__items',
  cartError: '.quick-cart__item-error',
  form: '.quick-cart__form',
  cartCount: '.quick-cart__heading sup',
  subtotal: '.quick-cart__footer-subtotal span',
  quantityInput: '.quick-cart .quantity-input__input',
  quantityItem: '[data-input-item]',
  discounts: '.quick-cart__item-discounts',
  freeShippingBar: '[data-free-shipping-bar]',
  crossSells: '[data-cross-sells]',
}

const classes = {
  active: 'active',
  hidden: 'hidden',
  updatingQuantity: 'has-quantity-update',
  removed: 'is-removed',
}

const useCustomEvents = window.flu.states?.useCustomEvents

section('quick-cart', {
  onLoad() {
    this.cartWrapper = qs(selectors.cartWrapper, this.container)
    this.cartTrap = createFocusTrap(this.container, {
      allowOutsideClick: true,
    })

    // Events are all on events trigger by other components / functions
    this.events = [
      on('quick-cart:open', () => this.openQuickCart()),
      on('quick-cart:updated', () => this.refreshQuickCart()),
      on('quick-cart:error', (_, { key, errorMessage }) => {
        this.handleErrorMessage(key, errorMessage)
      }),
      on('quick-cart:scrollup', () => this.scrollUpQuickCart()),
      on(['quantity-update:subtract', 'quantity-update:add'], (_, { key }) => {
        this.handleQuantityUpdate(key)
      }),
      on('quantity-update:remove', (_, { key }) => {
        this.handleItemRemoval(key)
      }),
      listen(document, 'apps:product-added-to-cart', () => {
        this.refreshQuickCart()
      }),
    ]

    this.quantityButtons = QuantityButtons(this.container)
    this.cartNoteToggle = CartNoteToggle(this.container)

    if (shouldAnimate(this.container)) {
      this.animateQuickCart = animateQuickCart(this.container)
    }

    // Delegate handles all click events due to rendering different content
    // within quick cart
    this.delegate = new Delegate(this.container)

    this.delegate.on('click', selectors.overlay, () => this.close())
    this.delegate.on('click', selectors.closeButton, () => this.close())
    this.delegate.on('change', selectors.quantityInput, (e) =>
      this.handleQuantityInputChange(e),
    )

    const freeShippingBar = qs(selectors.freeShippingBar, this.container)

    if (freeShippingBar) {
      FreeShippingBar(freeShippingBar)
    }

    this._initCrossSells()
  },

  openQuickCart() {
    add(this.cartWrapper, classes.active)
    this.cartTrap.activate()
    this.adjustItemPadding()
    this.animateQuickCart?.open()
    document.body.setAttribute('data-fluorescent-overlay-open', 'true')

    disableBodyScroll(this.container, {
      allowTouchMove: (el) => {
        while (el && el !== document.body) {
          if (el.getAttribute('data-scroll-lock-ignore') !== null) {
            return true
          }
          el = el.parentNode
        }
      },
      reserveScrollBarGap: true,
    })

    if (useCustomEvents) {
      cart.get().then((cart) => {
        dispatchCustomEvent('quick-cart:open', { cart })
      })
    }
  },

  refreshQuickCart() {
    const url = `${theme.routes.cart.base}?section_id=${this.id}`

    makeRequest('GET', url).then((response) => {
      let container = document.createElement('div')
      container.innerHTML = response
      const responseInnerContainer = qs(selectors.innerContainer, container)
      const cartHasItems = Boolean(qs(selectors.items, this.container))
      const responseHasItems = Boolean(qs(selectors.items, container))
      const freeShippingBar = qs(selectors.freeShippingBar, container)
      this.crossSells?.unload()

      if (freeShippingBar) {
        FreeShippingBar(freeShippingBar)
      }

      // Cart has items and needs to update them
      if (responseHasItems && cartHasItems) {
        // Render cart items
        updateInnerHTML(
          `${selectors.cartWrapper} ${selectors.items}`,
          container,
        )
        this.adjustItemPadding()

        // Render cart count
        updateInnerHTML(
          `${selectors.cartWrapper} ${selectors.cartCount}`,
          container,
        )

        // Render subtotal
        updateInnerHTML(
          `${selectors.cartWrapper} ${selectors.subtotal}`,
          container,
        )

        // Render promotions
        updateInnerHTML(
          `${selectors.cartWrapper} ${selectors.discounts}`,
          container,
        )

        // Handle form scroll state
        const form = qs(selectors.form, this.container)
        const previousScrollPosition = form.scrollTop || 0
        form.scrollTop = previousScrollPosition
        this.animateQuickCart?.setup()
      } else {
        // Cart needs to render empty from having items, or needs to render
        // items from empty state
        const innerContainer = qs(selectors.innerContainer, this.container)
        innerContainer.innerHTML = responseInnerContainer.innerHTML
      }

      this._initCrossSells()
    })
  },

  handleErrorMessage(key) {
    const item = qs(`[data-key="${key}"]`, this.container)
    remove(qs(selectors.cartError, item), classes.hidden)
    remove(item, classes.updatingQuantity)
  },

  handleQuantityUpdate(key) {
    const item = qs(`[data-key="${key}"]`, this.container)
    add(item, classes.updatingQuantity)
  },

  handleItemRemoval(key) {
    const item = qs(`[data-key="${key}"]`, this.container)
    add(item, classes.removed)
    add(item, classes.updatingQuantity)
  },

  handleQuantityInputChange({ target }) {
    const item = target.closest(selectors.quantityItem)
    const { key } = item.dataset

    cart.updateItem(key, target.value)
    this.handleQuantityUpdate(key)
  },

  _initCrossSells() {
    const crossSells = qs(selectors.crossSells, this.container)

    if (crossSells) {
      this.crossSells = CrossSells(crossSells)
    }
  },

  scrollUpQuickCart() {
    const form = qs(selectors.form, this.container)
    const previousScrollPosition = 0

    if (!form) return
    // delay the scroll up to make it seem more 'fluid'
    setTimeout(() => {
      form.scrollTop = previousScrollPosition
    }, 300)
  },

  adjustItemPadding() {
    const items = qs(selectors.items, this.container)

    if (!items) return

    // Ensure cart items accounts for the height of cart footer
    const footer = qs(selectors.footer, this.container)
    items.style.paddingBottom = `${footer.clientHeight}px`
  },

  close() {
    remove(this.cartWrapper, classes.active)
    setTimeout(() => {
      this.animateQuickCart?.close()
      this.cartTrap.deactivate()
      document.body.setAttribute('data-fluorescent-overlay-open', 'false')
      enableBodyScroll(this.container)
    }, 500)

    if (useCustomEvents) {
      dispatchCustomEvent('quick-cart:close')
    }
  },

  onSelect() {
    this.openQuickCart()
  },

  onDeselect() {
    this.close()
  },

  onUnload() {
    this.delegate.off()
    this.events.forEach((unsubscribe) => unsubscribe())
    this.quantityButtons.unload()
    this.cartNoteToggle.unload()
  },
})
