import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  sectionBlockItems: '.animation--section-introduction > *',
  controls: '.animation--controls',
  items: '.animation--item',
}

export default (node) => {
  const delayItems = [
    selectors.sectionBlockItems,
    selectors.controls,
    selectors.items,
  ]

  // Add the animation delay offset variables
  delayOffset(node, delayItems)

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
