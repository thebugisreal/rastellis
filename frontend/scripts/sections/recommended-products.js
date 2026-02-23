import { qs } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import Carousel from '@/scripts/lib/carousel'
import ProductItem from '@/scripts/lib/product-item'
import animateListSlider from '@/scripts/lib/animation/list-slider'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  recommendations: '[data-recommendations]',
  carouselSlide: '.carousel__slide',
}

section('recommended-products', {
  onLoad() {
    const {
      limit,
      productId: id,
      sectionId,
      productsPerView,
      mobileProductsPerView,
    } = this.container.dataset
    this.perView = parseInt(productsPerView, 10)
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05
    // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    const content = qs(selectors.recommendations, this.container)
    if (!content) return

    const requestUrl = `${window.theme.routes.productRecommendations}?section_id=${sectionId}&limit=${limit}&product_id=${id}`

    const request = new XMLHttpRequest()
    request.open('GET', requestUrl, true)

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        let container = document.createElement('div')
        container.innerHTML = request.response

        content.innerHTML = qs(selectors.recommendations, container).innerHTML

        const carousel = qs(selectors.carouselSlide, content)
        this.productItem = ProductItem(this.container)

        if (shouldAnimate(this.container)) {
          this.animateListSlider = animateListSlider(this.container)
        }

        if (carousel) {
          // Between 720 - 960 the slides per view stay consistent with section
          // settings, with the exception of 5, which then shrinks down to 4 across.
          this.carousel = Carousel(content, {
            slidesPerView: this.mobilePerView,
            spaceBetween: 12,
            breakpoints: {
              720: {
                spaceBetween: 16,
                slidesPerView:
                  this.perView === 5 ? this.perView - 1 : this.perView,
              },
              1200: {
                spaceBetween: 24,
                slidesPerView: this.perView,
              },
            },
          })
        } else {
          this._removeSection()
        }
      } else {
        // If request returns any errors remove the section markup
        this._removeSection()
      }
    }
    request.send()
  },

  _removeSection() {
    this.container.parentNode.removeChild(this.container)
  },

  onUnload() {
    this.carousel?.destroy()
    this.animateListSlider?.destroy()
  },
})
