import { qs, qsa, contains, add, remove, listen } from '@fluorescent/dom'

const classes = {
  disabled: 'disabled',
}

const selectors = {
  variantsWrapper: '.product__variants-wrapper',
  variantsJson: '[data-variant-json]',
  input: '.dynamic-variant-input',
  inputWrap: '.dynamic-variant-input-wrap',
  inputWrapWithValue: (option) =>
    `${selectors.inputWrap}[data-index="${option}"]`,
  buttonWrap: '.dynamic-variant-button',
  buttonWrapWithValue: (value) =>
    `${selectors.buttonWrap}[data-option-value="${value}"]`,
}

/**
 *  VariantAvailability
    - Cross out sold out or unavailable variants
    - Required markup:
      - class=dynamic-variant-input-wrap + data-index="option{{ forloop.index }}" to wrap select or button group
      - class=dynamic-variant-input + data-index="option{{ forloop.index }}" to wrap selects associated with variant potentially hidden if swatch / chip
      - class=dynamic-variant-button + data-value="{{ value | escape }}" to wrap button of swatch / chip
      - hidden product variants json markup
  * @param {node} container product container element
  * @returns {unload} remove event listeners
 */
export default function (container) {
  const variantsWrapper = qs(selectors.variantsWrapper, container)

  // Variant options block do not exist
  if (!variantsWrapper) return

  const { enableDynamicProductOptions, currentVariantId } =
    variantsWrapper.dataset

  if (enableDynamicProductOptions === 'false') return

  const productVariants = JSON.parse(
    qs(selectors.variantsJson, container).innerText,
  )

  // Using associated selects as buy buttons may be disabled.
  const variantSelectors = qsa(selectors.input, container)
  const variantSelectorWrappers = qsa(selectors.inputWrap, container)
  const events = []

  init()

  function init() {
    variantSelectors.forEach((el) => {
      events.push(listen(el, 'change', handleChange))
    })

    setInitialAvailability()
  }

  function setInitialAvailability() {
    // Disable all options on initial load
    variantSelectorWrappers.forEach((group) => disableVariantGroup(group))

    const initiallySelectedVariant = productVariants.find(
      (variant) => variant.id === parseInt(currentVariantId, 10),
    )

    const currentlySelectedValues = initiallySelectedVariant.options.map(
      (value, index) => {
        return { value, index: `option${index + 1}` }
      },
    )

    const initialOptions = createAvailableOptionsTree(
      productVariants,
      currentlySelectedValues,
    )

    for (const [option, values] of Object.entries(initialOptions)) {
      manageOptionState(option, values)
    }
  }

  // Create a list of all options. If any variant exists and is in stock with that option, it's considered available
  function createAvailableOptionsTree(variants, currentlySelectedValues) {
    // Reduce variant array into option availability tree
    return variants.reduce(
      (options, variant) => {
        // Check each option group (e.g. option1, option2, option3) of the variant
        Object.keys(options).forEach((index) => {
          if (variant[index] === null) return

          let entry = options[index].find(
            (option) => option.value === variant[index],
          )

          if (typeof entry === 'undefined') {
            // If option has yet to be added to the options tree, add it
            entry = { value: variant[index], soldOut: true }
            options[index].push(entry)
          }

          const currentOption1 = currentlySelectedValues.find(
            ({ index }) => index === 'option1',
          )

          const currentOption2 = currentlySelectedValues.find(
            ({ index }) => index === 'option2',
          )

          switch (index) {
            case 'option1':
              // Option1 inputs should always remain enabled based on all available variants
              entry.soldOut =
                entry.soldOut && variant.available ? false : entry.soldOut
              break
            case 'option2':
              // Option2 inputs should remain enabled based on available variants that match first option group
              if (currentOption1 && variant.option1 === currentOption1.value) {
                entry.soldOut =
                  entry.soldOut && variant.available ? false : entry.soldOut
              }
              break
            case 'option3':
              // Option 3 inputs should remain enabled based on available variants that match first and second option group
              if (
                currentOption1 &&
                variant.option1 === currentOption1.value &&
                currentOption2 &&
                variant.option2 === currentOption2.value
              ) {
                entry.soldOut =
                  entry.soldOut && variant.available ? false : entry.soldOut
              }
          }
        })

        return options
      },
      { option1: [], option2: [], option3: [] },
    )
  }

  function handleChange() {
    const currentlySelectedValues = variantSelectors.map((el) => {
      return { value: el.value, index: el.id }
    })

    setAvailability(currentlySelectedValues)
  }

  function setAvailability(selectedValues) {
    // Object to hold all options by value.
    // This will be what sets a button/dropdown as
    // sold out or unavailable (not a combo set as purchasable)
    const valuesToManage = createAvailableOptionsTree(
      productVariants,
      selectedValues,
    )

    // Loop through all option levels and send each
    // value w/ args to function that determines to show/hide/enable/disable
    for (const [option, values] of Object.entries(valuesToManage)) {
      manageOptionState(option, values)
    }
  }

  function manageOptionState(option, values) {
    const group = qs(selectors.inputWrapWithValue(option), container)

    // Loop through each option value
    values.forEach((obj) => {
      toggleVariantOption(group, obj)
    })
  }

  function toggleVariantOption(group, obj) {
    // Selecting by value so escape it
    const value = escapeQuotes(obj.value)

    // Do nothing if the option is a select dropdown
    if (contains(group, 'select-wrapper')) return

    const button = qs(selectors.buttonWrapWithValue(value), group)
    // Variant exists - enable & show variant
    remove(button, classes.disabled)
    // Variant sold out - cross out option (remains selectable)
    if (obj.soldOut) {
      add(button, classes.disabled)
    }
  }

  function disableVariantGroup(group) {
    if (contains(group, 'select-wrapper')) return

    qsa(selectors.buttonWrap, group).forEach((button) =>
      add(button, classes.disabled),
    )
  }

  function escapeQuotes(str) {
    const escapeMap = {
      '"': '\\"',
      "'": "\\'",
    }

    return str.replace(/"|'/g, (m) => escapeMap[m])
  }

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
  }

  return { unload }
}
