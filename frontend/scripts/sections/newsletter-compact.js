import section from '@/scripts/glow/section'
import animateNewsletterCompact from '@/scripts/lib/animation/newsletter-compact'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('newsletter-compact', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateNewsletterCompact = animateNewsletterCompact(this.container)
    }
  },

  onUnload() {
    this.animateNewsletterCompact?.destroy()
  },
})
