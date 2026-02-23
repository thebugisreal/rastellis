import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  headerItems: '.animation--section-introduction > *',
  columnItems: '.multi-column__grid-item',
}

export default (node) => {
  delayOffset(node, [selectors.headerItems, selectors.columnItems])
  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer.destroy()
    },
  }
}
