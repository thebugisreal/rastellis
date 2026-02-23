import section from '@/scripts/glow/section'
import { add, remove, qs, qsa, listen } from '@fluorescent/dom'

import navigationDots from '@/scripts/lib/navigation-dots'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import animateQuotes from '@/scripts/lib/animation/quotes'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  slider: '[data-slider]',
  slide: '[data-slide]',
  logoNavButton: '[logo-nav-button]',
}

section('quote', {
  onLoad() {
    const sliderContainer = qs(selectors.slider, this.container)
    const slides = qsa(selectors.slide, this.container)

    if (shouldAnimate(this.container)) {
      slides.forEach((slide) => animateQuotes(slide))
      this.observer = intersectionWatcher(this.container)
    }

    if (slides.length < 2) {
      if (slides.length) add(slides[0], 'swiper-slide-visible')
      return null
    }

    const paginationStyle = sliderContainer.dataset.paginationStyle
    const autoplayEnabled = sliderContainer.dataset.autoplayEnabled == 'true'
    const autoplayDelay = parseInt(sliderContainer.dataset.autoplayDelay, 10)
    this.events = []

    import('@/scripts/manualChunks/swiper.js').then(
      ({ Swiper, Autoplay, Navigation, EffectFade }) => {
        this.swiper = new Swiper(sliderContainer, {
          modules: [Navigation, Autoplay, EffectFade],
          grabCursor: true,
          effect: 'fade',
          fadeEffect: {
            crossFade: true,
          },
          loop: true,
          autoplay: autoplayEnabled
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false,
          navigation: {
            nextEl: '.slider-nav-button-next',
            prevEl: '.slider-nav-button-prev',
          },
        })

        if (paginationStyle === 'dots') {
          this.dotNavigation = navigationDots(this.container, {
            onSelect: (dotIndex) => {
              this.swiper.slideToLoop(dotIndex)
            },
          })
        } else if (paginationStyle === 'logos') {
          this.logoNavButtons = qsa(selectors.logoNavButton, this.container)
          add(this.logoNavButtons[0], 'active')
          this.logoNavButtons.forEach((button) => {
            this.events.push(
              listen(button, 'click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index, 10)
                this.swiper.slideToLoop(index)
              }),
            )
          })
        }

        this.swiper.on('slideChange', () => {
          const index = this.swiper.realIndex
          if (paginationStyle === 'dots') {
            this.dotNavigation.update(index)
          } else if (paginationStyle === 'logos') {
            const activeClass = 'active'
            this.logoNavButtons.forEach((button) => remove(button, activeClass))
            add(this.logoNavButtons[index], activeClass)
          }
        })
      },
    )
  },

  onBlockSelect({ target: slide }) {
    const index = parseInt(slide.dataset.index, 10)
    this.swiper?.autoplay?.stop()
    this.swiper?.slideToLoop(index)
  },

  onBlockDeselect() {
    this.swiper?.autoplay?.start()
  },

  onUnload() {
    this.swiper?.destroy()
    this.dotNavigation?.unload()
    this.events.forEach((unsubscribe) => unsubscribe())
    this.observer?.destroy()
  },
})
