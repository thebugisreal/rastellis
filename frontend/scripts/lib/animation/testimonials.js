import { contains } from '@fluorescent/dom'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  content: '.testimonials__item-content > *',
  image: '.testimonials__item-product-image',
  imageCaption: '.testimonials__item-product-title',
  item: '.animation--item',
}

const classes = {
  imageRight: 'testimonials__item--image-placement-right',
}

export default (node) => {
  const delayItems = []

  // Create an array of selectors for the animation elements
  // in the order they should animate in
  if (contains(node, classes.imageRight)) {
    delayItems.push(selectors.content)
    delayItems.push(selectors.image)
    delayItems.push(selectors.imageCaption)
  } else {
    delayItems.push(selectors.image)
    delayItems.push(selectors.imageCaption)
    delayItems.push(selectors.content)
  }

  // Add the animation delay offset variables
  delayOffset(node, delayItems, 2)
  delayOffset(node, [selectors.item])
}
