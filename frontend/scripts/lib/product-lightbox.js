import { qsa, add } from '@fluorescent/dom'

const { icons } = window.theme

export default function productLightbox() {
  const lightboxImages = qsa('.lightbox-image', document)
  if (!lightboxImages.length) return

  let productLightbox

  import('@/scripts/manualChunks/photoswipe.js').then(
    ({ PhotoSwipeLightbox, PhotoSwipe }) => {
      productLightbox = new PhotoSwipeLightbox({
        gallery: '.lightbox-media-container',
        children: '.lightbox-image',
        showHideAnimationType: 'zoom',
        pswpModule: PhotoSwipe,
        mainClass: 'pswp--product-lightbox',
        bgOpacity: 1,
        arrowPrevSVG: icons.chevron,
        arrowNextSVG: icons.chevron,
        closeSVG: icons.close,
        zoomSVG: icons.zoom,
      })

      productLightbox.init()

      // Hide nav ui elements if single image
      productLightbox.on('firstUpdate', () => {
        const { pswp, options } = productLightbox
        const productImageCount = options.dataSource.items.length

        if (productImageCount === 1) {
          add(pswp.element, 'pswp--is-single-image')
        }
      })
    },
  )
}
