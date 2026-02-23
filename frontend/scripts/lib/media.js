import { add, listen, qs, qsa, remove } from '@fluorescent/dom'

export default function Media(node) {
  if (!node) return
  const { Shopify, YT } = window
  const { icons } = window.theme
  const elements = qsa('[data-interactive]', node)

  if (!elements.length) return

  const acceptedTypes = ['video', 'model', 'external_video']
  let activeMedia = null
  let featuresLoaded = false
  let instances = {}

  const selectors = {
    mediaContainer: '.media',
    videoPoster: '.mobile-media-carousel__poster',
  }

  const mediaContainers = qsa(selectors.mediaContainer, node)

  let hasMobileVideoModal = false
  mediaContainers.forEach((mediaContainer) => {
    if (mediaContainer.dataset.hasMobileVideoModal === 'true') {
      hasMobileVideoModal = true
      return
    }
  })

  if (featuresLoaded) {
    elements.forEach(initElement)
  }

  window.Shopify.loadFeatures(
    [
      {
        name: 'model-viewer-ui',
        version: '1.0',
      },
      {
        name: 'shopify-xr',
        version: '1.0',
      },
      {
        name: 'video-ui',
        version: '1.0',
      },
    ],
    () => {
      featuresLoaded = true

      if ('YT' in window && Boolean(YT.loaded)) {
        elements.forEach(initElement)
      } else {
        window.onYouTubeIframeAPIReady = function () {
          elements.forEach(initElement)
        }
      }
    },
  )

  function initElement(el) {
    const { mediaId, mediaType } = el.dataset
    if (!mediaType || !acceptedTypes.includes(mediaType)) return

    if (Object.keys(instances).includes(mediaId)) return

    let instance = {
      id: mediaId,
      type: mediaType,
      container: el,
      media: el.children[0],
    }

    switch (instance.type) {
      case 'video':
        instance.player = new Shopify.Plyr(instance.media, {
          loop: { active: el.dataset.loop == 'true' },
        })
        break

      case 'external_video': {
        if (hasMobileVideoModal) {
          const photoSwipe = import('@/scripts/manualChunks/photoswipe.js')
          const videoPoster = qs(selectors.videoPoster, instance.container)
          let photoSwipeInstance

          photoSwipe.then(({ PhotoSwipeLightbox, PhotoSwipe }) => {
            photoSwipeInstance = new PhotoSwipeLightbox({
              dataSource: [{ html: instance.media.outerHTML }],
              pswpModule: PhotoSwipe,
              mainClass: 'pswp--product-lightbox',
              closeSVG: icons.close,
              arrowPrev: false,
              arrowNext: false,
              zoom: false,
              counter: false,
            })

            photoSwipeInstance.init()

            listen(videoPoster, 'click', () => {
              photoSwipeInstance.loadAndOpen()
            })
          })
        }
        break
      }

      case 'model':
        instance.viewer = new Shopify.ModelViewerUI(qs('model-viewer', el))

        listen(qs('.model-poster', el), 'click', (e) => {
          e.preventDefault()
          playModel(instance)
        })
        break
    }

    if (instance.player) {
      if (instance.type === 'video') {
        instance.player.on('playing', () => {
          pauseActiveMedia(instance)
          activeMedia = instance
        })
      } else if (instance.type === 'external_video') {
        instance.player.addEventListener('onStateChange', (event) => {
          if (event.data === 1) {
            pauseActiveMedia(instance)
            activeMedia = instance
          }
        })
      }
    }
  }

  function playModel(instance) {
    pauseActiveMedia(instance)
    instance.viewer.play()
    add(instance.container, 'model-active')
    activeMedia = instance

    setTimeout(() => {
      qs('model-viewer', instance.container).focus()
    }, 300)
  }

  function pauseActiveMedia(instance) {
    if (!activeMedia || instance == activeMedia) return

    if (activeMedia.player) {
      if (activeMedia.type === 'video') {
        activeMedia.player.pause()
      } else if (activeMedia.type === 'external_video') {
        activeMedia.player.pauseVideo()
      }

      activeMedia = null
      return
    }

    if (activeMedia.viewer) {
      remove(activeMedia.container, 'model-active')
      activeMedia.viewer.pause()
      activeMedia = null
    }
  }

  return { pauseActiveMedia }
}
