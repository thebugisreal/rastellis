import isMobile from 'is-mobile'

import { add, remove, listen, qs, qsa } from '@fluorescent/dom'
import { getStorage, removeStorage, setStorage } from '@/scripts/lib/storage'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import animatePopup from '@/scripts/lib/animation/popup'
import { createFocusTrap } from 'focus-trap'
import CountdownTimer from '@/scripts/lib/countdown-timer'

const selectors = {
  wash: '.popup__wash',
  dismissButtons: '[data-dismiss-popup]',
  tab: '.popup__tab',
  tabButton: '.popup__tab-button',
  tabDismiss: '.popup__tab-dismiss',
  newsletterForm: '.newsletter-form',
  formSuccessMessage: '.form-status__message--success',
  timer: '[data-countdown-timer]',
}

const classes = {
  visible: 'visible',
}

export default function Popup(container) {
  const focusTrap = createFocusTrap(container, { allowOutsideClick: true })
  const popupAnimation = animatePopup(container)
  const wash = qs(selectors.wash, container)
  const dismissButtons = qsa(selectors.dismissButtons, container)
  const formSuccessMessage = qs(selectors.formSuccessMessage, container)
  const timer = qs(selectors.timer, container)

  const { delayType, showOnExitIntent, id, isSignup, popupType } =
    container.dataset
  const tab = qs(`${selectors.tab}[data-id="${id}"`)
  let { delayValue, hourFrequency } = container.dataset
  delayValue = parseInt(delayValue, 10)
  hourFrequency = parseInt(hourFrequency, 10)
  const storageKey = `popup-${id}`
  const signupSubmittedKey = `signup-submitted-${id}`
  const formSuccessKey = `form-success-${id}`
  const signupDismissedKey = `signup-dismissed-${id}`
  const ageVerifiedKey = `age-verified-${id}`
  const isSignupPopup = isSignup === 'true'
  const isAgeVerification = popupType === 'age'
  let hasPoppedUp = false
  let signupSubmitted = Boolean(getStorage(signupSubmittedKey))
  let formSuccessShown = Boolean(getStorage(formSuccessKey))
  let signupDismissed = Boolean(getStorage(signupDismissedKey))
  let ageVerified = Boolean(getStorage(ageVerifiedKey))
  let canPopUp = true
  let countdownTimer = null

  if (timer) {
    countdownTimer = CountdownTimer(timer)
  }

  ShouldPopUp()
  const events = []

  if (!window.Shopify.designMode) {
    events.push(listen(dismissButtons, 'click', hidePopup))
  }

  if (!isAgeVerification && !window.Shopify.designMode) {
    // Only allow wash to be clickable for non age verification popups
    events.push(listen(wash, 'click', hidePopup))

    events.push(
      listen(container, 'keydown', ({ keyCode }) => {
        if (keyCode === 27) hidePopup()
      }),
    )
  }

  if (isSignupPopup) {
    const form = qs(selectors.newsletterForm, container)
    if (form) {
      events.push(listen(form, 'submit', onNewsletterSubmit))
    }
  }

  if (tab) {
    const tabButton = qs(selectors.tabButton, tab)
    const tabDismiss = qs(selectors.tabDismiss, tab)
    events.push(listen(tabButton, 'click', handleTabClick))
    events.push(listen(tabDismiss, 'click', hideTab))
  }

  // Show popup immediately if signup form was submitted
  if (isSignupPopup && formSuccessMessage && !formSuccessShown) {
    setStorage(formSuccessKey, JSON.stringify(new Date()))
    showPopup()
  } else {
    handleDelay()

    if (showOnExitIntent === 'true' && !isMobile()) {
      handleExitIntent()
    }
  }

  function handleDelay() {
    if (!canPopUp) return

    if (delayType === 'timer') {
      setTimeout(() => {
        if (!hasPoppedUp) {
          showPopup()
          setStorage(storageKey, JSON.stringify(new Date()))
        }
      }, delayValue)
    } else if (delayType === 'scroll') {
      // Delay window / page height calcs until window has loaded
      window.addEventListener(
        'load',
        () => {
          const scrollPercent = delayValue / 100
          const scrollTarget =
            (document.body.scrollHeight - window.innerHeight) * scrollPercent

          const scrollListener = listen(window, 'scroll', () => {
            if (window.scrollY >= scrollTarget) {
              if (!hasPoppedUp) {
                showPopup()
                setStorage(storageKey, JSON.stringify(new Date()))
              }
              // Unbind listener
              scrollListener()
            }
          })
        },
        {
          once: true,
        },
      )
    }
  }

  function handleExitIntent() {
    if (!canPopUp) return
    const bodyLeave = listen(document.body, 'mouseout', (e) => {
      if (!e.relatedTarget && !e.toElement) {
        bodyLeave()
        if (!hasPoppedUp) {
          showPopup()
          setStorage(storageKey, JSON.stringify(new Date()))
          hasPoppedUp = true
        }
      }
    })
  }

  function ShouldPopUp() {
    // To avoid popups appearing while in the editor we're disabling them
    // Popups will only be visible in customizer when selected
    if (window.Shopify.designMode) {
      canPopUp = false
      return
    }

    // If age has been verified then don't show popup
    // Or signup submitted or dismissed
    // don't show popup
    if (
      (isAgeVerification && ageVerified) ||
      (isSignupPopup && signupSubmitted)
    ) {
      canPopUp = false
      return
    }

    if (isSignupPopup && !signupSubmitted && signupDismissed) {
      canPopUp = false
      if (tab) {
        showTab()
      }
      return
    }

    // If no date has been set allow the popup to set the first when opened
    if (!isSignupPopup && !isAgeVerification && !getStorage(storageKey)) {
      return
    }

    // Compare set date and allowed popup frequency hour diff
    const timeStart = new Date(getStorage(storageKey))
    const timeEnd = new Date()
    const hourDiff = (timeEnd - timeStart) / 1000 / 60 / 60

    // Will not allow popup if the hour frequency is below the previously
    // set poppedup date.
    canPopUp = hourDiff > hourFrequency
  }

  function handleTabClick() {
    showPopup()
    if (popupType === 'flyout' && !window.Shopify.designMode) {
      const focusable = qs('button, [href], input, select, textarea', container)
      if (focusable) {
        focusable.focus({ preventScroll: true })
      }
    }
  }

  function showPopup() {
    add(container, classes.visible)

    popupAnimation.open()

    if (popupType === 'popup' || popupType === 'age') {
      if (!window.Shopify.designMode) {
        focusTrap.activate()
      }
      document.body.setAttribute('data-fluorescent-overlay-open', 'true')
      disableBodyScroll(container)
    }

    hasPoppedUp = true
    if (window.Shopify.designMode && tab) {
      // Show tab in theme editor
      showTab()
    } else if (tab) {
      // hide tab on popup open
      remove(tab, classes.visible)
    }
  }

  function hidePopup() {
    remove(container, classes.visible)

    if (isSignupPopup) {
      setStorage(signupDismissedKey, JSON.stringify(new Date()))
      // show tab on close, clicking the tab will open the popup again
      if (tab) {
        showTab()
      }
    }

    // Set storage when age verification popup has been dismissed
    // Age verification popups will always be shown until they are dismissed
    if (isAgeVerification) {
      setStorage(ageVerifiedKey, JSON.stringify(new Date()))
    }

    setTimeout(() => {
      popupAnimation.close()

      if (popupType === 'popup' || popupType === 'age') {
        focusTrap.deactivate()
        document.body.setAttribute('data-fluorescent-overlay-open', 'false')
        enableBodyScroll(container)
      }
    }, 500)
  }

  function showTab() {
    add(tab, classes.visible)
  }

  function hideTab() {
    remove(tab, classes.visible)
    // When tab is removed we want the popup to be able to open again if it has a frequency
    // We have to remove the storeage saying that the popup was dismissed
    removeStorage(signupDismissedKey)
  }

  function onNewsletterSubmit() {
    setStorage(signupSubmittedKey, JSON.stringify(new Date()))
  }

  function unload() {
    hidePopup()
    events.forEach((unsubscribe) => unsubscribe())
    if (isAgeVerification) {
      enableBodyScroll(container)
    }
    countdownTimer && countdownTimer.destroy()
  }

  return { unload, showPopup, hidePopup }
}
