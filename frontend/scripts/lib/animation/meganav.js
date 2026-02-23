import { contains, qsa } from '@fluorescent/dom'

import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  columns: '.meganav__list-parent > li',
  image: '.meganav__promo-image .image__img',
  overlay: '.meganav__secondary-promo-overlay',
  promoItems: '.meganav__secondary-promo-text > *',
  hasPromo: 'meganav--has-promo',
  promoLeft: 'meganav--promo-position-left',
}

export default (node) => {
  const delayItems = []

  const columnItems = qsa(selectors.columns, node)

  if (contains(node, selectors.hasPromo)) {
    delayOffset(node, [
      selectors.image,
      selectors.overlay,
      selectors.promoItems,
    ])
    if (contains(node, selectors.promoLeft)) {
      // Set columnItem initial delay to i + 1 of previously delayed
      assignColumnDelays(columnItems, 4)
    } else {
      assignColumnDelays(columnItems)
    }
  } else {
    assignColumnDelays(columnItems)
  }

  // Add the animation delay offset variables
  delayOffset(node, delayItems)

  function assignColumnDelays(items, delayMultiplier = 0) {
    let columnOffset
    items.forEach((item, i) => {
      const leftOffset = item.getBoundingClientRect
        ? item.getBoundingClientRect().left
        : item.offsetLeft

      if (i === 0) columnOffset = leftOffset

      if (columnOffset != leftOffset) {
        columnOffset = leftOffset
        delayMultiplier++
      }

      item.style.setProperty('--delay-offset-multiplier', delayMultiplier)
    })
  }
}
