import { qs } from '@fluorescent/dom'

/**
 * Takes a selector and replaces the element with the new element found in the updated document
 * @param {*} selector The selector to target
 * @param {*} doc The updated document returned by the fetch request
 */
export default function replaceElement(selector, doc) {
  const updatedItem = qs(selector, doc)
  const oldItem = qs(selector)
  if (updatedItem && oldItem) {
    oldItem.parentElement.replaceChild(updatedItem, oldItem)
  }
}
