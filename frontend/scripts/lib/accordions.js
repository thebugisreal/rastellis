import { listen, qsa, qs, add } from '@fluorescent/dom'
import { slideDown, slideUp, slideStop, isVisible } from 'slide-anim'

function accordion(node, options) {
  const labels = qsa('.accordion__label', node)
  const content = qsa('.accordion__content', node)

  // Make it accessible by keyboard
  labels.forEach((label) => {
    label.href = '#'
  })

  content.forEach((t) => add(t, 'measure'))

  const labelClick = listen(labels, 'click', (e) => {
    e.preventDefault()
    const label = e.currentTarget
    const { parentNode: group, nextElementSibling: content } = label

    slideStop(content)

    if (isVisible(content)) {
      _close(label, group, content)
    } else {
      _open(label, group, content)
    }
  })

  function _open(label, group, content) {
    slideDown(content)
    group.setAttribute('data-open', true)
    label.setAttribute('aria-expanded', true)
    content.setAttribute('aria-hidden', false)
  }

  function _close(label, group, content) {
    slideUp(content)
    group.setAttribute('data-open', false)
    label.setAttribute('aria-expanded', false)
    content.setAttribute('aria-hidden', true)
  }

  if (options.firstOpen) {
    // Open first accordion label
    const { parentNode: group, nextElementSibling: content } = labels[0]
    _open(labels[0], group, content)
  }

  function destroy() {
    return () => labelClick()
  }

  return { destroy }
}

export default function Accordions(elements, options = {}) {
  if (Array.isArray(elements) && !elements.length) return

  const defaultOptions = {
    firstOpen: true,
  }

  const opts = Object.assign(defaultOptions, options)

  let accordions = []

  if (elements.length) {
    accordions = elements.map((node) => accordion(node, opts))
  } else {
    accordions.push(accordion(elements, opts))
  }

  function unload() {
    accordions.forEach((accordion) => accordion.destroy())
  }

  return { unload }
}
