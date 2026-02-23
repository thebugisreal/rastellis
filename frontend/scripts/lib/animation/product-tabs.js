import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  controls: '.product-tabs__tab-buttons',
  items: '.product-tabs__tab-list-wrapper',
  accordionItems: '.accordion',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.controls, selectors.items])
  delayOffset(node, [selectors.accordionItems])

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
