import section from '@/scripts/glow/section'
import animateListCollections from '@/scripts/lib/animation/list-collections'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('list-collections', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateListCollections = animateListCollections(this.container)
    }
  },

  onUnload() {
    this.animateListCollections?.destroy()
  },
})
