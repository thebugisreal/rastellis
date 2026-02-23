import { listen, qs, qsa, toggle, add, remove } from '@fluorescent/dom'

import { updateFilters } from '@/scripts/lib/filters/events'
import priceRange from '@/scripts/lib/filters/price-range'
import updateInnerHTML from '@/scripts/lib/update-inner-html'
import replaceElement from '@/scripts/lib/replace-element'
import { on } from 'evx'
import { createFocusTrap } from 'focus-trap'
import debounce from '@/scripts/utils/debounce'
import { slideDown, slideUp, slideStop } from 'slide-anim'

const sel = {
  bar: '[data-filter-bar]',
  filterItem: '[data-filter-item]',
  dropdownToggle: '[data-dropdown-toggle]',
  group: '[data-filter-group]',
  groupLabels: '[data-filter-group-label]',
  groupValues: '[data-filter-group-values]',
  groupReset: '[data-filter-group-reset]',
  groupHeader: '[data-group-values-header]',
  priceRange: '[data-price-range]',
  rangeInput: '[data-range-input]',
  removeRange: '[data-remove-range]',
  filterInputs: '[data-filter-item-input]',
  sortInputs: '[data-sort-item-input]',
  resultsCount: '[data-results-count]',
  activeFilters: '[data-active-filters]',
  clearAll: '[data-clear-all-filters]',
}

const classes = {
  activeFilters: 'filters-active',
  filterDisabled: 'filter-item__content--disabled',
  filterBarActive: 'filter-bar__filters-inner--active',
  filterBarWashActive: 'filter-bar--wash-active',
  filterGroupActive: 'filter-group--active',
  filterGroupRight: 'filter-group__values--right',
}

// eslint-disable-next-line valid-jsdoc
/**
 * A class to handle desktop filter bar functionality
 * @param {*} node the collection section container
 * @returns renderFilters and unload methods
 */
