import { add, listen, qs, qsa } from '@fluorescent/dom'

export default function (container) {
  const displayRecipientFormContainer = qs(
    ".product-form__gift-card-recipient[data-source='product-display']",
    container,
  )

  const formRecipientFormContainer = qs(
    ".product-form__gift-card-recipient[data-source='product-form']",
    container,
  )

  if (!displayRecipientFormContainer || !formRecipientFormContainer) return

  const sectionID = displayRecipientFormContainer.dataset.sectionId

  const selectors = {
    display: {
      controlInput: `#display-gift-card-recipient-enable--${sectionID}`,
      recipientForm: '.gift-card-recipient-fields',
      emailInput: `#display-gift-card-recipient-email--${sectionID}`,
      nameInput: `#display-gift-card-recipient-name--${sectionID}`,
      messageInput: `#display-gift-card-recipient-message--${sectionID}`,
      sendOnInput: `#display-gift-card-recipient-send_on--${sectionID}`,
      errors: '.product__gift-card-recipient-error',
    },
    form: {
      controlInput: `#form-gift-card-recipient-control--${sectionID}`,
      emailInput: `#form-gift-card-recipient-email--${sectionID}`,
      nameInput: `#form-gift-card-recipient-name--${sectionID}`,
      messageInput: `#form-gift-card-recipient-message--${sectionID}`,
      sendOnInput: `#form-gift-card-recipient-send_on--${sectionID}`,
      offsetInput: `#form-gift-card-recipient-timezone-offset--${sectionID}`,
    },
  }

  const elements = {
    display: {
      controlInput: qs(
        selectors.display.controlInput,
        displayRecipientFormContainer,
      ),
      emailInput: qs(
        selectors.display.emailInput,
        displayRecipientFormContainer,
      ),
      nameInput: qs(selectors.display.nameInput, displayRecipientFormContainer),
      messageInput: qs(
        selectors.display.messageInput,
        displayRecipientFormContainer,
      ),
      sendOnInput: qs(
        selectors.display.sendOnInput,
        displayRecipientFormContainer,
      ),
      recipientForm: qs(
        selectors.display.recipientForm,
        displayRecipientFormContainer,
      ),
      errors: qsa(selectors.display.errors, displayRecipientFormContainer),
    },
    form: {
      controlInput: qs(selectors.form.controlInput, formRecipientFormContainer),
      emailInput: qs(selectors.form.emailInput, formRecipientFormContainer),
      nameInput: qs(selectors.form.nameInput, formRecipientFormContainer),
      messageInput: qs(selectors.form.messageInput, formRecipientFormContainer),
      sendOnInput: qs(selectors.form.sendOnInput, formRecipientFormContainer),
      offsetInput: qs(selectors.form.offsetInput, formRecipientFormContainer),
    },
  }

  // Attach each display input to its associated form input
  Object.entries(elements.display).forEach(([key, value]) => {
    value.controls = elements.form[key]
  })

  const getInputs = (type) => {
    return [
      elements[type].emailInput,
      elements[type].nameInput,
      elements[type].messageInput,
      elements[type].sendOnInput,
    ]
  }

  const disableableInputs = () => {
    return [
      ...getInputs('form'),
      elements.form.controlInput,
      elements.form.offsetInput,
    ]
  }

  const clearableInputs = () => {
    return [...getInputs('display'), ...getInputs('form')]
  }

  const disableInputs = (inputs, disable) => {
    inputs.forEach((input) => {
      input.disabled = disable
    })
  }

  const clearInputs = (inputs) => {
    inputs.forEach((input) => {
      input.value = ''
    })
  }

  const clearErrors = () => {
    elements.display.errors.forEach((error) => {
      add(error, 'hidden')
    })
  }

  const handleChange = (e) => {
    const el = e.target

    el.controls.value = el.value

    if (el.type === 'checkbox') {
      if (el.checked) {
        elements.display.recipientForm.style.display = 'block'
      } else {
        clearInputs(clearableInputs())
        clearErrors()
        elements.display.recipientForm.style.display = 'none'
      }

      disableInputs(disableableInputs(), !el.checked)
    }
  }

  // Hide the form version by default - the display version will update the form version inputs
  add(formRecipientFormContainer, 'visually-hidden')

  // Disable form inputs by default
  disableInputs(disableableInputs(), true)

  elements.form.offsetInput.value = new Date().getTimezoneOffset()

  // Set up listeners for the display inputs
  const events = [listen(elements.display.controlInput, 'change', handleChange)]

  getInputs('display').forEach((input) => {
    events.push(listen(input, 'change', handleChange))
  })

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}
