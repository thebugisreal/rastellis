import { getStorage, setStorage } from '@/scripts/lib/storage'
import { emit } from 'evx'

import dispatchCustomEvent from '@/scripts/lib/dispatch-custom-event'

const routes = window.theme.routes.cart || {}

const paths = {
  base: `${routes.base || '/cart'}.js`,
  add: `${routes.add || '/cart/add'}.js`,
  change: `${routes.change || '/cart/change'}.js`,
  clear: `${routes.clear || '/cart/clear'}.js`,
  update: `${routes.update || '/cart/update'}.js`,
}

const {
  strings: { cart: strings },
} = window.theme

const useCustomEvents = window.flu.states?.useCustomEvents

// Add a `sorted` key that orders line items
// in the order the customer added them if possible
function sortCart(cart) {
  const order = getStorage('cart_order') || []

  if (order.length) {
    cart.sorted = [...cart.items].sort(
      (a, b) => order.indexOf(a.variant_id) - order.indexOf(b.variant_id),
    )
    return cart
  }

  cart.sorted = cart.items
  return cart
}

export function updateItem(key, quantity) {
  return get().then(({ items }) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].key === key) {
        return changeItem(i + 1, key, quantity) // shopify cart is a 1-based index
      }
    }
  })
}

function changeItem(line, itemKey, quantity) {
  return fetch(paths.change, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ line, quantity }),
  })
    .then((res) => {
      if (res.status == '422') {
        const error = { code: 422, message: strings.quantityError }

        handleError(error, 'changeItem', itemKey)
      } else {
        return res.json()
      }
    })
    .then((cart) => {
      emit('cart:updated', { cart })
      emit('quick-cart:updated')

      if (useCustomEvents) {
        dispatchCustomEvent('cart:updated', { cart })
      }

      return sortCart(cart)
    })
}

function addItemById(id, quantity) {
  emit('cart:updating')

  let data = {
    items: [
      {
        id,
        quantity,
      },
    ],
  }

  return fetch(paths.add, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.status == '422') {
        const error = { code: 422, message: res.description }

        handleError(error, 'addItemById', id)
      }

      return get().then((cart) => {
        emit('quick-cart:updated')
        emit('cart:updated', { cart })

        if (useCustomEvents) {
          dispatchCustomEvent('cart:updated', { cart: sortCart(cart) })
        }

        return { res, cart }
      })
    })
}

function get() {
  return fetch(paths.base, {
    method: 'GET',
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((data) => {
      const sortedData = sortCart(data)
      return sortedData
    })
}

function addItem(form) {
  emit('cart:updating')

  return fetch(paths.add, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: serialize(form),
  })
    .then((r) => r.json())
    .then((res) => {
      if (res.status == '422') {
        const error = { code: 422, message: res.description }

        handleError(error, 'addItem', null)
      }

      return get().then((cart) => {
        const order = getStorage('cart_order') || []
        const newOrder = [
          res.variant_id,
          ...order.filter((i) => i !== res.variant_id),
        ]
        setStorage('cart_order', JSON.stringify(newOrder))

        emit('cart:updated', { cart: sortCart(cart) })
        emit('quick-cart:updated')
        emit('quick-view:close')

        if (useCustomEvents) {
          dispatchCustomEvent('cart:updated', { cart: sortCart(cart) })
        }

        return { item: res, cart: sortCart(cart) }
      })
    })
}

function handleError(error, source, itemKeyOrId) {
  if (useCustomEvents) {
    dispatchCustomEvent('cart:error', {
      errorMessage: error.message,
    })
  }

  if (source === 'changeItem') {
    emit('quick-cart:error', null, {
      key: itemKeyOrId,
      errorMessage: strings.quantityError,
    })

    emit('cart:error', null, {
      key: itemKeyOrId,
      errorMessage: strings.quantityError,
    })
  } else if (source === 'addItemById') {
    emit('quick-add:error', null, {
      id: itemKeyOrId,
      errorMessage: strings.quantityError,
    })
  }

  throw error
}

// !
//  Serialize all form data into a SearchParams string
//  (c) 2020 Chris Ferdinandi, MIT License, https://gomakethings.com
//  @param  {Node}   form The form to serialize
//  @return {String}      The serialized form data
//
function serialize(form) {
  var arr = []
  Array.prototype.slice.call(form.elements).forEach(function (field) {
    if (
      !field.name ||
      field.disabled ||
      ['file', 'reset', 'submit', 'button'].indexOf(field.type) > -1
    ) {
      return
    }
    if (field.type === 'select-multiple') {
      Array.prototype.slice.call(field.options).forEach(function (option) {
        if (!option.selected) return
        arr.push(
          encodeURIComponent(field.name) +
            '=' +
            encodeURIComponent(option.value),
        )
      })
      return
    }
    if (['checkbox', 'radio'].indexOf(field.type) > -1 && !field.checked) {
      return
    }
    arr.push(
      encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value),
    )
  })
  return arr.join('&')
}

export default {
  addItem,
  get,
  updateItem,
  addItemById,
}
