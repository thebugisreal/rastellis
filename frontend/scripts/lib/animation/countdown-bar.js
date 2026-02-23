import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  items: `
  .sales-banner__bar-item--heading,
  .sales-banner__bar-text,
  .sales-banner__button,
  .countdown-banner__bar-item--heading,
  .countdown-banner__bar-item--timer,
  .countdown-banner__bar-text,
  .countdown-banner__button`,
}

export default (node) => {
  const observer = intersectionWatcher(node)
  delayOffset(node, [selectors.items])

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
