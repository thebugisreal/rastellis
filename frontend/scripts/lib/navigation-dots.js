import { add, remove, listen, qsa } from '@fluorescent/dom'

const selectors = {
  dots: '.navigation-dot',
}

const navigationDots = (container, options = {}) => {
  const navigationDots = qsa(selectors.dots, container)
  const events = []

  navigationDots.forEach((dot) => {
    events.push(listen(dot, 'click', (e) => _handleDotClick(e)))
  })

  const _handleDotClick = (e) => {
    e.preventDefault()

    if (e.target.classList.contains('is-selected')) return

    if (options.onSelect) {
      const index = parseInt(e.target.dataset.index, 10)
      options.onSelect(index)
    }
  }

  const update = (dotIndex) => {
    if (typeof dotIndex !== 'number') {
      console.debug(
        'navigationDots#update: invalid index, ensure int is passed',
      )
      return
    }
    const activeClass = 'is-selected'
    navigationDots.forEach((dot) => remove(dot, activeClass))
    add(navigationDots[dotIndex], activeClass)
  }

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { update, unload }
}

export default navigationDots
