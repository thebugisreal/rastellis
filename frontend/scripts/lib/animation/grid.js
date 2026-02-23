import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  gridItems: '.grid-item',
}

export default (node) => {
  delayOffset(node, [selectors.gridItems])
  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer.destroy()
    },
  }
}
