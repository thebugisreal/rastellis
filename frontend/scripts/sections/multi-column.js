import section from '@/scripts/glow/section'
import { qs } from '@fluorescent/dom'
import Carousel from '@/scripts/lib/carousel'
import getMediaQuery from '@/scripts/lib/media-queries'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'
import animateMultiColumn from '@/scripts/lib/animation/multi-column'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  sliderContainer: '.carousel',
}

section('multi-column', {
  onLoad() {
    const { sliderOnMobile: sliderOnMobileString } = this.container.dataset
    const sliderOnMobile = sliderOnMobileString === 'true'

    if (
      sliderOnMobile &&
      window.matchMedia(getMediaQuery('below-720')).matches
    ) {
      this._initCarousel()
    }

    this.breakPointHandler = atBreakpointChange(720, () => {
      if (window.matchMedia(getMediaQuery('below-720')).matches) {
        this._initCarousel()
      } else {
        this.carousel.destroy()
      }
    })

    if (shouldAnimate(this.container)) {
      this.animateMultiColumn = animateMultiColumn(this.container)
    }
  },

  _initCarousel() {
    const { mobileColumnsPerView } = this.container.dataset
    this.mobilePerView = parseInt(mobileColumnsPerView, 10) * 1.05 // Peek value
    this.carouselElement = qs(selectors.sliderContainer, this.container)

    this.carousel = Carousel(this.carouselElement, {
      slidesPerView: this.mobilePerView,
      spaceBetween: 12,
    })
  },

  onUnload() {
    this.breakPointHandler.unload()
    this.carousel?.destroy()
    this.animateMultiColumn?.destroy()
  },
})
