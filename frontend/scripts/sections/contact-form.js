import section from '@/scripts/glow/section'
import animateContactForm from '@/scripts/lib/animation/contact-form'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('contact-form', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateContactForm = animateContactForm(this.container)
    }
  },

  onUnload() {
    this.animateContactForm?.destroy()
  },
})
