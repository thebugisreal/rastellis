import Delegate from 'ftdomdelegate'
import { qs } from '@fluorescent/dom'

import cart from '@/scripts/glow/cart'
import { emit } from 'evx'

const selectors = {
  item: '[data-input-item]',
  itemProperties: '[data-item-properties]',
  quantityInput: '[data-quantity-input]',
  quantityAdd: '[data-add-quantity]',
  quantitySubtract: '[data-subtract-quantity]',
  removeItem: '[data-remove-item]',
}

export default function QuantityButtons(node) {
  const delegate = new Delegate(node)

  delegate.on('click', selectors.quantitySubtract, (_, target) => {
    const item = target.closest(selectors.item)
    const { key } = item.dataset
    const qty = qs(selectors.quantityInput, item).value
    emit('quantity-update:subtract', null, {
      key,
    })
    cart.updateItem(key, parseInt(qty) - 1)
  })

  delegate.on('click', selectors.quantityAdd, (_, target) => {
    const item = target.closest(selectors.item)
    const { key } = item.dataset
    const qty = qs(selectors.quantityInput, item).value

    emit('quantity-update:add', null, {
      key,
    })
    cart.updateItem(key, parseInt(qty) + 1)
  })

  delegate.on('click', selectors.removeItem, (_, target) => {
    const item = target.closest(selectors.item)
    const { key } = item.dataset
    emit('quantity-update:remove', null, {
      key,
    })
    cart.updateItem(key, 0)
  })

  const unload = () => {
    delegate.off()
  }

  return {
    unload,
  }
}
