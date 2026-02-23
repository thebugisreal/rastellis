import { listen, qs, qsa, toggle } from '@fluorescent/dom'
import { slideDown, slideUp, slideStop } from 'slide-anim'

import { updateFilters } from '@/scripts/lib/filters/events'
import priceRange from '@/scripts/lib/filters/price-range'
import updateInnerHTML from '@/scripts/lib/update-inner-html'
import debounce from '@/scripts/utils/debounce'
import animateFilterSidebar from '@/scripts/lib/animation/filter-sidebar'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const sel = {
  sidebar: '[data-filter-sidebar]',
  sidebarToggle: '.filter-bar__button--filters[data-filter-location="sidebar"]',
  sidebarToggleText: '.filter-bar__button-text',
  filterBar: '[data-filter-bar]',
  filter: '[data-filter]',
  filterItem: '[data-filter-item]',
  filterInputs: '[data-filter-item-input]',
  button: '[data-button]',
  group: '.filter-drawer__group',
  groupToggle: '[data-drawer-group-toggle]',
  groupContents: '.filter-drawer__group-filter-wrapper',
  priceRange: '[data-price-range]',
}

const classes = {
  active: 'active',
  activeFilters: 'filters-active',
  filterDisabled: 'filter-item__content--disabled',
}

const filterSidebar = (node) => {
  if (!node) {
    return false
  }

  const container = qs(sel.sidebar, node)

  if (!container) {
    return false
  }

  let filterSidebarAnimation = null

  if (shouldAnimate(node)) {
    filterSidebarAnimation = animateFilterSidebar(container)

    if (container.getAttribute('aria-expanded') === 'true') {
      filterSidebarAnimation.open(container)
    } else {
      filterSidebarAnimation.close(container)
    }
  }

  const filterBar = qs(sel.filterBar, node)
  const rangeInputs = qsa('[data-range-input]', container)
  const rangeContainer = qs(sel.priceRange, container)
  let range = null

  if (rangeContainer) {
    range = priceRange(rangeContainer)
  }

  const filterDebounce = debounce()

  const events = [
    listen(container, 'change', changeHandler),
    listen(qs(sel.sidebarToggle, node), 'click', clickSidebarToggle),
    listen(
      qsa(`${sel.button}, ${sel.clearAll}`, container),
      'click',
      clickButton,
    ),
    listen(rangeInputs, 'change', rangeChanged),
  ]

  function clickSidebarToggle(e) {
    e.preventDefault()

    const sidebarToggle = e.currentTarget
    const { collapsedTitle, expandedTitle } = sidebarToggle.dataset
    const buttonTextEl = qs(sel.sidebarToggleText, sidebarToggle)

    if (container.getAttribute('aria-expanded') === 'true') {
      container.setAttribute('aria-expanded', 'false')
      buttonTextEl.innerText = collapsedTitle

      setTimeout(() => {
        if (shouldAnimate(node)) {
          filterSidebarAnimation.close(container)
        }
      }, 0)
    } else {
      container.setAttribute('aria-expanded', 'true')
      buttonTextEl.innerText = expandedTitle

      setTimeout(() => {
        if (shouldAnimate(node)) {
          filterSidebarAnimation.open(container)
        }
      }, 0)
    }
  }

  function changeHandler(e) {
    filterChange(e.target)
  }

  function filterChange(filter) {
    if (filter.classList.contains(classes.filterDisabled)) {
      return
    }

    checkForActiveFilters()
    range && range.validateRange()
    filterDebounce(() => updateFilters(container), 1000)
  }

  function rangeChanged(e) {
    const wrappingContainer = e.target.closest(sel.group)

    wrappingContainer &&
      toggle(wrappingContainer, classes.activeFilters, rangeInputsHaveValue())

    updateFilters(container)
  }

  function clickButton(e) {
    e.preventDefault()
    const { button } = e.currentTarget.dataset

    if (button === 'clear-all') {
      qsa('input', container).forEach((input) => {
        input.checked = false
      })

      range && range.reset()
      updateFilters(container)
    }

    if (button === 'group_toggle') {
      const group = qs(`#${e.currentTarget.getAttribute('aria-controls')}`)
      const ariaExpanded =
        e.currentTarget.getAttribute('aria-expanded') === 'true'
      slideStop(group)

      if (ariaExpanded) {
        closeGroup(e.currentTarget, group)
      } else {
        openGroup(e.currentTarget, group)
      }
    }
  }

  function openGroup(button, group) {
    slideDown(group)
    button.setAttribute('aria-expanded', true)
    group.setAttribute('aria-hidden', false)
  }

  function closeGroup(button, group) {
    slideUp(group)
    button.setAttribute('aria-expanded', false)
    group.setAttribute('aria-hidden', true)
  }

  function checkForActiveFilters() {
    const activeItems =
      containsCheckedInputs(qsa(sel.filterInputs, container)) ||
      rangeInputsHaveValue()

    toggle(filterBar, classes.activeFilters, activeItems)
  }

  function rangeInputsHaveValue() {
    return rangeInputs.some((input) => input.value !== '')
  }

  function containsCheckedInputs(items) {
    return items.some((input) => input.checked)
  }

  function renderFilters(updatedDoc) {
    // This updates the contents of the filter groups, we omit the price
    // group because it doesn't change in liquid and there is a JS slider
    const updatedGroupContents = qsa(
      `${sel.sidebar} ${sel.groupContents}:not([data-filter-type="price_range"])`,
      updatedDoc,
    )

    updatedGroupContents.forEach((element) => {
      updateInnerHTML(
        `${sel.sidebar} ${sel.groupContents}#${element.id}`,
        updatedDoc,
      )
    })

    // This updates the counts and labels, without changing the toggled state
    const updatedGroupToggles = qsa(
      `${sel.sidebar} ${sel.groupToggle}`,
      updatedDoc,
    )

    updatedGroupToggles.forEach((element) => {
      updateInnerHTML(
        `${sel.sidebar} [data-drawer-group-toggle="${element.getAttribute(
          'data-drawer-group-toggle',
        )}"]`,
        updatedDoc,
      )
    })

    updateInnerHTML(`${sel.filterBar} ${sel.resultsCount}`, updatedDoc)
    updateInnerHTML(`${sel.filterBar} ${sel.activeFilters}`, updatedDoc)
    updateInnerHTML(`${sel.filterBar} ${sel.sidebarToggle}`, updatedDoc)
  }

  function unload() {
    events.forEach((unsubscribe) => unsubscribe())
    range && range.unload()
  }

  return {
    renderFilters,
    unload,
  }
}

export default filterSidebar
