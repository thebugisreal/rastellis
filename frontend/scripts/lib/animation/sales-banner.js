import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  saleAmount: '.animation--sale-amount',
  sectionBlockItems: '.animation--section-blocks > *',
  saleItems: `.sale-promotion .sale-promotion__type,
  .sale-promotion .sale-promotion__unit-currency,
  .sale-promotion .sale-promotion__unit-percent,
  .sale-promotion .sale-promotion__unit-off,
  .sale-promotion .sale-promotion__amount,
  .sale-promotion .sale-promotion__per-month,
  .sale-promotion .sale-promotion__per-year,
  .sale-promotion .sale-promotion__terms,
  .sale-promotion .sales-banner__button`,
}

export default (node) => {
  const leftColumnDelayItems = [selectors.saleAmount, selectors.saleItems]
  const rightColumnDelayItems = [selectors.sectionBlockItems]

  // Add the animation delay offset variables
  delayOffset(node, leftColumnDelayItems)
  delayOffset(node, rightColumnDelayItems, 1)

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer?.destroy()
    },
  }
}
