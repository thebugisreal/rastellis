import delayOffset from '@/scripts/lib/animation/delay-offset'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'

const selectors = {
  pageItems: '.page-section__inner > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.pageItems])

  const observer = intersectionWatcher(node, true)

  return {
    destroy() {
      observer.forEach((observer) => observer.destroy())
    },
  }
}
