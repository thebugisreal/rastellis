import section from '@/scripts/glow/section'
import animateBannerCallout from '@/scripts/lib/animation/banner-callout'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  timer: '[data-countdown-timer]',
}

section('banner-callout', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateBannerCallout = animateBannerCallout(this.container)
    }
  },

  onUnload() {
    this.animateBannerCallout?.destroy()
  },
})
