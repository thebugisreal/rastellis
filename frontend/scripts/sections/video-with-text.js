import { qs, qsa } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import { backgroundVideoHandler } from '@/scripts/lib/a11y'
import playButtonBlock from '@/scripts/lib/play-button-block'
import animateVideoHero from '@/scripts/lib/animation/video-hero'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import checkAutoPlay from '../lib/checkAutoPlay'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'
import getMediaQuery from '@/scripts/lib/media-queries'

const selectors = {
  mediaContainer: '.video-with-text__media-container',
  video: '.video-with-text__video',
  videoSourceDesktop: '.desktop-source',
  videoSourceMobile: '.mobile-source',
  playButtonVideo: '[data-play-button-block]',
  playButtonBlock: '.play-button-block',
}

section('video-with-text', {
  videoHandler: null,

  onLoad() {
    const playButtonVideos = qsa(selectors.playButtonVideo, this.container)
    this.mediaContainer = qs(selectors.mediaContainer, this.container)

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map((block) =>
        playButtonBlock(block.closest(selectors.playButtonBlock)),
      )
    }

    const hasMobileVideo = this.mediaContainer.dataset.hasMobileVideo === 'true'

    if (hasMobileVideo) {
      atBreakpointChange(720, () => {
        if (window.matchMedia(getMediaQuery('below-720')).matches) {
          this._updateVideo('mobile')
        } else {
          this._updateVideo('default')
        }
      })
    }

    if (shouldAnimate(this.container)) {
      this.animateVideoHero = animateVideoHero(this.container)
    }
  },

  _updateVideo(videoType) {
    const videoSourceSelector =
      videoType === 'mobile'
        ? selectors.videoSourceMobile
        : selectors.videoSourceDesktop

    const videoSource = qs(videoSourceSelector, this.mediaContainer)
    const currentVideoEl = qs(selectors.video, this.mediaContainer)

    if (currentVideoEl.src === videoSource.src) return

    currentVideoEl.src = videoSource.src
    currentVideoEl.load()

    // Manual reset of mute attr required for most browsers to autoplay
    if (currentVideoEl) {
      currentVideoEl.muted = true
    }

    this._playVideo(currentVideoEl)
  },

  _playVideo(video) {
    this.videoHandler = backgroundVideoHandler(this.container)

    // play function is required for mobile & Safari or video will stay paused
    if (video) {
      video.play()
      checkAutoPlay(video, this.mediaContainer)
    }

    // if video is still not ready, show the fallback image
    if (video && video.paused) {
      this.mediaContainer.dataset.videoLoading = 'true'
    }
  },

  onUnload() {
    this.playButtons && this.playButtons.forEach((button) => button.unload())
    this.videoHandler && this.videoHandler()
    this.animateVideoHero?.destroy()
  },
})
