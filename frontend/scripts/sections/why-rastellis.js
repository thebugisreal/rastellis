import { qs } from '@fluorescent/dom'
import section from '@/scripts/glow/section'

import('@/scripts/lib/video-control.js')

const selectors = {
  swiper: '.swiper',
  navNext: '[data-next]',
  navPrev: '[data-prev]',
}

section('why-rastellis', {
  onLoad() {
    const slides = this.container.querySelectorAll('.swiper-slide')
    if (slides.length <= 1) return

    import('@/scripts/manualChunks/swiper.js').then(({ Swiper, Navigation, EffectFade }) => {
      this.carousel = new Swiper(qs(selectors.swiper, this.container), {
        modules: [Navigation, EffectFade],
        effect: 'fade',
        fadeEffect: { crossFade: true },
        slidesPerView: 1,
        loop: true,
        navigation: {
          nextEl: qs(selectors.navNext, this.container),
          prevEl: qs(selectors.navPrev, this.container),
        },
        on: {
          slideChangeTransitionEnd() {
            const slideEls = this.slides
            setTimeout(() => {
              slideEls.forEach((slide) => {
                slide.toggleAttribute('inert', !slide.classList.contains('swiper-slide-active'))
              })
            }, 50)
          },
        },
      })
    })
  },

  onUnload() {
    this.carousel?.destroy()
  },
})
