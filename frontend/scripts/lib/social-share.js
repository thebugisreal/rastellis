import { listen, qs, add, remove } from '@fluorescent/dom'

const sel = {
  container: '.social-share',
  button: '.social-share__button',
  popup: '.social-sharing__popup',
  copyURLButton: '.social-share__copy-url',
  successMessage: '.social-share__success-message',
}

const classes = {
  hidden: 'hidden',
  linkCopied: 'social-sharing__popup--success',
}

export default (node) => {
  if (!node) return Function()

  const button = qs(sel.button, node)
  const popup = qs(sel.popup, node)
  const copyURLButton = qs(sel.copyURLButton, node)
  const successMessage = qs(sel.successMessage, node)
  let clickListener = listen(window, 'click', handleClick)

  // Hide copy button on old browsers
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    add(copyURLButton, classes.hidden)
  }

  function handleClick(evt) {
    const buttonClicked = evt.target.closest(sel.button) === button
    const popupClicked = evt.target.closest(sel.popup) === popup
    const copyURLClicked =
      evt.target.closest(sel.copyURLButton) === copyURLButton

    let isActive = false
    if (buttonClicked) {
      isActive = button.getAttribute('aria-expanded') === 'true'
    }

    // click happend outside of this popup
    if (!popupClicked) {
      close()
    }

    // click happend in this social button and the button is not active
    if (buttonClicked && !isActive) {
      open()
    }

    if (copyURLClicked) {
      const { url } = copyURLButton.dataset
      writeToClipboard(url).then(showSuccessMessage, showErrorMessage)
    }
  }

  function close() {
    button.setAttribute('aria-expanded', false)
    popup.setAttribute('aria-hidden', true)
  }

  function open() {
    button.setAttribute('aria-expanded', true)
    popup.setAttribute('aria-hidden', false)
  }

  function writeToClipboard(str) {
    return navigator.clipboard.writeText(str)
  }

  function showMessage(message) {
    successMessage.innerHTML = message
    remove(successMessage, classes.hidden)
    add(popup, classes.linkCopied)
    setTimeout(() => {
      add(successMessage, classes.hidden)
      remove(popup, classes.linkCopied)
    }, 2000)
  }

  function showSuccessMessage() {
    const { successMessage } = copyURLButton.dataset
    showMessage(successMessage)
  }

  function showErrorMessage() {
    const { errorMessage } = copyURLButton.dataset
    showMessage(errorMessage || 'Error copying link.')
  }

  function destroy() {
    close()
    clickListener()
  }

  return destroy
}
