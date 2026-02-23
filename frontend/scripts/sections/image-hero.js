import { qsa } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import playButtonBlock from '@/scripts/lib/play-button-block'
import animateImageHero from '@/scripts/lib/animation/image-hero'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import('@/scripts/lib/video-control.js')

const selectors = {
  playButtonVideo: '[data-play-button-block-video]',
  playButtonBlock: '.play-button-block',
}

section('image-hero', {
  onLoad() {
    const playButtonVideos = qsa(selectors.playButtonVideo, this.container)

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map((block) =>
        playButtonBlock(block.closest(selectors.playButtonBlock)),
      )
    }

    if (shouldAnimate(this.container)) {
      this.animateImageHero = animateImageHero(this.container)
    }
  },

  onUnload() {
    this.playButtons && this.playButtons.forEach((button) => button.unload())
    this.animateImageHero?.destroy()
  },
})
