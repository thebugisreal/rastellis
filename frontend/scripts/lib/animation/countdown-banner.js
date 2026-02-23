import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  sectionBlockItems: '.section-blocks > *',
}

export default (node) => {
  const observer = intersectionWatcher(node)
  delayOffset(node, [selectors.sectionBlockItems])

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
