import { createFocusTrap } from 'focus-trap'
import { add, listen, qs, remove } from '@fluorescent/dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import Delegate from 'ftdomdelegate'
import animateStoreAvailabilityDrawer from '@/scripts/lib/animation/store-availability-drawer'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

import { makeRequest } from '@/scripts/lib/xhr'

const classes = {
  active: 'active',
}

const selectors = {
  drawerTrigger: '[data-store-availability-drawer-trigger]',
  closeBtn: '[data-store-availability-close]',
  productTitle: '[data-store-availability-product-title]',
  variantTitle: '[data-store-availability-variant-title]',
  storeListContainer: '[data-store-list-container]',
  storeListContent: '[data-store-availability-list-content]',
  wash: '[data-store-availability-drawer-wash]',
  parentWrapper: '[data-store-availability-container]',
}

const storeAvailabilityDrawer = (node) => {
  var focusTrap = createFocusTrap(node, { allowOutsideClick: true })
  const wash = qs(selectors.wash, node.parentNode)
  const productTitleContainer = qs(selectors.productTitle)
  const variantTitleContainer = qs(selectors.variantTitle)
  const storeListContainer = qs(selectors.storeListContainer, node)
  let storeAvailabilityDrawerAnimate = null
  if (shouldAnimate(node)) {
    storeAvailabilityDrawerAnimate = animateStoreAvailabilityDrawer(node)
  }

  const events = [
    listen([qs(selectors.closeBtn, node), wash], 'click', (e) => {
      e.preventDefault()
      _close()
    }),
    listen(node, 'keydown', ({ keyCode }) => {
      if (keyCode === 27) _close()
    }),
  ]

  const _handleClick = (target) => {
    const parentContainer = target.closest(selectors.parentWrapper)
    const { baseUrl, variantId, productTitle, variantTitle } =
      parentContainer.dataset
    const variantSectionUrl = `${baseUrl}/variants/${variantId}/?section_id=store-availability`

    makeRequest('GET', variantSectionUrl)
      .then((storeAvailabilityHTML) => {
        let container = document.createElement('div')
        container.innerHTML = storeAvailabilityHTML

        productTitleContainer.innerText = productTitle
        // Shopify returns string null on variant titles for products without varians
        variantTitleContainer.innerText =
          variantTitle === 'null' ? '' : variantTitle

        const storeList = qs(selectors.storeListContent, container)

        storeListContainer.innerHTML = ''
        storeListContainer.appendChild(storeList)
      })
      .then(_open)
  }

  const _open = () => {
    add(node, classes.active)
    if (shouldAnimate(node)) {
      storeAvailabilityDrawerAnimate.animate()
    }

    node.setAttribute('aria-hidden', 'false')
    focusTrap.activate()
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
    remove(node, classes.active)
    node.setAttribute('aria-hidden', 'true')
    setTimeout(() => {
      if (shouldAnimate(node)) {
        storeAvailabilityDrawerAnimate.reset()
      }
      document.body.setAttribute('data-fluorescent-overlay-open', 'false')
      enableBodyScroll(node)
    }, 500)
  }

  const delegate = new Delegate(document.body)

  delegate.on('click', selectors.drawerTrigger, (_, target) =>
    _handleClick(target),
  )

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}

export default storeAvailabilityDrawer
