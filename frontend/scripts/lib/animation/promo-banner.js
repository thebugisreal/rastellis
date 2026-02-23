import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  giantHeading: '.animation--giant-heading',
  sectionBlockItems: '.animation--section-blocks > *',
}

export default (node) => {
  // Add the animation delay offset variables
  delayOffset(node, [selectors.giantHeading, selectors.sectionBlockItems])

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
