import { add, listen, qs, qsa, remove } from '@fluorescent/dom'

export default (items) => {
  const events = []

  items.forEach((item) => {
    const imageOne = qs('.product-item__image--one', item)
    const imageTwo = qs('.product-item__image--two', item)
    const optionsElements = qsa('.product-item-options__list', item)

    events.push(
      listen(item, 'mouseenter', () => {
        enterItemAnimation(imageOne, imageTwo, optionsElements)
      }),
    )
    events.push(
      listen(item, 'mouseleave', () => {
        leaveItemAnimation(imageOne, imageTwo, optionsElements)
      }),
    )
  })

  function enterItemAnimation(imageOne, imageTwo, optionsElements) {
    if (imageTwo) {
      add(imageTwo, 'active')
    }

    if (optionsElements) {
      // TODO add animations or remove
      // optionsElements.forEach((optionElement, i) => {
      // });
    }
  }

  function leaveItemAnimation(imageOne, imageTwo, optionsElements) {
    if (imageTwo) {
      remove(imageTwo, 'active')
    }

    if (optionsElements) {
      // TODO add animations or remove
      // optionsElements.forEach(optionElement => {
      // });
    }
  }

  return {
    destroy() {
      events.forEach((unsubscribe) => unsubscribe())
    },
  }
}