const filterBar = (node) => {
  if (!node) {
    return false
  }

  // `node` is the colelction section container.
  // Using `container` here as the filter bar container to keep filter bar
  // and filter drawer DOM scope separate.
  const container = qs(sel.bar, node)
  const groupLabels = qsa(sel.groupLabels, container)
  const rangeInputs = qsa(sel.rangeInput, container)
  const rangeContainer = qs(sel.priceRange, container)
  let focusTrap = null

  let range = null

  if (rangeContainer) {
    range = priceRange(rangeContainer)
  }

  const filterDebounce = debounce()

  const events = [
    listen(window, 'click', clickHandler),
    listen(container, 'change', changeHandler),
    on('filters:filter-removed', () => syncActiveStates()),
    listen(container, 'keydown', ({ keyCode }) => {
      if (keyCode === 27) closeGroups()
    }),
  ]

  // eslint-disable-next-line valid-jsdoc
  /**
   * Delegates click events
   * @param {event} e click event
   */
  function clickHandler(e) {
    const group = e.target.closest(sel.group)
    const dropdownToggle = e.target.closest(sel.dropdownToggle)
    const groupReset = e.target.closest(sel.groupReset)
    const removeRange = e.target.closest(sel.removeRange)
    const clearAll = e.target.closest(sel.clearAll)

    // If the click happened outside of a filter group
    // We don't want to close the groups if the click happened on a filter in a group
    if (!group) {
      closeGroups()
    }

    if (dropdownToggle) {
      toggleDropdown(dropdownToggle)
    }

    if (groupReset) {
      handleGroupReset(groupReset)
    }

    if (removeRange) {
      e.preventDefault()
      priceRangeRemove()
    }

    if (clearAll) {
      e.preventDefault()
      clearAllFilters()
    }
  }

  function clearAllFilters() {
    range && range.reset()
    qsa(`${sel.filterInputs}`, container).forEach((input) => {
      input.checked = false
    })
    updateFilters(container)
  }

  function handleGroupReset(groupReset) {
    const group = groupReset.closest(sel.groupValues)
    const { filterType } = group.dataset

    if (filterType === 'price_range') {
      priceRangeRemove()
    } else {
      qsa(sel.filterInputs, group).forEach((input) => {
        input.checked = false
      })
      updateFilters(container)
    }
  }

  function priceRangeRemove() {
    range && range.reset()
    checkForActiveFilters()
    updateFilters(container)
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * Delegates change events
   * @param {event} e change event
   */
  function changeHandler(e) {
    const filterInput = e.target.closest(
      `${sel.bar} ${sel.filterInputs}, ${sel.bar} ${sel.sortInputs}`,
    )
    const rangeInput = e.target.closest(`${sel.bar} ${sel.rangeInput}`)

    if (filterInput) {
      checkForActiveFilters()
      filterChange(filterInput)
    } else if (rangeInput) {
      checkForActiveFilters()
      filterChange(rangeInput)
    }
  }

  function closeGroups() {
    groupLabels.forEach((button) => {
      hideDropdown(button)
    })
  }

  function toggleDropdown(button) {
    const ariaExpanded = button.getAttribute('aria-expanded') === 'true'
    if (ariaExpanded) {
      closeGroups()
      hideDropdown(button)
    } else {
      closeGroups()
      showDropdown(button)
    }
  }

  function showDropdown(button) {
    const group = button.closest(sel.group)
    button.setAttribute('aria-expanded', true)
    const dropdown = qs(`#${button.getAttribute('aria-controls')}`, container)
    const { dropdownToggle } = button.dataset
    if (dropdown) {
      if (dropdownToggle === 'filter-bar-filters') {
        slideStop(dropdown)
        slideDown(dropdown).then(() => {
          dropdown.setAttribute('aria-hidden', false)
        })
      } else {
        dropdown.setAttribute('aria-hidden', false)

        if (group) {
          add(group, classes.filterGroupActive)
          positionGroup(group, dropdown)

          // Lock the filter bar to stop horizontal scrolling
          add(container, classes.filterBarWashActive)
          focusTrap = createFocusTrap(group, { allowOutsideClick: true })
          focusTrap.activate()
        }
      }
    }
  }

  function hideDropdown(button) {
    const group = button.closest(sel.group)
    remove(container, classes.filterBarWashActive)
    button.setAttribute('aria-expanded', false)
    const dropdown = qs(`#${button.getAttribute('aria-controls')}`, container)
    const { dropdownToggle } = button.dataset
    if (dropdown) {
      dropdown.setAttribute('aria-hidden', true)
      if (dropdownToggle === 'filter-bar-filters') {
        slideStop(dropdown)
        slideUp(dropdown)
      } else if (group) {
        remove(group, classes.filterGroupActive)
        focusTrap && focusTrap.deactivate()
      }
    }
  }

  function positionGroup(group, dropdown) {
    remove(dropdown, classes.filterGroupRight)

    // The filter bar bounding rect
    const parentBounds = group.parentElement.getBoundingClientRect()
    // This filter groups bounding rect.
    // This will be around the toggle button
    // and what the drop down is positioned inside of
    const groupBounds = group.getBoundingClientRect()
    // The drop down bounding rect
    const dropdownBounds = dropdown.getBoundingClientRect()

    // Check if the drop down will stick out too far past the toggle button
    // Basicially checks if the drop down will overflow the page or not
    // 1. add the left side X position of the toggle button
    //    to the width of the drop down
    //    to get the left side position of the drop down
    // 2. If the left side of the drop down is past the width of the filter bar
    // 3. Add a class to the drop down to position it
    //    to the right side of the toggle button
    if (groupBounds.x + dropdownBounds.width >= parentBounds.width) {
      add(dropdown, classes.filterGroupRight)
    }
  }

  function updateGroupPositions() {
    const buttons = qsa(sel.dropdownToggle, container)

    buttons.forEach((button) => {
      const ariaExpanded = button.getAttribute('aria-expanded') === 'true'
      if (ariaExpanded) {
        const group = button.closest(sel.group)
        const dropdown = qs(
          `#${button.getAttribute('aria-controls')}`,
          container,
        )
        if (group && dropdown) {
          positionGroup(group, dropdown)
        }
      }
    })
  }

  function filterChange(filter) {
    if (filter.classList.contains(classes.filterDisabled)) {
      return
    }

    checkForActiveFilters()
    range && range.validateRange()
    filterDebounce(() => updateFilters(container), 1000)
  }

  function checkForActiveFilters() {
    const activeItems =
      containsCheckedInputs(qsa(sel.filterInputs, container)) ||
      rangeInputsHaveValue()

    toggle(container, classes.activeFilters, activeItems)
  }

  function rangeInputsHaveValue() {
    return rangeInputs.some((input) => input.value !== '')
  }

  function containsCheckedInputs(items) {
    return items.some((input) => input.checked)
  }

  function syncActiveStates() {
    let activeItems = false

    if (
      (rangeInputs && rangeInputsHaveValue()) ||
      containsCheckedInputs(qsa(sel.filterInputs, container))
    ) {
      activeItems = true
    }

    toggle(container, classes.activeFilters, activeItems)
  }

  function renderFilters(updatedDoc) {
    // This updates the contents of the filter groups, we omit the price
    // group because it doesn't change in liquid and there is a JS slider
    const updatedGroupContents = qsa(
      `${sel.bar} ${sel.groupValues}:not([data-filter-type="price_range"])`,
      updatedDoc,
    )

    updatedGroupContents.forEach((element) => {
      updateInnerHTML(`${sel.bar} ${sel.groupValues}#${element.id}`, updatedDoc)
    })

    updateInnerHTML(`${sel.bar} ${sel.resultsCount}`, updatedDoc)
    updateInnerHTML(`${sel.bar} ${sel.activeFilters}`, updatedDoc)
    updateInnerHTML(`${sel.bar} ${sel.groupHeader}`, updatedDoc)

    const updatedDropdownToggles = qsa(
      `${sel.bar} ${sel.dropdownToggle}`,
      updatedDoc,
    )
    if (updatedDropdownToggles.length > 0) {
      updatedDropdownToggles.forEach((updated) => {
        updateInnerHTML(
          `${sel.bar} [data-dropdown-toggle="${updated.getAttribute(
            'data-dropdown-toggle',
          )}"]`,
          updatedDoc,
        )
      })
    }
    const updatedGroupHeader = qsa(`${sel.bar} ${sel.groupHeader}`, updatedDoc)

    updatedGroupHeader.forEach((element) => {
      updateInnerHTML(
        `${sel.bar} [data-group-values-header="${element.getAttribute(
          'data-group-values-header',
        )}"]`,
        updatedDoc,
      )
    })

    updateGroupPositions()
  }

  function unload() {
    events.forEach((unsubscribe) => unsubscribe())
    range && range.unload()
    focusTrap && focusTrap.deactivate()
  }

  return {
    renderFilters,
    unload,
  }
}

export default filterBar
