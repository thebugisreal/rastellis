import { contains } from '@fluorescent/dom'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'
import getMediaQuery from '@/scripts/lib/media-queries'

const selectors = {
  introductionItems: '.section-introduction > *',
  media:
    '.complete-the-look__image-wrapper .image__img, .complete-the-look__image-wrapper .video',
  product: '.complete-the-look__product',
  products: '.complete-the-look__products',
}

const classes = {
  imageLeft: 'complete-the-look--image-left',
}

export default (node) => {
  const delayItems = []

  delayItems.push(selectors.introductionItems)

  // Create an array of selectors for the animation elements
  // in the order they should animate in
  if (
    contains(node, classes.imageLeft) ||
    window.matchMedia(getMediaQuery('below-720')).matches
  ) {
    delayItems.push(selectors.media)
    delayItems.push(selectors.products)
    delayItems.push(selectors.product)
  } else {
    delayItems.push(selectors.products)
    delayItems.push(selectors.product)
    delayItems.push(selectors.media)
  }

  // Add the animation delay offset variables
  delayOffset(node, delayItems)

  const observer = intersectionWatcher(node)

  return {
    destroy() {
      observer.destroy()
    },
  }
}
