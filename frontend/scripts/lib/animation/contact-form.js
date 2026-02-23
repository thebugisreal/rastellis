import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  headerItems: '.animation--section-introduction > *',
  animationItem: '.animation--item',
}

export default (node) => {
  delayOffset(node, [selectors.headerItems, selectors.animationItem])

  const observer = intersectionWatcher(node, true)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
