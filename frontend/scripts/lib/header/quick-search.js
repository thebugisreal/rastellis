import {
  listen,
  qs,
  qsa,
  add,
  remove,
  toggle,
  contains,
} from '@fluorescent/dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { createFocusTrap } from 'focus-trap'
import PredictiveSearch from '@/scripts/lib/predictive-search'
import { on } from 'evx'
import { emit } from 'evx'

const classes = {
  active: 'active',
  visible: 'quick-search--visible',
}

export default function (node, header) {
  const overlay = qs('[data-overlay]', node)
  const form = qs('[data-quick-search-form]', node)
  const input = qs('[data-input]', node)
  const clear = qs('[data-clear]', node)
  const resultsContainer = qs('[data-results]', node)
  const predictiveSearch = PredictiveSearch(resultsContainer)
  const closeButton = qs('[data-close-icon]', node)
  const searchToggles = qsa('[data-search]', header)
  const quickSearchFooter = qs("[data-quick-search-footer]", node);
  let scrollPosition = 0

  const events = [
    listen([overlay, closeButton], 'click', close),
    listen(clear, 'click', reset),
    listen(input, 'input', handleInput),
    listen(node, 'keydown', ({ keyCode }) => {
      if (keyCode === 27) close()
    }),
    on('drawer-menu:open', () => {
      if (contains(node, classes.active)) close()
    }),
  ]

  const trap = createFocusTrap(node, { allowOutsideClick: true })

  function handleInput(e) {
    if (e.target.value === "") reset();
    resultsContainer.style.opacity = 0
    if (quickSearchFooter) quickSearchFooter.style.opacity = 0
    toggle(clear, classes.visible, e.target.value !== "");
    toggle(input.parentNode, classes.active, e.target.value !== "");
    toggle(form, classes.active, e.target.value !== "");
    toggle(node, classes.active, e.target.value !== "");
    predictiveSearch.getSearchResults(e.target.value);

    setTimeout(() => {
      resultsContainer.style.opacity = 1
    }, 500)

    setTimeout(() => {
      if (quickSearchFooter) quickSearchFooter.style.opacity = 1
    }, 1000)
  }

  // Clear contents of the search input and hide results container
  function reset(e) {
    e && e.preventDefault();
    input.value = "";
    remove(clear, classes.visible);
    remove(input.parentNode, classes.active);
    remove(form, classes.active);
    remove(node, classes.active)
    resultsContainer.innerHTML = "";

    input.focus();
  }

  function toggleSearch() {
    node.style.setProperty('--scroll-y', Math.ceil(window.scrollY) + 'px')
    const searchIsOpen = node.getAttribute('aria-hidden') === 'false'

    if (searchIsOpen) {
      close()
    } else {
      open()
    }
  }

  function open() {
    emit('search:open')
    searchToggles.forEach((searchToggle) => {
      searchToggle.setAttribute('aria-expanded', true)
    })

    add(node, classes.active)
    node.setAttribute('aria-hidden', false)
    document.body.setAttribute('quick-search-open', 'true')
    trap.activate()

    setTimeout(() => {
      input.focus({ preventScroll: true })
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

      scrollPosition = window.pageYOffset
      document.body.style.top = `-${scrollPosition}px`
      document.body.classList.add('scroll-lock')
      add(node, classes.visible)
    }, 50)
  }

  function close() {
    searchToggles.forEach((searchToggle) => {
      searchToggle.setAttribute('aria-expanded', false)
    })

    remove(node, classes.visible)
    document.body.setAttribute('quick-search-open', 'false')
    trap.deactivate()
    setTimeout(() => {
      remove(node, classes.active)
      node.setAttribute('aria-hidden', true)
      document.body.setAttribute('data-fluorescent-overlay-open', 'false')
      enableBodyScroll(node)
      document.body.classList.remove('scroll-lock')
      document.body.style.top = ''
      window.scrollTo(0, scrollPosition)
    }, 500)
  }

  function destroy() {
    close()

    events.forEach((unsubscribe) => unsubscribe())
  }

  return { toggleSearch, destroy }
}
