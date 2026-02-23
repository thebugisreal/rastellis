import { add, remove, qs } from '@fluorescent/dom'
import Delegate from 'ftdomdelegate'

import { on } from 'evx'
import { emit } from 'evx'
import { makeRequest } from '@/scripts/lib/xhr'
import FreeShippingBar from '@/scripts/lib/free-shipping-bar'
import animatePurchaseConfirmation from '@/scripts/lib/animation/purchase-confirmation-popup'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  header: '.header__outer-wrapper',
  containerInner: '.purchase-confirmation-popup__inner',
  freeShippingBar: '.free-shipping-bar',
  viewCartButton: '.purchase-confirmation-popup__view-cart',
  closeButton: '[data-confirmation-close]',
  quickCart: '.quick-cart',
}

const classes = {
  active: 'active',
  hidden: 'hidden',
}

export default function PurchaseConfirmationPopup(node) {
  if (!node) return
  const quickCartEnabled = Boolean(qs(selectors.quickCart, document))
  const containerInner = qs(selectors.containerInner, node)
  let purchaseConfirmationAnimation = null
  if (shouldAnimate(node)) {
    purchaseConfirmationAnimation = animatePurchaseConfirmation(node)
  }

  const delegate = new Delegate(node)

  delegate.on('click', selectors.viewCartButton, (event) => {
    if (!quickCartEnabled) return
    event.preventDefault()

    emit('quick-cart:open')
    close()
  })

  delegate.on('click', selectors.closeButton, (event) => {
    event.preventDefault()
    close()
  })

  on('confirmation-popup:open', (_, { product }) => getItem(product))

  function getItem(product) {
    const requestUrl = `${theme.routes.cart.base}/?section_id=purchase-confirmation-popup-item`

    makeRequest('GET', requestUrl).then((response) => {
      let container = document.createElement('div')
      container.innerHTML = response

      containerInner.innerHTML = ''
      containerInner.appendChild(container)

      const freeShippingBar = qs(selectors.freeShippingBar, containerInner)

      if (freeShippingBar) {
        FreeShippingBar(freeShippingBar)
      }

      // Show product within cart that was newly added
      const addedProduct = qs(`[data-product-key="${product.key}"]`, node)
      remove(addedProduct, classes.hidden)

      open()
    })
  }

  function open() {
    add(node, classes.active)

    if (shouldAnimate(node)) {
      purchaseConfirmationAnimation.animate()
    }

    const timeout = setTimeout(() => {
      close()
    }, 5000)

    // Clear timeout if mouse enters, then close if it leaves
    containerInner.addEventListener(
      'mouseover',
      () => {
        clearTimeout(timeout)
        containerInner.addEventListener('mouseleave', close, { once: true })
      },
      { once: true },
    )
  }

  function close() {
    remove(node, classes.active)

    if (shouldAnimate(node)) {
      setTimeout(() => {
        purchaseConfirmationAnimation.reset()
      }, 500)
    }
  }
}
