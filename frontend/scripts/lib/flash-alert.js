import { add, qs, remove } from '@fluorescent/dom'
import { on } from 'evx'
import Delegate from 'ftdomdelegate'

const classes = {
  visible: 'is-visible',
}

const flashAlertModal = (node) => {
  // Setup all preassigned liquid flash alerts
  if (window.Shopify.designMode) {
    const delegate = new Delegate(document.body)

    delegate.on('click', '[data-flash-trigger]', (_, target) => {
      const { flashMessage } = target.dataset

      _open(flashMessage)
    })
  }

  on('flart-alert', ({ alert }) => {
    _open(alert)
  })

  const _open = (alertMessage) => {
    if (!alertMessage) return

    const messageContainer = qs('.flash-alert__container', node)
    messageContainer.innerText = alertMessage

    add(node, classes.visible)

    messageContainer.addEventListener(
      'animationend',
      () => {
        remove(node, classes.visible)
      },
      { once: true },
    )
  }
}

export { flashAlertModal }
