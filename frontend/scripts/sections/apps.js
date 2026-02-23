import section from '@/scripts/glow/section'
import animateApps from '@/scripts/lib/animation/apps'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('apps', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateApps = animateApps(this.container)
    }
  },

  onUnload() {
    this.animateApps?.destroy()
  },
})
