import section from '@/scripts/glow/section'
import animateSalesBanner from '@/scripts/lib/animation/sales-banner'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('sales-banner', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateSalesBanner = animateSalesBanner(this.container)
    }
  },

  onUnload() {
    this.animateSalesBanner?.destroy()
  },
})
