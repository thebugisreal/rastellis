import { add, qs, qsa, remove, listen } from '@fluorescent/dom'
import { emit } from 'evx'
import cart from '@/scripts/glow/cart'

import AnimateProductItem from '@/scripts/lib/animation/product-item'

const selectors = {
  item: '.product-item',
  itemInner: '.product-item__inner',
  quickAddButton: '[data-quick-shop-trigger="quick-add"]',
  quickViewButton: '[data-quick-shop-trigger="quick-view"]',
  quickCart: '.quick-cart',
  purchaseConfirmation: '.purchase-confirmation-popup',
  quickAddQuantitySelector: '.product-item__qty-select',
}

export default function ProductItem(container) {
  const items = qsa(selectors.item, container)
  if (!items.length) return

  // Add z-index for quick-buy overlap
  items.forEach((item, i) =>
    item.style.setProperty('--z-index-item', items.length - i),
  )

  const productItemAnimations = AnimateProductItem(items)
  const quickAddButtons = qsa(selectors.quickAddButton, container)
  const quickViewButtons = qsa(selectors.quickViewButton, container)
  const quickCart = qs(selectors.quickCart, document)
  const purchaseConfirmation = qs(selectors.purchaseConfirmation, document)
  const quickAddQuantitySelector = qsa(selectors.quickAddQuantitySelector, container)

  const events = [
    listen(quickAddButtons, 'click', (e) => {
      const buttonEl = e.currentTarget
      add(buttonEl, 'loading')

      // if quick cart and confirmation popup are disabled, use standard form submit
      if (!purchaseConfirmation && !quickCart) return

      e.preventDefault()
      e.stopPropagation()

      const { productId, productQuantity = 1 } = buttonEl.dataset
      if (!productId) return

      cart.addItemById(productId, productQuantity).then(({ res }) => {
        remove(buttonEl, 'loading')

        if (purchaseConfirmation) {
          emit('confirmation-popup:open', null, { product: res.items[0] })
        } else {
          emit('quick-cart:updated')
          // Need a delay to allow quick-cart to refresh
          setTimeout(() => {
            emit('quick-cart:open')
          }, 300)
        }
      }).finally(() => {
        remove(buttonEl, 'loading')
      })
    }),

    listen(quickViewButtons, 'click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const buttonEl = e.currentTarget
      const { productUrl } = buttonEl.dataset
      if (!productUrl) return

      emit('quick-view:open', null, {
        productUrl: productUrl,
      })
    }),

    listen(quickAddQuantitySelector, 'change', (e) => {
      const formEl = e.currentTarget.closest('form')
      if (!formEl) return

      const addButtonEl = qs('[data-quick-shop-trigger="quick-add"]', formEl)
      if (!addButtonEl) return

      addButtonEl.setAttribute('data-product-quantity', e.currentTarget.value)
    }),
  ]

  const unload = () => {
    productItemAnimations.destroy()
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}
