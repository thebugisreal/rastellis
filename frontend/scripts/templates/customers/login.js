import { add, listen, qs, qsa, toggle, contains } from '@fluorescent/dom'

import section from '@/scripts/glow/section'

section('login', {
  onLoad() {
    const main = qs('[data-part="login"]', this.container)
    const reset = qs('[data-part="reset"]', this.container)
    const toggles = qsa('[data-toggle]', this.container)
    const loginError = qs('.form-status__message--error', reset)

    const isSuccess = qs('.form-status__message--success', reset)
    const successMessage = qs('[data-success-message]', this.container)

    if (isSuccess) {
      add(successMessage, 'visible')
      add([main, reset], 'hide')
    }

    if (loginError) {
      toggleView()
    }

    function toggleView(e) {
      e && e.preventDefault()
      toggle([main, reset], 'hide')

      main.setAttribute('aria-hidden', contains(main, 'hide'))
      reset.setAttribute('aria-hidden', contains(reset, 'hide'))
    }

    this.toggleClick = listen(toggles, 'click', toggleView)
  },

  onUnload() {
    this.toggleClick()
  },
})
