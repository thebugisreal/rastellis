import { qsa } from '@fluorescent/dom'

/**
 * delayOffset takes an array of selectors and sets the `--delay-offset-multiplier` variable in the correct order
 * @param {node} element The section element
 * @param {items} array Array of animation items
 */
export default (node, items, offsetStart = 0) => {
  let delayOffset = offsetStart
  items.forEach((selector) => {
    const items = qsa(selector, node)
    items.forEach((item) => {
      item.style.setProperty('--delay-offset-multiplier', delayOffset)
      delayOffset++
    })
  })
}
