import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  sectionBlockItems: '.section-blocks > *',
  image: '.image-with-text__image .image__img',
  imageSmall: '.image-with-text__small-image .image__img',
  imageCaption: '.image-with-text__image-caption',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [
    selectors.image,
    selectors.imageSmall,
    selectors.imageCaption,
  ])
  delayOffset(node, [selectors.sectionBlockItems], 6)

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
