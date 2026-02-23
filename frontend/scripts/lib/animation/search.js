import { qs, qsa, add, remove } from '@fluorescent/dom'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  partial: '[data-partial]',
  filterBar: '[data-filter-bar]',
  mobileFilterBar: '[data-mobile-filters]',
  productItems: '.animation--item:not(.animation--item-revealed)',
}

const classes = {
  hideProducts: 'animation--search-products-hide',
  itemRevealed: 'animation--item-revealed',
}

export default (node) => {
  const partial = qs(selectors.partial, node)
  const filterbarEl = qs(selectors.filterBar, node)
  const mobileFilterBarEl = qs(selectors.mobileFilterBar, node)

  let filterbarObserver = null
  if (filterbarEl) {
    filterbarObserver = intersectionWatcher(filterbarEl, true)
  }
  let mobileFilterBarObserver = null
  if (mobileFilterBarEl) {
    mobileFilterBarObserver = intersectionWatcher(mobileFilterBarEl, true)
  }

  _setupProductItem()

  function _setupProductItem() {
    let productItems = qsa(selectors.productItems, node)
    delayOffset(node, [selectors.productItems])
    setTimeout(() => {
      add(productItems, classes.itemRevealed)
    }, 0)
  }

  // Scroll to top of search grid after applying filters
  // to show the newly filtered list of products
  function _scrollIntoView() {
    const y =
      partial.getBoundingClientRect().top +
      window.pageYOffset -
      filterbarEl.getBoundingClientRect().height
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  function updateContents() {
    _setupProductItem()
    // Remove the fade out class
    remove(partial, classes.hideProducts)
    _scrollIntoView()
  }

  function infiniteScrollReveal() {
    _setupProductItem()
  }

  return {
    updateContents,
    infiniteScrollReveal,
    destroy() {
      filterbarObserver?.destroy()
      mobileFilterBarObserver?.destroy()
    },
  }
}
