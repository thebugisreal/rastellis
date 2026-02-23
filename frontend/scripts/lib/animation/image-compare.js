import { add, remove } from '@fluorescent/dom'
import getMediaQuery from '@/scripts/lib/media-queries'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const classes = {
  animation: 'animation--image-compare',
}

const selectors = {
  introductionItems: '.animation--section-introduction > *',
  image: '.image_compare__image-wrapper .image__img',
  labels: '.image-compare__label-container',
  sliderLine: '.image-compare__slider-line',
  sliderButton: '.image-compare__slider-button',
}

export default (node) => {
  delayOffset(node, [
    selectors.introductionItems,
    selectors.image,
    selectors.labels,
    selectors.sliderLine,
    selectors.sliderButton,
  ])

  const margin = window.matchMedia(getMediaQuery('above-720')).matches
    ? 200
    : 100
  const threshold = Math.min(margin / node.offsetHeight, 0.5)

  const observer = new IntersectionObserver(
    ([{ isIntersecting: visible }]) => {
      if (visible) {
        add(node, 'is-visible')

        // Enable slider controls by removing animation class after animation duration
        setTimeout(() => {
          remove(node, classes.animation)
        }, 1200)

        observer.disconnect()
      }
    },
    { threshold: threshold },
  )

  observer.observe(node)

  return {
    destroy() {
      observer.destroy()
    },
  }
}
