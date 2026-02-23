import section from '@/scripts/glow/section'
import animateNewsletter from '@/scripts/lib/animation/newsletter'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('newsletter', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateNewsletter = animateNewsletter(this.container)
    }
  },

  onUnload() {
    this.animateNewsletter?.destroy()
  },
})
