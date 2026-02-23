import { qs } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import Carousel from '@/scripts/lib/carousel'
import ProductItem from '@/scripts/lib/product-item'
import { getRecentProducts } from '@/scripts/lib/recently-viewed-products'
import animateListSlider from '@/scripts/lib/animation/list-slider'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import { makeRequest } from '@/scripts/lib/xhr'

const selectors = {
  recentlyViewed: '[data-recently-viewed]',
  carousel: '.carousel',
  carouselSlide: '.carousel__slide',
  navButtons: '.carousel__navigation-buttons',
}

section('recently-viewed-products', {
  onLoad() {
    const { limit, productsPerView, mobileProductsPerView, productHandle } =
      this.container.dataset
    this.limit = parseInt(limit, 10)
    this.perView = parseInt(productsPerView, 10)
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05
    // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    this.recentProductsContainer = qs(
      '.recently-viewed-products__slider-wrapper',
      this.container,
    )

    // Grab products from localStorage
    const recentProducts = getRecentProducts()

    if (!(recentProducts || []).length) {
      this._removeSection()
      return
    }

    const recentProductsTrimmed = recentProducts
      .filter((handle) => handle !== productHandle) // don't show current product
      .slice(0, this.limit)

    if (recentProductsTrimmed.length >= 1) {
      this._renderProductItems(recentProductsTrimmed)
    } else {
      this._removeSection()
    }
  },

  _renderProductItems(productHandles) {
    const actions = productHandles.map(this._renderProductItem.bind(this))
    const results = Promise.all(actions)

    results.then(() => {
      const content = qs(selectors.recentlyViewed, this.container)
      const carouselSlide = qs(selectors.carouselSlide, this.container)
      this.productItem = ProductItem(this.container)

      if (shouldAnimate(this.container)) {
        this.animateListSlider = animateListSlider(this.container)
      }

      if (carouselSlide) {
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
        this._removeSection() // catch the situation where no product handles are valid
      }
    })
  },

  _renderProductItem(productHandle) {
    return new Promise((resolve) => {
      const requestUrl = `${theme.routes.products}/${productHandle}?section_id=recently-viewed-product-item`

      makeRequest('GET', requestUrl)
        .then((response) => {
          let container = document.createElement('div')
          container.innerHTML = response

          const productItem = container.querySelector(
            '[data-recently-viewed-item]',
          ).innerHTML

          this.recentProductsContainer.insertAdjacentHTML(
            'beforeend',
            productItem,
          )

          resolve()
        })
        .catch(() => {
          console.error(`Recent product "${productHandle}" not found`)
          resolve() // continue if product not found
        })
    })
  },

  _removeSection() {
    this.container.parentNode.removeChild(this.container)
  },

  onUnload() {
    this.carousel?.destroy()
    this.animateListSlider?.destroy()
  },
})
