import { qs, qsa, listen, add, remove } from '@fluorescent/dom'

import section from '@/scripts/glow/section'
import loadYouTubeAPI from '@/scripts/lib/load-youtube-api'
import loadVimeoAPI from '@/scripts/lib/load-vimeo-api'
import animateVideo from '@/scripts/lib/animation/video'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  video: '.video__video',
  videoExternal: '[data-video-external-target]',
  image: '.video__image',
  overlay: '.video__overlay',
  text: '.video__text-container-wrapper',
  playTrigger: '.video__text-container-wrapper',
}

const classes = {
  visible: 'visible',
}

section('video', {
  onLoad() {
    this.events = []
    const playTrigger = qs(selectors.playTrigger, this.container)
    const video = qs(selectors.video, this.container)
    const videoExternal = qs(selectors.videoExternal, this.container)
    const image = qs(selectors.image, this.container)
    const overlay = qs(selectors.overlay, this.container)
    const text = qs(selectors.text, this.container)

    if (videoExternal) {
      const { videoProvider, videoId, loop } = videoExternal.dataset
      switch (videoProvider) {
        case 'youtube':
          loadYouTubeAPI().then(() => {
            const player = new window.YT.Player(videoExternal, {
              videoId,
              playerVars: {
                autohide: 0,
                cc_load_policy: 0,
                controls: 1,
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                loop: loop,
                playlist: videoId,
              },
              events: {
                onReady: () => {
                  player.getIframe().tabIndex = '-1'
                  this.events.push(
                    listen(playTrigger, 'click', () => {
                      player.playVideo()
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
              controls: true,
              keyboard: false,
            })
            player.element.tabIndex = '-1'
            if (loop === 'true') {
              player.setLoop(1)
            }
            this.events.push(
              listen(playTrigger, 'click', () => {
                player.play()
                player.element.tabIndex = '0'
                hideCover()
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
        this.events.push(
          listen(playTrigger, 'click', () => {
            video.play()
          }),
        )
      }
    }

    if (video) {
      this.events.push(
        listen(video, 'playing', () => {
          video.setAttribute('controls', '')
          hideCover()
        }),
      )
    }

    function hideCover() {
      remove(overlay, classes.visible)
      remove(text, classes.visible)
      image && remove(image, classes.visible)
    }

    if (shouldAnimate(this.container)) {
      this.animateVideo = animateVideo(this.container)
    }
  },

  onUnload() {
    this.playButtons && this.playButtons.forEach((button) => button.unload())
    this.events.forEach((unsubscribe) => unsubscribe())
    this.videoHandler && this.videoHandler()
    this.animateVideo?.destroy()
  },
})
