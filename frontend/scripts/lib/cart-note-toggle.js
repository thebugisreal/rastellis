import Delegate from 'ftdomdelegate'
import { slideDown, slideUp, slideStop, isVisible } from 'slide-anim'
import { qs, toggle } from '@fluorescent/dom'

const {
  strings: { cart: strings },
} = window.theme

const selectors = {
  cartNoteTrigger: '[data-order-note-trigger]',
  cartNoteTriggerText: '[data-cart-not-trigger-text]',
  cartNoteInputWrapper: '[cart-note-input]',
  iconPlus: '.icon-plus-small',
  iconMinus: '.icon-minus-small',
}

export default function CartNoteToggle(node) {
  const delegate = new Delegate(node)

  delegate.on('click', selectors.cartNoteTrigger, (_, target) =>
    handleCartNoteTrigger(target),
  )

  function handleCartNoteTrigger(target) {
    const inputWrapper = qs(selectors.cartNoteInputWrapper, target.parentNode)
    const textInput = qs('textarea', inputWrapper)

    // Handle icon change when open or close
    const plusIcon = qs(selectors.iconPlus, target)
    const minusIcon = qs(selectors.iconMinus, target)

    toggle([plusIcon, minusIcon], 'hidden')

    if (isVisible(inputWrapper)) {
      slideStop(inputWrapper)
      slideUp(inputWrapper)
      inputWrapper.setAttribute('aria-expanded', false)
      inputWrapper.setAttribute('aria-hidden', true)

      const inputTriggertext = qs(selectors.cartNoteTriggerText, node)

      // Update cart note trigger text
      if (textInput.value === '') {
        inputTriggertext.innerText = strings.addCartNote
      } else {
        inputTriggertext.innerText = strings.editCartNote
      }
    } else {
      slideStop(inputWrapper)
      slideDown(inputWrapper)
      inputWrapper.setAttribute('aria-expanded', true)
      inputWrapper.setAttribute('aria-hidden', false)
    }
  }

  const unload = () => {
    delegate.off()
  }

  return {
    unload,
  }
}
