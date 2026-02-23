import { qsa } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import animateImageHeroSplit from '@/scripts/lib/animation/image-hero-split'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('image-hero-split', {
  onLoad() {
    if (shouldAnimate(this.container)) {
      // Setup animations per item
      qsa('.animation--item', this.container).forEach((item) =>
        animateImageHeroSplit(item),
      )
    }

    this.observer = intersectionWatcher(this.container)
  },

  onUnload() {
    this.playButtons && this.playButtons.forEach((button) => button.unload())
    this.observer?.destroy()
  },
})
