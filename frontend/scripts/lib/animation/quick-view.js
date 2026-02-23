import { add, remove } from '@fluorescent/dom'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  animationItems: '.animation--quick-view-items > *',
}

const classes = {
  animationRevealed: 'animation--quick-view-revealed',
}

export default (node) => {
  function animate() {
    // Add the animation delay offset variables
    delayOffset(node, [selectors.animationItems])

    // Trigger the reveal animation when the quick view is opened.
    // We can't use the `.is-visible` class added in `quick-view-modal.js`
    // because it can be added before the content is fetched.
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
