import section from '@/scripts/glow/section'
import animatePromotionBar from '@/scripts/lib/animation/promotion-bar'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('promotion-bar', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animatePromotionBar = animatePromotionBar(this.container)
    }
  },

  onUnload() {
    this.animatePromotionBar?.destroy()
  },
})
