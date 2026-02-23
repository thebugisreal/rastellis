import { qs, qsa, listen, add, remove } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import loadYouTubeAPI from '@/scripts/lib/load-youtube-api'
import loadVimeoAPI from '@/scripts/lib/load-vimeo-api'
import animateVideo from '@/scripts/lib/animation/video'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  video: '.js-video',
  videoExternal: '.js-video-external',
  image: '.js-video-image',
  playTrigger: '[data-play-button]',
}

const classes = {
  visible: 'visible',
}

export default function VideoModule(container) {
  const events = []
  const playTrigger = qs(selectors.playTrigger, container)
  const video = qs(selectors.video, container)
  const videoExternal = qs(selectors.videoExternal, container)
  const image = qs(selectors.image, container)

  if (videoExternal) {
    const { videoProvider, videoId, loop } = videoExternal.dataset
    switch (videoProvider) {
      case 'youtube':
        loadYouTubeAPI().then(() => {
          const player = new window.YT.Player(videoExternal, {
            videoId,
            playerVars: {
              mute: 1,
              controls: 0,
              playsinline: 1,
              rel: 0,
              loop: loop,
              playlist: videoId,
              autoplay: 1,
              disablekb: 1
            },
            events: {
              onReady: () => {
                player.getIframe().tabIndex = '-1'
                events.push(
                  listen(playTrigger, 'click', () => {

                    const { state } = playTrigger.dataset
                    if (state === 'pause') {
                      player.pauseVideo()
                      playTrigger.setAttribute('data-state', 'play')
                    } else {
                      player.playVideo()
                      playTrigger.setAttribute('data-state', 'pause')
                    }
                  }),
                )
              },
              onStateChange: (event) => {
                if (event.data == YT.PlayerState.PLAYING) {
                  player.getIframe().tabIndex = '0'
                  hideCover()
                }
              },
            },
          })
        })
        break

      case 'vimeo':
        loadVimeoAPI().then(() => {
          const player = new window.Vimeo.Player(videoExternal, {
            id: videoId,
            controls: false,
            keyboard: false,
            muted: 1,
            autoplay: 1
          })
          player.element.tabIndex = '-1'
          if (loop === 'true') {
            player.setLoop(1)
          }
          events.push(
            listen(playTrigger, 'click', () => {
              const { state } = playTrigger.dataset
              if (state === 'pause') {
                player.pause()
                playTrigger.setAttribute('data-state', 'play')
              } else {
                player.play()
                playTrigger.setAttribute('data-state', 'pause')
              }
            }),
          )
        })
        break

      default:
        break
    }
  }

  if (playTrigger) {
    if (video) {
      events.push(
        listen(playTrigger, 'click', () => {
          const { state } = playTrigger.dataset
          if (state === 'pause') {
            video.pause()
            playTrigger.setAttribute('data-state', 'play')
          } else {
            video.play()
            playTrigger.setAttribute('data-state', 'pause')
          }
        }),
      )
    }
  }

  if (video) {
    events.push(
      listen(video, 'playing', () => {

        video.setAttribute('controls', '')
        hideCover()
      }),
    )
    hideCover()
  }

  function hideCover() {
    image && remove(image, classes.visible)
  }

  if (shouldAnimate(container)) {
    animateVideo(container)
  }

  const unload = () => {
    playButtons && playButtons.forEach((button) => button.unload())
    events.forEach((unsubscribe) => unsubscribe())
    videoHandler && videoHandler()
    animateVideo?.destroy()
  }

  return { unload }
}
