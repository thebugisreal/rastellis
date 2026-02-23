import { listen, qs } from '@fluorescent/dom'
import section from '@/scripts/glow/section'
import animateBlog from '@/scripts/lib/animation/blog'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('blog', {
  onLoad() {
    const mobileNavSelect = qs('#blog-mobile-nav', this.container)

    if (mobileNavSelect) {
      this.mobileNavSelectEvent = listen(mobileNavSelect, 'change', () => {
        window.location.href = mobileNavSelect.value
      })
    }

    if (shouldAnimate(this.container)) {
      this.animateBlog = animateBlog(this.container)
    }
  },

  onUnload() {
    this.animateBlog?.destroy()
    this.mobileNavSelectEvent && this.mobileNavSelectEvent.unsubscribe()
  },
})
