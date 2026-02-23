import { qsa, add, remove } from '@fluorescent/dom'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  flyouts: '[data-filter-modal]',
  animationFilterDrawerItem: '.animation--filter-drawer-item',
}

const classes = {
  animationRevealed: 'animation--filter-bar-revealed',
  animationFilterDrawerItem: 'animation--filter-drawer-item',
}

export default (node) => {
  const flyouts = qsa(selectors.flyouts, node)
  flyouts.forEach(_setupItemOffsets)

  // Set the position offset on each time to be animated
  function _setupItemOffsets(flyout) {
    delayOffset(flyout, [selectors.animationFilterDrawerItem])
  }

  // Trigger the reveal animation when the drawer is opened
  function open(flyout) {
    add(flyout, classes.animationRevealed)
  }

  // Reset the reveal animation when the drawer is closed
  function close(flyouts) {
    remove(flyouts, classes.animationRevealed)
  }

  return {
    open,
    close,
  }
}
