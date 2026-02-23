import { add, remove } from '@fluorescent/dom'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  animationItem: '.animation--drawer-menu-item',
}

const classes = {
  animationRevealed: 'animation--drawer-menu-revealed',
}

export default (node) => {
  delayOffset(node, [selectors.animationItem])

  // Trigger the reveal animation when the drawer is opened
  function open() {
    if (shouldAnimate(node)) {
      add(node, classes.animationRevealed)
    }
  }

  // Trigger the reveal animation when the drawer is opened
  function close() {
    if (shouldAnimate(node)) {
      remove(node, classes.animationRevealed)
    }
  }

  return {
    open,
    close,
  }
}
