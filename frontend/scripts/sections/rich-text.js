import { qsa } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import playButtonBlock from '@/scripts/lib/play-button-block'
import animateRichText from '@/scripts/lib/animation/rich-text'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  playButtonVideo: '[data-play-button-block-video]',
  playButtonBlock: '.play-button-block',
}

section('rich-text', {
  onLoad() {
    const playButtonVideos = qsa(selectors.playButtonVideo, this.container)

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map((block) =>
        playButtonBlock(block.closest(selectors.playButtonBlock)),
      )
    }

    if (shouldAnimate(this.container)) {
      this.animateRichText = animateRichText(this.container)
    }
  },

  onUnload() {
    this.playButtons && this.playButtons.forEach((button) => button.unload())
    this.animateRichText?.destroy()
  },
})
