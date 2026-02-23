import { qs } from '@fluorescent/dom'

/**
 * Takes a selector and updates the innerHTML of that element with the contents found in the updated document
 * @param {*} selector The selector to target
 * @param {*} doc The updated document returned by the fetch request
 */
export default function updateInnerHTML(selector, doc) {
  const updatedItem = qs(selector, doc)
  const oldItem = qs(selector)
  if (updatedItem && oldItem) {
    oldItem.innerHTML = updatedItem.innerHTML
  }
}
