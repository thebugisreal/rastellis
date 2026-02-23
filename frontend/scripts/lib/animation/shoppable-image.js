import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  introductionItems: '.section-introduction > *',
  image: '.shoppable-image__image-wrapper .image__img',
  hotspots: '.shoppable-item__hotspot-wrapper',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [
    selectors.introductionItems,
    selectors.image,
    selectors.hotspots,
  ])

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer.destroy()
    },
  }
}
