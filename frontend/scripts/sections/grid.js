import section from '@/scripts/glow/section'
import animateGrid from '@/scripts/lib/animation/grid'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('grid', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateGrid = animateGrid(this.container)
    }
  },

  onUnload() {
    this.animateGrid?.destroy()
  },
})
