import { add, qs } from '@fluorescent/dom'
import formatMoney from '@/scripts/glow/formatMoney'

const selectors = {
  progressBar: '.free-shipping-bar__bar',
  message: '.free-shipping-bar__message',
}

const classes = {
  loaded: 'free-shipping-bar--loaded',
  success: 'free-shipping-bar--success',
}

export default function freeShippingBar(node) {
  let {
    threshold,
    cartTotal,
    freeShippingSuccessMessage,
    freeShippingPendingMessage,
  } = node.dataset

  cartTotal = parseInt(cartTotal, 10)
  // Account for different currencies using the Shopify currency rate
  threshold = Math.round(
    parseInt(threshold, 10) * (window.Shopify.currency.rate || 1),
  )
  const thresholdInCents = threshold * 100

  _setProgressMessage()
  _setProgressBar()
  add(node, classes.loaded)

  function _setProgressMessage() {
    const message = qs(selectors.message, node)

    if (cartTotal >= thresholdInCents) {
      add(node, classes.success)
      message.innerText = freeShippingSuccessMessage
    } else {
      const remainder = Math.abs(cartTotal - thresholdInCents)
      message.innerHTML = freeShippingPendingMessage.replace(
        '{{ remaining_amount }}',
        `<span class="fs-body-bold">${formatMoney(remainder)}</span>`,
      )
    }
  }

  function _setProgressBar() {
    const progressBar = qs(selectors.progressBar, node)
    const progress = cartTotal < thresholdInCents ? cartTotal / threshold : 100
    progressBar.style.setProperty('--progress-width', `${progress}%`)
  }
}
