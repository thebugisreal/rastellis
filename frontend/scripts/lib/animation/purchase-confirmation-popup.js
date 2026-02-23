import { add, remove } from '@fluorescent/dom'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  animationItems: '.animation--purchase-confirmation-item',
  animationFooterItems: '.animation--purchase-confirmation-footer-item',
}

const classes = {
  animationRevealed: 'animation--purchase-confirmation-revealed',
}

export default (node) => {
  function animate() {
    // Add the animation delay offset variables
    delayOffset(node, [selectors.animationItems])
    delayOffset(node, [selectors.animationFooterItems])

    // Trigger the reveal animation when the quick view is opened.
    setTimeout(() => {
      add(node, classes.animationRevealed)
    }, 0)
  }

  function reset() {
    remove(node, classes.animationRevealed)
  }

  return {
    animate,
    reset,
  }
}
