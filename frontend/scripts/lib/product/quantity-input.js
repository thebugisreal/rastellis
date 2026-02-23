import { qs, listen } from '@fluorescent/dom'

export default function (container) {
  const quantityWrapper = qs('.quantity-input', container)
  if (!quantityWrapper) return
  const quantityInput = qs('[data-quantity-input]', quantityWrapper)
  const addQuantity = qs('[data-add-quantity]', quantityWrapper)
  const subtractQuantity = qs('[data-subtract-quantity]', quantityWrapper)

  const handleAddQuantity = () => {
    const currentValue = parseInt(quantityInput.value)
    const newValue = currentValue + 1

    quantityInput.value = newValue
    quantityInput.dispatchEvent(new Event('change'))
  }

  const handleSubtractQuantity = () => {
    const currentValue = parseInt(quantityInput.value)

    if (currentValue === 1) return

    const newValue = currentValue - 1
    quantityInput.value = newValue
    quantityInput.dispatchEvent(new Event('change'))
  }

  const events = [
    listen(addQuantity, 'click', handleAddQuantity),
    listen(subtractQuantity, 'click', handleSubtractQuantity),
  ]

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}
