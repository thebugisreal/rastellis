import { qs, listen } from '@fluorescent/dom'
import loadYouTubeAPI from '@/scripts/lib/load-youtube-api'
import loadVimeoAPI from '@/scripts/lib/load-vimeo-api'

const selectors = {
  playButton: '[data-play-button-block]',
  playButtonVideoContainer: '[data-play-button-block-video-container]',
  photoSwipeElement: '.pswp',
  video: '.play-button-block-video',
}

const { icons } = window.theme

const playButton = (node) => {
  let photoSwipeInstance
  const playButton = qs(selectors.playButton, node)
  const videoHtml = qs(selectors.playButtonVideoContainer, node)
  const videoType = videoHtml.dataset.videoType

  import('@/scripts/manualChunks/photoswipe.js') // Load this ahead of needing

  const events = [
    listen(playButton, 'click', () => {
      import('@/scripts/manualChunks/photoswipe.js').then(
        ({ PhotoSwipeLightbox, PhotoSwipe }) => {
          photoSwipeInstance = new PhotoSwipeLightbox({
            dataSource: [{ html: videoHtml.outerHTML }],
            pswpModule: PhotoSwipe,
            mainClass: 'pswp--video-lightbox',
            closeSVG: icons.close,
            arrowPrev: false,
            arrowNext: false,
            zoom: false,
            counter: false,
          })
          photoSwipeInstance.init()
          photoSwipeInstance.loadAndOpen()
          photoSwipeInstance.on('bindEvents', () => {
            const instanceVideo = qs(
              selectors.video,
              photoSwipeInstance.pswp.container,
            )

            if (videoType == 'shopify') {
              instanceVideo.play()
            } else {
              initExternalVideo(instanceVideo)
            }
          })
        },
      )
    }),
  ]

  const initExternalVideo = (video) => {
    const { videoProvider, videoId } = video.dataset
    switch (videoProvider) {
      case 'youtube':
        loadYouTubeAPI().then(() => {
          const player = new window.YT.Player(video, {
            videoId,
            playerVars: {
              autohide: 0,
              cc_load_policy: 0,
              controls: 1,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              playlist: videoId,
            },
            events: {
              onReady: () => {
                player.playVideo()
                player.getIframe().tabIndex = '0'
              },
            },
          })
        })
        break

      case 'vimeo':
        loadVimeoAPI().then(() => {
          const player = new window.Vimeo.Player(video, {
            id: videoId,
            controls: true,
            keyboard: false,
          })

          player.play()
          player.element.tabIndex = '0'
        })
        break

      default:
        break
    }
  }

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
    photoSwipeInstance && photoSwipeInstance.destroy()
  }

  return { unload }
}

export default playButton
