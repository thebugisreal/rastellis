import { listen } from '@fluorescent/dom'
import { getVariantFromSerializedArray } from '@shopify/theme-product'

const selectors = {
  idInput: '[name="id"]',
  optionInput: '[name^="options"]',
  quantityInput: '[data-quantity-input]',
  formQuantity: '[name="quantity"]',
  propertyInput: '[name^="properties"]',
}

export default function ProductForm(container, form, prod, config = {}) {
  const product = validateProductObject(prod)
  const listeners = []

  const getOptions = () => {
    return _serializeOptionValues(optionInputs, function (item) {
      var regex = /(?:^(options\[))(.*?)(?:\])/
      item.name = regex.exec(item.name)[2] // Use just the value between 'options[' and ']'
      return item
    })
  }

  const getVariant = () => {
    return getVariantFromSerializedArray(product, getOptions())
  }

  const getProperties = () => {
    const properties = _serializePropertyValues(
      propertyInputs,
      function (propertyName) {
        var regex = /(?:^(properties\[))(.*?)(?:\])/
        var name = regex.exec(propertyName)[2] // Use just the value between 'properties[' and ']'
        return name
      },
    )

    return Object.entries(properties).length === 0 ? null : properties
  }

  const getQuantity = () => {
    return formQuantityInput[0]
      ? Number.parseInt(formQuantityInput[0].value, 10)
      : 1
  }

  const getProductFormEventData = () => ({
    options: getOptions(),
    variant: getVariant(),
    properties: getProperties(),
    quantity: getQuantity(),
  })

  const onFormEvent = (cb) => {
    if (typeof cb === 'undefined') return

    return (event) => {
      event.dataset = getProductFormEventData()
      cb(event)
    }
  }

  const setIdInputValue = (value) => {
    let idInputElement = form.querySelector(selectors.idInput)

    if (!idInputElement) {
      idInputElement = document.createElement('input')
      idInputElement.type = 'hidden'
      idInputElement.name = 'id'
      form.appendChild(idInputElement)
    }

    idInputElement.value = value.toString()
  }

  const onSubmit = (event) => {
    event.dataset = getProductFormEventData()
    setIdInputValue(event.dataset.variant.id)

    if (config.onFormSubmit) {
      config.onFormSubmit(event)
    }
  }

  const initInputs = (selector, cb) => {
    const elements = [...container.querySelectorAll(selector)]

    return elements.map((element) => {
      listeners.push(listen(element, 'change', onFormEvent(cb)))
      return element
    })
  }

  listeners.push(listen(form, 'submit', onSubmit))
  const optionInputs = initInputs(selectors.optionInput, config.onOptionChange)

  const formQuantityInput = initInputs(
    selectors.quantityInput,
    config.onQuantityChange,
  )
  const propertyInputs = initInputs(
    selectors.propertyInput,
    config.onPropertyChange,
  )

  const destroy = () => {
    listeners.forEach((unsubscribe) => unsubscribe())
  }

  return { getVariant, destroy }
}

function validateProductObject(product) {
  if (typeof product !== 'object') {
    throw new TypeError(product + ' is not an object.')
  }

  if (typeof product.variants[0].options === 'undefined') {
    throw new TypeError(
      'Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route',
    )
  }

  return product
}

function _serializeOptionValues(inputs, transform) {
  return inputs.reduce(function (options, input) {
    if (
      input.checked || // If input is a checked (means type radio or checkbox)
      (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
    ) {
      options.push(transform({ name: input.name, value: input.value }))
    }

    return options
  }, [])
}

function _serializePropertyValues(inputs, transform) {
  return inputs.reduce(function (properties, input) {
    if (
      input.checked || // If input is a checked (means type radio or checkbox)
      (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
    ) {
      properties[transform(input.name)] = input.value
    }

    return properties
  }, {})
}
