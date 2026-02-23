import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  textContent: '.image-hero__text-container-inner > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.textContent], 3)

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
