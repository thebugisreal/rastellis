import section from '@/scripts/glow/section'
import animateCollectionListGrid from '@/scripts/lib/animation/collection-list-grid'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('collection-list-grid', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateCollectionListGrid = animateCollectionListGrid(this.container)
    }
  },

  onUnload() {
    this.animateCollectionListGrid?.destroy()
  },
})
