import { createFocusTrap } from 'focus-trap'
import { add, listen, qs, qsa, remove, toggle } from '@fluorescent/dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { slideDown, slideUp, slideStop } from 'slide-anim'

import { updateFilters } from '@/scripts/lib/filters/events'
import priceRange from '@/scripts/lib/filters/price-range'
import updateInnerHTML from '@/scripts/lib/update-inner-html'
import { on } from 'evx'
import debounce from '@/scripts/utils/debounce'
import animateFilterDrawer from '@/scripts/lib/animation/filter-drawer'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const sel = {
  drawer: '[data-filter-drawer]',
  drawerTitle: '[data-filter-drawer-title]',
  filter: '[data-filter]',
  filterItem: '[data-filter-item]',
  filterTarget: '[data-filter-drawer-target]',
  flyouts: '[data-filter-modal]',
  button: '[data-button]',
  wash: '[data-drawer-wash]',
  sort: '[data-sort]',
  close: '[data-close-icon]',
  group: '.filter-drawer__group',
  groupToggle: '[data-drawer-group-toggle]',
  groupContents: '.filter-drawer__group-filter-wrapper',
  panel: '.filter-drawer__panel',
  flyoutWrapper: '[data-filter-modal-wrapper]',
  priceRange: '[data-price-range]',
  resultsCount: '[data-results-count]',
  activeFilters: '[data-active-filters]',
  activeFilterCount: '[data-active-filter-count]',
}

const classes = {
  active: 'active',
  activeFilters: 'filters-active',
  fixed: 'is-fixed',
  filterDisabled: 'filter-item__content--disabled',
}

