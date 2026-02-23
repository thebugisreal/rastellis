import { listen } from '@fluorescent/dom'

const checkAutoPlay = (video, mediaContainer) => {
  if (!video) return

  const events = [
    listen(window, 'click', () => _handleAutoPlay()),
    listen(window, 'touchstart', () => _handleAutoPlay()),
    listen(video, 'playing', () => _handleVideoPlaying()),
  ]

  // Force autoplay after device interaction if in low power mode
  function _handleAutoPlay() {
    if (video.paused) {
      video.play()
    }
  }

  function _handleVideoPlaying() {
    mediaContainer.dataset.videoLoading = 'false'
    events.forEach((unsubscribe) => unsubscribe())
  }
}

export default checkAutoPlay
