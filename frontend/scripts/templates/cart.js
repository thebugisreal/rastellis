import Delegate from 'ftdomdelegate'
import { remove, qs, add } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import cart from '@/scripts/glow/cart'
import { on } from 'evx'
import QuantityButtons from '@/scripts/lib/quantity-buttons'
import CartNoteToggle from '@/scripts/lib/cart-note-toggle'
import FreeShippingBar from '@/scripts/lib/free-shipping-bar'
import CrossSells from '@/scripts/lib/cross-sells'

const selectors = {
  cart: '[data-section-type="cart"]',
  cartError: '.cart__form-item-error',
  cartItems: '[js-cart-items]',
  cartNoteTrigger: '[data-order-note-trigger]',
  cartSubtotalWrapper: '[js-cart-footer-subtotal-wrapper]',
  cartUpdateButton: '.cart__update',
  quantityInput: '.cart .quantity-input__input',
  quantityItem: '[data-input-item]',
  freeShippingBar: '[data-free-shipping-bar]',
  crossSells: '[data-cross-sells]',
}

const classes = {
  updatingQuantity: 'has-quantity-update',
  removed: 'is-removed',
}

section('cart', {
  onLoad() {
    const cartNoteTrigger = qs(selectors.cartNoteTrigger, this.container)
    const freeShippingBar = qs(selectors.freeShippingBar, this.container)

    if (freeShippingBar) {
      FreeShippingBar(freeShippingBar)
    }

    this._initCrossSells()

    if (cartNoteTrigger) this.cartNoteToggle = CartNoteToggle(this.container)
    this.quantityButtons = QuantityButtons(this.container)

    // Events are all on events trigger by other components / functions
    this.events = [
      on('cart:updated', () => this.refreshCart()),
      on('cart:error', (_, { key, errorMessage }) => {
        this.handleErrorMessage(key, errorMessage)
      }),
      on(['quantity-update:subtract', 'quantity-update:add'], (_, { key }) => {
        this.handleQuantityUpdate(key)
      }),
      on('quantity-update:remove', (_, { key }) => {
        this.handleItemRemoval(key)
      }),
    ]

    // Delegate handles all click events due to rendering different content
    // within cart
    this.delegate = new Delegate(this.container)
    this.delegate.on('change', selectors.quantityInput, (e) =>
      this.handleQuantityInputChange(e),
    )
  },

  refreshCart() {
    const url = `${theme.routes.cart.base}?section_id=${this.id}`
    const targetCartItems = qs(selectors.cartItems, this.container)
    const targetCartSubtotalWrapper = qs(
      selectors.cartSubtotalWrapper,
      this.container,
    )

    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const sourceDom = new DOMParser().parseFromString(text, 'text/html')
        const sourceCartItems = qs(selectors.cartItems, sourceDom)
        const sourceCartSubtotalWrapper = qs(
          selectors.cartSubtotalWrapper,
          sourceDom,
        )

        if (sourceCartItems) {
          targetCartItems.innerHTML = sourceCartItems.innerHTML
          targetCartSubtotalWrapper.outerHTML =
            sourceCartSubtotalWrapper.outerHTML
        } else {
          const sourceContainer = qs(selectors.cart, sourceDom)
          this.container.innerHTML = sourceContainer.innerHTML
        }

        const freeShippingBar = qs(selectors.freeShippingBar, this.container)

        if (freeShippingBar) {
          FreeShippingBar(freeShippingBar)
        }

        this._initCrossSells()
      })
  },

  handleErrorMessage(key) {
    const item = qs(`[data-key="${key}"]`, this.container)
    remove(qs(selectors.cartError, item), 'hidden')
    remove(item, classes.updatingQuantity)
  },

  handleQuantityInputChange({ target }) {
    const item = target.closest(selectors.quantityItem)
    const { key } = item.dataset

    cart.updateItem(key, target.value)
    this.handleQuantityUpdate(key)
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

  _initCrossSells() {
    const crossSells = qs(selectors.crossSells, this.container)

    if (crossSells) {
      this.crossSells = CrossSells(crossSells)
    }
  },

  onUnload() {
    this.events.forEach((unsubscribe) => unsubscribe())
    this.quantityButtons.unload()
    this.cartNoteToggle?.unload()
  },
})