const filterDrawer = (node) => {
  if (!node) {
    return false
  }

  const container = qs(sel.drawer, node)
  if (!container) {
    return false
  }

  const flyouts = qsa(sel.flyouts, container)
  const wash = qs(sel.wash, container)
  const rangeInputs = qsa('[data-range-input]', container)
  let focusTrap = null
  let range = null
  let filterDrawerAnimation = null
  if (shouldAnimate(node)) {
    filterDrawerAnimation = animateFilterDrawer(container)
  }
  const rangeContainer = qs(sel.priceRange, container)

  if (rangeContainer) {
    range = priceRange(rangeContainer)
  }

  const filterDrawerDebounce = debounce()

  const events = [
    listen(qsa(sel.filterTarget, node), 'click', clickFlyoutTrigger),
    listen(container, 'change', changeHandler),
    listen(wash, 'click', clickWash),
    listen(
      qsa(`${sel.button}, ${sel.clearAll}`, container),
      'click',
      clickButton,
    ),
    listen(qsa(sel.close, container), 'click', clickWash),
    listen(container, 'keydown', ({ keyCode }) => {
      if (keyCode === 27) clickWash()
    }),
    listen(rangeInputs, 'change', rangeChanged),
    on('filters:filter-removed', () => syncActiveStates()),
  ]

  function changeHandler(e) {
    if (e.target.classList.contains('filter-item__checkbox')) {
      filterChange(e.target)
    } else if (e.target.classList.contains('filter-item__radio')) {
      sortChange(e)
    }
  }

  function clickFlyoutTrigger(e) {
    e.preventDefault()
    const { filterDrawerTarget } = e.currentTarget.dataset
    const modal = qs(`[data-filter-modal="${filterDrawerTarget}"]`, container)
    focusTrap = createFocusTrap(modal, { allowOutsideClick: true })

    add(container, classes.fixed)

    setTimeout(() => {
      if (shouldAnimate(node)) {
        filterDrawerAnimation.open(modal)
      }
      add(container, classes.active)
      add(modal, classes.active)
    }, 0)

    modal.setAttribute('aria-hidden', 'false')
    focusTrap.activate()
    document.body.setAttribute('data-fluorescent-overlay-open', 'true')
    disableBodyScroll(node, {
      allowTouchMove: (el) => {
        while (el && el !== document.body) {
          if (el.getAttribute('data-scroll-lock-ignore') !== null) {
            return true
          }
          el = el.parentNode
        }
      },
      reserveScrollBarGap: true,
    })
  }

  function clickWash(e) {
    e && e.preventDefault()

    focusTrap && focusTrap.deactivate()

    remove(flyouts, classes.active)
    remove(container, classes.active)
    flyouts.forEach((flyout) => flyout.setAttribute('aria-hidden', 'true'))
    document.body.setAttribute('data-fluorescent-overlay-open', 'false')
    enableBodyScroll(node)

    setTimeout(() => {
      remove(container, classes.fixed)
      if (shouldAnimate(node)) {
        filterDrawerAnimation.close(flyouts)
      }
    }, 500)
  }

  function filterChange(filter) {
    if (filter.classList.contains(classes.filterDisabled)) {
      return
    }
    checkForActiveModalitems(filter)

    range && range.validateRange()
    filterDrawerDebounce(() => updateFilters(container), 1000)
  }

  function sortChange(e) {
    checkForActiveModalitems(e.target)
    range && range.validateRange()
    updateFilters(container)
  }

  function rangeChanged(e) {
    checkForActiveModalitems(e.currentTarget)

    const wrappingContainer = e.target.closest(sel.group)

    wrappingContainer &&
      toggle(wrappingContainer, classes.activeFilters, rangeInputsHaveValue())

    updateFilters(container)
  }

  function clickButton(e) {
    e.preventDefault()
    const { button } = e.currentTarget.dataset

    const scope = e.currentTarget.closest(sel.flyouts)
    const { filterModal } = scope.dataset

    if (button === 'close') {
      clickWash()
    }

    // Sort flyouts
    if (filterModal === '__sort') {
      if (button === 'clear-all') {
        qsa(`[data-filter-modal="__sort"] ${sel.sort}`, container).forEach(
          (element) => {
            qs('input', element).checked = false
          },
        )
        remove(e.currentTarget.closest(sel.panel), classes.activeFilters)
      }
    } else {
      // Regular filter flyout

      if (button === 'clear-all') {
        qsa('input', scope).forEach((input) => {
          input.checked = false
        })

        const panel = e.currentTarget.closest(sel.panel)
        remove([...qsa(sel.group, panel), panel], classes.activeFilters)
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

  function containsCheckedInputs(items) {
    return items.some((input) => input.checked)
  }

  function rangeInputsHaveValue() {
    return rangeInputs.some((input) => input.value !== '')
  }

  function checkForActiveModalitems(currentTarget) {
    const panel = currentTarget.closest(sel.panel)

    if (!panel) return

    const activeItems =
      containsCheckedInputs(qsa('input', panel)) || rangeInputsHaveValue()

    toggle(panel, classes.activeFilters, activeItems)
  }

  function syncActiveStates() {
    const panels = qsa(sel.panel, container)

    panels.forEach((panel) => {
      let activeItems = false
      const rangeInputs = qs('[data-range-input]', panel)

      if (containsCheckedInputs(qsa('input', panel))) {
        activeItems = true
      }

      if (rangeInputs && rangeInputsHaveValue()) {
        activeItems = true
      }

      toggle(panel, classes.activeFilters, activeItems)
    })
  }

  function renderFilters(updatedDoc) {
    // This updates the contents of the filter groups, we omit the price
    // group because it doesn't change in liquid and there is a JS slider
    const updatedGroupContents = qsa(
      `${sel.drawer} ${sel.groupContents}:not(#drawer-group-price)`,
      updatedDoc,
    )

    updatedGroupContents.forEach((element) => {
      updateInnerHTML(
        `${sel.drawer} ${sel.groupContents}#${element.id}`,
        updatedDoc,
      )
    })

    const updatedGroupToggles = qsa(
      `${sel.drawer} ${sel.groupToggle}`,
      updatedDoc,
    )
    updatedGroupToggles.forEach((element) => {
      updateInnerHTML(
        `${sel.drawer} [data-drawer-group-toggle="${element.getAttribute(
          'data-drawer-group-toggle',
        )}"]`,
        updatedDoc,
      )
    })

    updateInnerHTML(`${sel.drawer} ${sel.resultsCount}`, updatedDoc)
    updateInnerHTML(`${sel.drawer} ${sel.activeFilters}`, updatedDoc)
    updateInnerHTML(`${sel.drawer} ${sel.drawerTitle}`, updatedDoc)
    updateInnerHTML(
      `[data-mobile-filters] [data-mobile-filters-toggle]`,
      updatedDoc,
    )
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

export default filterDrawer
