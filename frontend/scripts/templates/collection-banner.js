import section from '@/scripts/glow/section'
import animateCollectionBanner from '@/scripts/lib/animation/collection-banner'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('collection-banner', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateCollectionBanner = animateCollectionBanner(this.container)
    }
  },

  onUnload() {
    this.animateCollectionBanner?.destroy()
  },
})
