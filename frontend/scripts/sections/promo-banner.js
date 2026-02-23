import section from '@/scripts/glow/section'
import animatePromoBanner from '@/scripts/lib/animation/promo-banner'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('promo-banner', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animatePromoBanner = animatePromoBanner(this.container)
    }
  },

  onUnload() {
    this.animatePromoBanner?.destroy()
  },
})
