import { listen, qsa, qs } from '@fluorescent/dom'

const { strings } = window.theme

const priceRange = (container) => {
  const inputs = qsa('input', container)
  const minInput = inputs[0]
  const maxInput = inputs[1]
  const events = [listen(inputs, 'change', onRangeChange)]
  const slider = qs('[data-range-slider]', container)

  let min = Math.floor(
    minInput.value ? minInput.value : minInput.getAttribute('min'),
  )
  let max = Math.floor(
    maxInput.value ? maxInput.value : maxInput.getAttribute('max'),
  )

  import('@/scripts/manualChunks/nouislider.js').then(({ noUiSlider }) => {
    noUiSlider.create(slider, {
      start: [
        minInput.value ? minInput.value : minInput.getAttribute('min'),
        maxInput.value ? maxInput.value : maxInput.getAttribute('max'),
      ],
      handleAttributes: [
        { 'aria-label': strings.accessibility.range_lower },
        { 'aria-label': strings.accessibility.range_upper },
      ],
      connect: true,
      range: {
        min: parseInt(minInput.getAttribute('min')),
        max: parseInt(maxInput.getAttribute('max')),
      },
    })

    slider.noUiSlider.on('slide', (e) => {
      let maxNew, minNew
      ;[minNew, maxNew] = e

      minInput.value = Math.floor(minNew)
      maxInput.value = Math.floor(maxNew)
      setMinAndMaxValues()
    })

    slider.noUiSlider.on('set', (e) => {
      let maxNew, minNew
      minNew = Math.floor(e[0])
      maxNew = Math.floor(e[1])

      if (minNew != min) {
        minInput.value = minNew
        fireMinChangeEvent()
        min = Math.floor(
          minInput.value ? minInput.value : minInput.getAttribute('min'),
        )
      }

      if (maxNew != max) {
        maxInput.value = maxNew
        fireMaxChangeEvent()
        max = Math.floor(
          maxInput.value ? maxInput.value : maxInput.getAttribute('max'),
        )
      }
      setMinAndMaxValues()
    })

    setMinAndMaxValues()
  })

  function setMinAndMaxValues() {
    if (maxInput.value) minInput.setAttribute('max', maxInput.value)
    if (minInput.value) maxInput.setAttribute('min', minInput.value)
    if (minInput.value === '') maxInput.setAttribute('min', 0)
    if (maxInput.value === '')
      minInput.setAttribute('max', maxInput.getAttribute('max'))
  }

  function adjustToValidValues(input) {
    const value = Number(input.value)
    const minNew = Number(input.getAttribute('min'))
    const maxNew = Number(input.getAttribute('max'))

    if (value < minNew) input.value = minNew
    if (value > maxNew) input.value = maxNew
  }

  function fireMinChangeEvent() {
    minInput.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function fireMaxChangeEvent() {
    maxInput.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function onRangeChange(event) {
    adjustToValidValues(event.currentTarget)
    setMinAndMaxValues()

    if (minInput.value === '' && maxInput.value === '') return

    let currentMax, currentMin

    ;[currentMin, currentMax] = slider.noUiSlider.get()

    currentMin = Math.floor(currentMin)
    currentMax = Math.floor(currentMax)

    if (currentMin !== Math.floor(minInput.value))
      slider.noUiSlider.set([minInput.value, null])
    if (currentMax !== Math.floor(maxInput.value))
      slider.noUiSlider.set([null, maxInput.value])
  }

  function validateRange() {
    inputs.forEach((input) => setMinAndMaxValues(input))
  }

  const reset = () => {
    slider.noUiSlider.set(
      [minInput.getAttribute('min'), maxInput.getAttribute('max')],
      false,
    )
    minInput.value = ''
    maxInput.value = ''
    min = Math.floor(minInput.getAttribute('min'))
    max = Math.floor(maxInput.getAttribute('max'))

    setMinAndMaxValues()
  }

  const unload = () => {
    events.forEach((unsubscribe) => unsubscribe())
    slider.noUiSlider.destroy()
  }

  return {
    unload,
    reset,
    validateRange,
  }
}

export default priceRange
