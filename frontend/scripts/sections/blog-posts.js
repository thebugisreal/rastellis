import section from '@/scripts/glow/section'
import animateBlogPosts from '@/scripts/lib/animation/blog-posts'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import Carousel from '@/scripts/lib/carousel'
import { qs } from '@fluorescent/dom'

section('blog-posts', {
  onLoad() {
    const { enableSlider, enablePagination } = this.container.dataset
    this.enablePagination = enablePagination
    this.sliderPagination = qs('.swiper-pagination', this.container)

    if (enableSlider) {
      this._initCarousel()
    }

    if (shouldAnimate(this.container)) {
      this.animateBlogPosts = animateBlogPosts(this.container)
    }
  },

  _initCarousel() {
    this.carousel = Carousel(this.container, {
      slidesPerView: 1,
      spaceBetween: 12,
      pagination: {
        el: this.enablePagination == 'true' ? this.sliderPagination : null,
        clickable: true,
      },
      breakpoints: {
        720: {
          spaceBetween: 16,
          slidesPerView: 2,
        },
        1024: {
          spaceBetween: 24,
          slidesPerView: 2,
        },
      },
    })
  },

  onUnload() {
    this.carousel?.destroy()
    this.animateBlogPosts?.destroy()
  },
})
