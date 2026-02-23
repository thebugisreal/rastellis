import { qsa, add, remove } from '@fluorescent/dom'

const selectors = {
  animationItems: '.animation--store-availability-drawer-items > *',
}

const classes = {
  animationRevealed: 'animation--store-availability-drawer-revealed',
}

export default (node) => {
  function animate() {
    // Set the position offset on each time to be animated
    const items = qsa(selectors.animationItems, node)
    items.forEach((item, i) => {
      item.style.setProperty('--position-offset-multiplier', i)
    })

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
