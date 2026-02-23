import { add, listen, qsa, remove } from '@fluorescent/dom'
import { createFocusTrap } from 'focus-trap'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import section from '@/scripts/glow/section'

section('addresses', {
  onLoad() {
    this.modals = qsa('[data-address-modal]', this.container)
    this.focusTrap = null

    const overlays = qsa('[data-overlay]', this.container)
    const open = qsa('[data-open]', this.container)
    const close = qsa('[data-close]', this.container)
    const remove = qsa('[data-remove]', this.container)
    const countryOptions = qsa('[data-country-option]', this.container) || []

    this.events = [
      listen(open, 'click', (e) => this.openModal(e)),
      listen([...close, ...overlays], 'click', (e) => this.closeModal(e)),
      listen(remove, 'click', (e) => this.removeAddress(e)),
      listen(this.modals, 'keydown', (e) => {
        if (e.keyCode === 27) this.closeModal(e)
      }),
    ]

    countryOptions.forEach((el) => {
      const { formId } = el.dataset

      const countrySelector = 'AddressCountry_' + formId
      const provinceSelector = 'AddressProvince_' + formId
      const containerSelector = 'AddressProvinceContainer_' + formId

      new window.Shopify.CountryProvinceSelector(
        countrySelector,
        provinceSelector,
        {
          hideElement: containerSelector,
        },
      )
    })
  },

  onUnload() {
    this.events.forEach((unsubscribe) => unsubscribe())
  },

  openModal(e) {
    e.preventDefault()
    const { open: which } = e.currentTarget.dataset

    const modal = this.modals.find((el) => el.dataset.addressModal == which)
    add(modal, 'active')
    this.focusTrap = createFocusTrap(modal, { allowOutsideClick: true })
    this.focusTrap.activate()
    document.body.setAttribute('data-fluorescent-overlay-open', 'true')
    disableBodyScroll(modal, {
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
    setTimeout(() => {
      add(modal, 'visible')
    }, 50)
  },

  closeModal(e) {
    e.preventDefault()

    const modal = e.target.closest('.addresses__modal')

    document.body.setAttribute('data-fluorescent-overlay-open', 'false')
    enableBodyScroll(modal)
    this.focusTrap.deactivate()
    remove(modal, 'visible')
    setTimeout(() => {
      remove(modal, 'active')
    }, 350)
  },

  removeAddress(e) {
    const { confirmMessage, target } = e.currentTarget.dataset
    if (confirm(confirmMessage)) {
      window.Shopify.postLink(target, {
        parameters: { _method: 'delete' },
      })
    }
  },
})
