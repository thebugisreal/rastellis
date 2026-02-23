import { qs, qsa, add, remove } from '@fluorescent/dom'
import intersectionWatcher from '@/scripts/lib/animation/intersection-watcher'
import delayOffset from '@/scripts/lib/animation/delay-offset'

const selectors = {
  stickyHeader: ".header[data-enable-sticky-header='true']",
  partial: '[data-partial]',
  filterBar: '[data-filter-bar]',
  mobileFilterBar: '[data-mobile-filters]',
  productItems: '.animation--item:not(.animation--item-revealed)',
}

const classes = {
  hideProducts: 'animation--collection-products-hide',
  itemRevealed: 'animation--item-revealed',
  stickyFilterBar: 'filter-bar--sticky',
}

export default (node) => {
  const stickyHeader = qs(selectors.stickyHeader, document)
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

  setupProductItem()

  function setupProductItem() {
    let productItems = qsa(selectors.productItems, node)
    delayOffset(node, [selectors.productItems])
    setTimeout(() => {
      add(productItems, classes.itemRevealed)
    }, 0)
  }

  // Scroll to top of collection grid after applying filters
  // to show the newly filtered list of products
  function _scrollIntoView() {
    const stickyHeaderHeight = stickyHeader
      ? stickyHeader.getBoundingClientRect().height / 2
      : 0

    const y =
      node.getBoundingClientRect().top + window.pageYOffset - stickyHeaderHeight

    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  function updateContents() {
    setupProductItem()
    // Remove the fade out class
    remove(partial, classes.hideProducts)
    _scrollIntoView()
  }

  function infiniteScrollReveal() {
    setupProductItem()
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
