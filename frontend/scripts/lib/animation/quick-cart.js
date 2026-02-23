import { add, remove } from '@fluorescent/dom'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  animationItem:
    '.animation--quick-cart-items > *, .animation--quick-cart-footer',
}

const classes = {
  animationRevealed: 'animation--quick-cart-revealed',
}

export default (node) => {
  setup()

  // Trigger the reveal animation when the drawer is opened
  function open() {
    add(node, classes.animationRevealed)
  }

  // Reset the reveal animation when the drawer is closed
  function close() {
    remove(node, classes.animationRevealed)
  }

  // Setup delay offsets
  function setup() {
    delayOffset(node, [selectors.animationItem])
  }

  return {
    open,
    close,
    setup,
  }
}
