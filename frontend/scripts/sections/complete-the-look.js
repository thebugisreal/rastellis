import { add, qs, qsa, remove, listen } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import { backgroundVideoHandler } from '@/scripts/lib/a11y'
import { emit } from 'evx'
import cart from '@/scripts/glow/cart'
import animateCompleteTheLook from '@/scripts/lib/animation/complete-the-look'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  video: 'video',
  quickAddButton: '[data-quick-shop-trigger="quick-add"]',
  quickViewButton: '[data-quick-shop-trigger="quick-view"]',
  quickCart: '.quick-cart',
  purchaseConfirmation: '.purchase-confirmation-popup',
}

section('complete-the-look', {
  videoHandler: null,

  onLoad() {
    const video = qs(selectors.video, this.container)
    const quickAddButtons = qsa(selectors.quickAddButton, this.container)
    const quickViewButtons = qsa(selectors.quickViewButton, this.container)
    const quickCart = qs(selectors.quickCart, document)
    const purchaseConfirmation = qs(selectors.purchaseConfirmation, document)

    if (video) {
      this.videoHandler = backgroundVideoHandler(this.container)
    }

    this.events = [
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
    ]

    if (shouldAnimate(this.container)) {
      this.animateCompleteTheLook = animateCompleteTheLook(this.container)
    }
  },

  onUnload() {
    this.videoHandler && this.videoHandler()
    this.events.forEach((unsubscribe) => unsubscribe())
    this.animateCompleteTheLook?.destroy()
  },
})
