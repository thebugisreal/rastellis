import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  items: '.animation--section-blocks > *',
}

export default (node) => {
  delayOffset(node, [selectors.items])

  const observer = intersectionWatcher(node, true)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
