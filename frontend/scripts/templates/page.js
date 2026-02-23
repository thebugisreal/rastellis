import { qsa } from '@fluorescent/dom'
import section from '@/scripts/glow/section'
import wrapIframes from '@/scripts/lib/rte/wrapIframes'
import wrapTables from '@/scripts/lib/rte/wrapTables'
import animatePage from '@/scripts/lib/animation/page'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('page', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      this.animatePage = animatePage(this.container)
    }

    // Required to properly style RTE content
    wrapIframes(qsa('iframe', this.container))
    wrapTables(qsa('table', this.container))
  },

  onUnload() {
    this.animatePage?.destroy()
  },
})
