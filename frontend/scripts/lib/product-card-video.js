import { add, qs, qsa, remove, listen } from '@fluorescent/dom'
import { emit } from 'evx'
import cart from '@/scripts/glow/cart'

const selectors = {
  quickAddButton: '[data-quick-shop-trigger="quick-add"]',
  quickViewButton: '[data-quick-shop-trigger="quick-view"]',
  quickCart: '.quick-cart',
  purchaseConfirmation: '.purchase-confirmation-popup'
}

export default function ProductCardVideo(container) {
  const quickAddButtons = qsa(selectors.quickAddButton, container)
  const quickViewButtons = qsa(selectors.quickViewButton, container)
  const quickCart = qs(selectors.quickCart, document)
  const purchaseConfirmation = qs(selectors.purchaseConfirmation, document)

  const events = [
    // Quick Add handler
    listen(quickAddButtons, 'click', (e) => {
      const buttonEl = e.currentTarget
      add(buttonEl, 'loading')

      // if quick cart and confirmation popup are disabled, use standard form submit
      if (!purchaseConfirmation && !quickCart) return

      e.preventDefault()
      e.stopPropagation()

      const { productId } = buttonEl.dataset
      if (!productId) return

      cart.addItemById(productId, 1).then(({ res }) => {
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
      })
    }),

    // Quick View handler
    listen(quickViewButtons, 'click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const buttonEl = e.currentTarget
      const { productUrl } = buttonEl.dataset
      if (!productUrl) return

      emit('quick-view:open', null, {
        productUrl: productUrl,
      })
    })
  ]

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}
