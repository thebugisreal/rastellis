import { default as Product } from '@/scripts/lib/product/product'
import { slideDown, slideStop, slideUp } from 'slide-anim'
import { qs } from '@fluorescent/dom'
import section from '@/scripts/glow/section'
import animateProduct from '@/scripts/lib/animation/product'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('featured-product', {
  onLoad() {
    this.product = new Product(this.container)

    if (shouldAnimate(this.container)) {
      this.animateProduct = animateProduct(this.container)
    }
  },

  onBlockSelect({ target }) {
    const label = qs('.accordion__label', target)
    target.scrollIntoView({ block: 'center', behavior: 'smooth' })

    if (!label) return
    const { parentNode: group, nextElementSibling: content } = label

    slideStop(content)
    slideDown(content)
    group.setAttribute('data-open', true)
    label.setAttribute('aria-expanded', true)
    content.setAttribute('aria-hidden', false)
  },

  onBlockDeselect({ target }) {
    const label = qs('.accordion__label', target)
    if (!label) return
    const { parentNode: group, nextElementSibling: content } = label

    slideStop(content)
    slideUp(content)
    group.setAttribute('data-open', false)
    label.setAttribute('aria-expanded', false)
    content.setAttribute('aria-hidden', true)
  },

  onUnload() {
    this.product.unload()
    this.animateProduct?.destroy()
  },
})
