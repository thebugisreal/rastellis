import { qsa } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import playButtonBlock from '@/scripts/lib/play-button-block'
import animateImageWithTextSplit from '@/scripts/lib/animation/image-with-text-split'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import { backgroundVideoHandler } from '@/scripts/lib/a11y'

const selectors = {
  playButtonVideo: '[data-play-button-block-video]',
  playButtonBlock: '.play-button-block',
  videoWrappers: '[data-video-wrapper]',
}

section('image-with-text-split', {
  onLoad() {
    const videoWrappers = qsa(selectors.videoWrappers, this.container)

    if (videoWrappers && videoWrappers.length > 0) {
      videoWrappers.forEach(video => {
        this.videoHandler = backgroundVideoHandler(video)
      })
    }

    const playButtonVideos = qsa(selectors.playButtonVideo, this.container)

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map((block) =>
        playButtonBlock(block.closest(selectors.playButtonBlock)),
      )
    }

    if (shouldAnimate(this.container)) {
      this.animateImageWithTextSplit = animateImageWithTextSplit(this.container)
    }
  },

  onUnload() {
    this.playButtons && this.playButtons.forEach((button) => button.unload())
    this.animateImageWithTextSplit?.destroy()
    this.videoHandler && this.videoHandler.unload()
  },
})
