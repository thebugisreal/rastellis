import { createFocusTrap } from 'focus-trap'
import { add, listen, qs, qsa, remove } from '@fluorescent/dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import { makeRequest } from '@/scripts/lib/xhr'
import dispatchCustomEvent from '@/scripts/lib/dispatch-custom-event'

import { emit } from 'evx'
import { on } from 'evx'
import { default as Product } from '@/scripts/lib/product/product'
import animateQuickView from '@/scripts/lib/animation/quick-view'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const classes = {
  visible: 'is-visible',
  active: 'active',
  fixed: 'is-fixed',
}

const selectors = {
  closeBtn: '[data-modal-close]',
  wash: '.modal__wash',
  modalContent: '.quick-view-modal__content',
  loadingMessage: '.quick-view-modal-loading-indicator',
  siblingSwatch: '.product__color-swatch--sibling-product',
}

const useCustomEvents = window.flu.states?.useCustomEvents

const quickViewModal = (node) => {
  const focusTrap = createFocusTrap(node, { allowOutsideClick: true })
  const wash = qs(selectors.wash, node)
  const closeButton = qs(selectors.closeBtn, node)
  const modalContent = qs(selectors.modalContent, node)
  const loadingMessage = qs(selectors.loadingMessage, node)
  let quickViewAnimation = null
  if (shouldAnimate(node)) {
    quickViewAnimation = animateQuickView(node)
  }
  let product

  const events = [
    listen([wash, closeButton], 'click', (e) => {
      e.preventDefault()
      _close()
    }),
    listen(node, 'keydown', ({ keyCode }) => {
      if (keyCode === 27) _close()
    }),
    on('quick-view:open', (state, { productUrl }) => {
      _renderProductContent(productUrl)
      _open()
    }),
    on('quick-view:close', () => {
      _close()
    }),
    on('quick-view:refresh', (state, { productUrl }) => {
      _renderProductContent(productUrl)
    }),
  ]

  const _renderProductContent = (productUrl) => {
    const xhrUrl = `${productUrl}${
      productUrl.includes('?') ? '&' : '?'
    }view=quick-view`

    makeRequest('GET', xhrUrl).then((response) => {
      let container = document.createElement('div')
      container.innerHTML = response
      const productElement = qs('[data-is-quick-view]', container)

      const siblingElements = qsa(selectors.siblingSwatch, container)
      siblingElements.forEach((sibling) => {
        const productUrl = sibling.pathname
        listen(sibling, 'click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          emit('quick-view:refresh', null, {
            productUrl: productUrl,
          })
        })
      })

      remove(modalContent, 'empty')
      modalContent.innerHTML = ''
      modalContent.appendChild(productElement)
      const renderedProductElement = qs('[data-is-quick-view]', modalContent)

      if (shouldAnimate(node)) {
        quickViewAnimation.animate()
      }

      product = new Product(renderedProductElement)

      if (useCustomEvents) {
        dispatchCustomEvent('quickview:loaded')
      }
    })
  }

  const _open = () => {
    add(node, classes.fixed)

    setTimeout(() => {
      add(node, classes.active)
      setTimeout(() => {
        add(node, classes.visible)
        focusTrap.activate()
      }, 50)
    }, 50)

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
  }

  const _close = () => {
    focusTrap.deactivate()
    remove(node, classes.visible)
    remove(node, classes.active)
    document.body.setAttribute('data-fluorescent-overlay-open', 'false')
    enableBodyScroll(node)
    emit('quick-cart:scrollup')

    setTimeout(() => {
      remove(node, classes.fixed)
      if (shouldAnimate(node)) {
        quickViewAnimation.reset()
      }
      modalContent.innerHTML = ''
      modalContent.appendChild(loadingMessage)
      add(modalContent, 'empty')
      product?.unload()
    }, 500)
  }

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}

export default quickViewModal
