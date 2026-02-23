import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  sectionBlockItems: '.section-blocks > *',
  image: '.image-with-text-split__image .image__img',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.image])
  delayOffset(node, [selectors.sectionBlockItems], 6)

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
