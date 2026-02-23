import { remove, add, qs } from '@fluorescent/dom'

const selectors = {
  accordionShell: '.accordion.product-reviews',
  accordionContent: '.accordion__content',
}

const classes = {
  hidden: 'hidden',
  accordion: 'accordion',
}

export default function (node, container) {
  if (!node) return

  const parentAppBlockContainer = node.parentNode
  const accordion = qs(selectors.accordionShell, container)
  const accordionContent = qs(selectors.accordionContent, accordion)

  // Move the contents of the reviews app into the accordion shell
  // Then move the contents with the accrdion back into the original
  // location.
  accordionContent.appendChild(node)
  parentAppBlockContainer.appendChild(accordion)
  add(parentAppBlockContainer, classes.accordion)
  remove(accordion, classes.hidden)
}
