import section from '@/scripts/glow/section'
import animatePassword from '@/scripts/lib/animation/password'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('password', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animatePassword = animatePassword(this.container)
    }
  },

  onUnload() {
    this.animatePassword?.destroy()
  },
})
