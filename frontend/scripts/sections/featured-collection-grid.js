import section from '@/scripts/glow/section'

import getMediaQuery from '@/scripts/lib/media-queries'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'
import Carousel from '@/scripts/lib/carousel'
import ProductItem from '@/scripts/lib/product-item'
import animateFeaturedCollectionGrid from '@/scripts/lib/animation/featured-collection-grid'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('featured-collection-grid', {
  onLoad() {
    const { productsPerView, mobileProductsPerView } = this.container.dataset
    this.events = []
    this.perView = parseInt(productsPerView, 10)
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05
    // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    this.productItem = ProductItem(this.container)

    this.breakPointHandler = atBreakpointChange(960, () => {
      if (window.matchMedia(getMediaQuery('below-960')).matches) {
        this._initCarousel()
      } else {
        this.carousel.destroy()
      }
    })

    if (window.matchMedia(getMediaQuery('below-960')).matches) {
      this._initCarousel()
    }

    if (shouldAnimate(this.container)) {
      this.animateFeaturedCollectionGrid = animateFeaturedCollectionGrid(
        this.container,
      )
    }
  },

  _initCarousel() {
    // Between 720 - 960 the slides per view stay consistent with section
    // settings, with the exception of 5, which then shrinks down to 4 across.
    this.carousel = Carousel(this.container, {
      slidesPerView: this.mobilePerView,
      spaceBetween: 12,
      breakpoints: {
        720: {
          spaceBetween: 16,
          slidesPerView: this.perView === 5 ? this.perView - 1 : this.perView,
        },
      },
    })
  },

  onUnload() {
    this.carousel?.destroy()
    this.animateFeaturedCollectionGrid?.destroy()
  },
})
