import { qs, add, remove } from '@fluorescent/dom'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  sidebar: '.filter-sidebar-inner',
  sidebarItem: '.animation--filter-drawer-item',
}

const classes = {
  animationRevealed: 'animation--filter-sidebar-revealed',
}

export default (node) => {
  const sidebar = qs(selectors.sidebar, node)

  // Set the position offset on each time to be animated
  delayOffset(sidebar, [selectors.sidebarItem])

  // Trigger the reveal animation when the drawer is opened
  function open(sidebar) {
    add(sidebar, classes.animationRevealed)
  }

  // Reset the reveal animation when the drawer is closed
  function close(sidebar) {
    remove(sidebar, classes.animationRevealed)
  }

  return {
    open,
    close,
  }
}
