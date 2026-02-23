import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  items: '.stat-group__inner > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.items])

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
