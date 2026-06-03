import section from '@/scripts/glow/section'
import Carousel from '@/scripts/lib/carousel'

import('@/scripts/lib/video-control.js')

section('featured-recipes', {
  onLoad() {
    this.carousel = Carousel(this.container, {
      slidesPerView: 1.1,
      spaceBetween: 16,
      threshold: 5,
      breakpoints: {
        960: {
          slidesPerView: 4,
          spaceBetween: 32,
        },
      },
    })
  },

  onUnload() {
    this.carousel?.destroy()
  },
})
