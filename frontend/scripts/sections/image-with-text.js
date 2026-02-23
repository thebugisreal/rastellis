import { qsa } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import playButtonBlock from '@/scripts/lib/play-button-block'
import animateImageWithText from '@/scripts/lib/animation/image-with-text'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import { backgroundVideoHandler } from '@/scripts/lib/a11y'

const selectors = {
  playButtonVideo: '[data-play-button-block-video]',
  playButtonBlock: '.play-button-block',
  videoWrappers: '[data-video-wrapper]',
}

section('image-with-text', {
  onLoad() {
    const videoWrappers = qsa(selectors.videoWrappers, this.container)

    if (videoWrappers && videoWrappers.length > 0) {
      videoWrappers.forEach(video => {
        this.videoHandler = backgroundVideoHandler(video)
      })
    }

    if (shouldAnimate(this.container)) {
      this.animateImageWithText = animateImageWithText(this.container)
    }
    const playButtonVideos = qsa(selectors.playButtonVideo, this.container)

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map((block) =>
        playButtonBlock(block.closest(selectors.playButtonBlock)),
      )
    }
  },

  onUnload() {
    this.animateImageWithText?.destroy()
    this.playButtons && this.playButtons.forEach((button) => button.unload())
    this.videoHandler && this.videoHandler.unload()
  },
})
