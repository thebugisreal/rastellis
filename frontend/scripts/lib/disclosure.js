import { listen, qs, qsa, add, remove } from '@fluorescent/dom'

const selectors = {
  headerInner: '.header__inner',
  form: '.disclosure-form',
  list: '[data-disclosure-list]',
  toggle: '[data-disclosure-toggle]',
  input: '[data-disclosure-input]',
  option: '[data-disclosure-option]',
}

const classes = {
  disclosureListRight: 'disclosure-list--right',
  disclosureListTop: 'disclosure-list--top',
}

function has(list, selector) {
  return list.map((l) => l.contains(selector)).filter(Boolean)
}

export default function Disclosure(node) {
  const headerInner = qs(selectors.headerInner)
  const form = node.closest(selectors.form)
  const list = qs(selectors.list, node)
  const toggle = qs(selectors.toggle, node)
  const input = qs(selectors.input, node)
  const options = qsa(selectors.option, node)

  const events = [
    listen(toggle, 'click', handleToggle),
    listen(options, 'click', submitForm),
    listen(document, 'click', handleBodyClick),
    listen(toggle, 'focusout', handleToggleFocusOut),
    listen(list, 'focusout', handleListFocusOut),
    listen(node, 'keyup', handleKeyup),
  ]

  function submitForm(evt) {
    evt.preventDefault()
    const { value } = evt.currentTarget.dataset

    input.value = value
    form.submit()
  }

  function handleToggleFocusOut(evt) {
    const disclosureLostFocus = has([node], evt.relatedTarget).length === 0

    if (disclosureLostFocus) {
      hideList()
    }
  }

  function handleListFocusOut(evt) {
    const childInFocus = has([node], evt.relatedTarget).length > 0
    const ariaExpanded = toggle.getAttribute('aria-expanded') === 'true'

    if (ariaExpanded && !childInFocus) {
      hideList()
    }
  }

  function handleKeyup(evt) {
    if (evt.which !== 27) return
    hideList()
    toggle.focus()
  }

  function handleToggle() {
    const ariaExpanded = toggle.getAttribute('aria-expanded') === 'true'

    if (ariaExpanded) {
      hideList()
    } else {
      showList()
    }
  }

  function handleBodyClick(evt) {
    const isOption = has([node], evt.target).length > 0
    const ariaExpanded = toggle.getAttribute('aria-expanded') === 'true'

    if (ariaExpanded && !isOption) {
      hideList()
    }
  }

  function showList() {
    toggle.setAttribute('aria-expanded', true)
    list.setAttribute('aria-hidden', false)
    positionGroup()
  }

  function hideList() {
    toggle.setAttribute('aria-expanded', false)
    list.setAttribute('aria-hidden', true)
  }

  function positionGroup() {
    remove(list, classes.disclosureListTop)
    remove(list, classes.disclosureListRight)
    const headerInnerBounds = headerInner.getBoundingClientRect()
    const nodeBounds = node.getBoundingClientRect()
    const listBounds = list.getBoundingClientRect()

    // check if the drop down list is on the right side of the screen
    // if so position the drop down aligned to the right side of the toggle button
    if (nodeBounds.x + listBounds.width >= headerInnerBounds.width) {
      add(list, classes.disclosureListRight)
    }

    // check if the drop down list is too close to the bottom of the viewport
    // if so position the drop down aligned to the top of the toggle button
    if (nodeBounds.y >= window.innerHeight / 2) {
      add(list, classes.disclosureListTop)
    }
  }

  function unload() {
    events.forEach((evt) => evt())
  }

  return { unload }
}
