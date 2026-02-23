import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  content: '.animation--section-blocks > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.content])

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
