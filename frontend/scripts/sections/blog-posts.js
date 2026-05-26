import section from '@/scripts/glow/section'
import animateBlogPosts from '@/scripts/lib/animation/blog-posts'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import Carousel from '@/scripts/lib/carousel'

import('@/scripts/lib/video-control.js')

section('blog-posts', {
  onLoad() {
    this._initCarousel()

    if (shouldAnimate(this.container)) {
      this.animateBlogPosts = animateBlogPosts(this.container)
    }
  },

  _initCarousel() {
    this.carousel = Carousel(this.container, {
      slidesPerView: 1.1,
      spaceBetween: 16,
      breakpoints: {
        720: {
          spaceBetween: 32,
          slidesPerView: 4,
        },
      },
    })
  },

  onUnload() {
    this.carousel?.destroy()
    this.animateBlogPosts?.destroy()
  },
})
