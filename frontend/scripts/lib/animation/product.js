import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  media: '.animation--product-media',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.media])

  const observer = intersectionWatcher(node, true)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
