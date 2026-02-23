import { add } from '@fluorescent/dom'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  headerItems: '.animation--section-introduction > *',
  eventItems: '.event-item',
}

export default (node) => {
  delayOffset(node, [selectors.headerItems])

  const observer = intersectionWatcher(node, true)

  function animateEventItems() {
    delayOffset(node, [selectors.eventItems])
    setTimeout(() => {
      add(node, 'animate-event-items')
    }, 50)
  }

  return {
    animateEventItems,
    destroy() {
      observer?.destroy()
    },
  }
}
