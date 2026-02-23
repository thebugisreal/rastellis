import section from '@/scripts/glow/section'

import Carousel from '@/scripts/lib/carousel'
import animateListSlider from '@/scripts/lib/animation/list-slider'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('gallery-carousel', {
  onLoad() {
    const { loopCarousel, productsPerView, mobileProductsPerView } =
      this.container.dataset

    // Convert loop setting string into boolean
    this.loopCarousel = loopCarousel === 'true'

    this.perView = parseInt(productsPerView, 10) * 1.05
    // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05

    this._initCarousel()

    if (shouldAnimate(this.container)) {
      this.animateListSlider = animateListSlider(this.container)
    }
  },

  _initCarousel() {
    // Between 720 - 960 the slides per view stay consistent with section
    // settings, with the exception of 5, which then shrinks down to 4 across.
    this.carousel = Carousel(this.container, {
      slidesPerView: this.mobilePerView,
      spaceBetween: 12,
      loop: this.loopCarousel,
      breakpoints: {
        720: {
          spaceBetween: 16,
          slidesPerView: this.perView,
        },
        1200: {
          spaceBetween: 24,
          slidesPerView: this.perView,
        },
      },
    })
  },

  onUnload() {
    this.carousel?.destroy()
    this.animateListSlider?.destroy()
  },
})
