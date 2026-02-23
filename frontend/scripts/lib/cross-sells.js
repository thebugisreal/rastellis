import { add, listen, qsa, qs } from '@fluorescent/dom'
import { emit } from 'evx'
import cart from '@/scripts/glow/cart'
import Carousel from '@/scripts/lib/carousel'

const selectors = {
  crossSellsSlider: '[data-cross-sells-slider]',
  quickViewTrigger: '[data-quick-view-trigger]',
  addToCartTrigger: '[data-add-item-id]',
}

export default function CrossSells(node) {
  const { crossSellsSlider } = qs(selectors.crossSellsSlider, node).dataset

  let swiper = crossSellsSlider
    ? new Carousel(node, { slidesPerView: 1.15, spaceBetween: 8 })
    : null

  const events = [
    listen(qsa(selectors.quickViewTrigger, node), 'click', (e) => {
      const { productUrl } = e.target.dataset
      if (!productUrl) return

      emit('quick-view:open', null, {
        productUrl: productUrl,
      })
    }),
    listen(qsa(selectors.addToCartTrigger, node), 'click', (e) => {
      const { addItemId } = e.target.dataset
      if (!addItemId) return

      animateButton(e.target)
      cart.addItemById(addItemId, 1)
      emit('quick-cart:scrollup')
    }),
  ]

  function animateButton(button) {
    add(button, 'loading')
  }

  function unload() {
    events.forEach((unsubscribe) => unsubscribe())
    swiper.destroy()
  }

  return { unload }
}
