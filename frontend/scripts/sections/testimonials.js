import { qsa, qs, add } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import { on } from 'evx'
import { emit } from 'evx'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import animateTestimonials from '@/scripts/lib/animation/testimonials'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import getMediaQuery from '@/scripts/lib/media-queries'

const selectors = {
  item: '.testimonials__item',
  swiper: '.swiper',
  navigationNext: '.testimonials__navigation-button--next',
  navigationPrev: '.testimonials__navigation-button--prev',
  productImage: '.testimonials__item-product-pick-image',
}

section('testimonials', {
  onLoad() {
    this.events = []
    this.items = qsa(selectors.item, this.container)
    this.itemsContainer = qs(selectors.swiper, this.container)

    if (shouldAnimate(this.container)) {
      this.itemAnimations = this.items.map((item) => animateTestimonials(item))
      this.observer = intersectionWatcher(this.container)
    }

    if (this.items.length > 1) {
      import('@/scripts/manualChunks/swiper.js').then(
        ({ Swiper, Navigation, EffectFade }) => {
          const swiperOptions = {
            modules: [Navigation, EffectFade],
            autoHeight: true,
            slidesPerView: 1,
            effect: 'fade',
            loop: true,
            fadeEffect: {
              crossFade: true,
            },
            grabCursor: true,
            navigation: {
              nextEl: selectors.navigationNext,
              prevEl: selectors.navigationPrev,
            },
            breakpoints: {
              720: {
                spaceBetween: 42,
              },
            },
            on: {
              slideChangeTransitionEnd() {
                const slideEls = this.slides
                setTimeout(function () {
                  slideEls.forEach((slide) => {
                    slide.toggleAttribute(
                      'inert',
                      !slide.classList.contains('swiper-slide-active'),
                    )
                  })
                }, 50)
              },
            },
          }

          // We use fade for desktop size animatiosn and slide for under
          // 720px
          if (window.matchMedia(getMediaQuery('below-720')).matches) {
            swiperOptions.effect = 'slide'
            swiperOptions.slidesPerView = 'auto'
          }

          this.carousel = new Swiper(this.itemsContainer, swiperOptions)
          this.setMobileButtonOffset()
          emit('testimonials:initialized')
        },
      )
    } else if (this.items.length === 1) {
      add(this.items[0], 'swiper-slide-visible')
    }
  },

  setMobileButtonOffset() {
    if (window.matchMedia(getMediaQuery('above-720')).matches) return

    const firstImage = qs(selectors.productImage, this.container)
    if (!firstImage) return

    const mobileButtonHeight = 34
    const halfMobileButtonHeight = mobileButtonHeight / 2
    const halfImageHeight = firstImage.offsetHeight / 2
    const offset = halfImageHeight + halfMobileButtonHeight

    this.container.style.setProperty('--mobile-button-offset', `${offset}px`)
  },

  handleBlockSelect(slideIndex) {
    this.carousel.slideToLoop(parseInt(slideIndex, 10))
  },

  onBlockSelect({ target }) {
    const { index } = target.dataset

    if (this.carousel) {
      this.handleBlockSelect(index)
    } else {
      // Listen for initalization if carousel does not exist
      this.events.push(
        on('testimonials:initialized', () => {
          this.handleBlockSelect(index)
        }),
      )
    }
  },

  onUnload() {
    this.events.forEach((unsubscribe) => unsubscribe())
    this.observer?.destroy()
  },
})
