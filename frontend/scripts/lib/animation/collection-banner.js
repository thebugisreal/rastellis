import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  image: '.collection-banner__image-container',
  content: '.collection-banner__text-container-inner > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.image, selectors.content])

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
