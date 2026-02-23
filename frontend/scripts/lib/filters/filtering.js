import { qsa } from '@fluorescent/dom'

import { emit } from 'evx'

const filtering = (container) => {
  const forms = qsa('[data-filter-form]', container)
  let formData, searchParams
  setParams()

  function setParams(form) {
    form = form || forms[0]
    formData = new FormData(form)
    searchParams = new URLSearchParams(formData).toString()
  }

  // Takes the updated form element and updates all other forms with the updated values
  // @param {*} target
  function syncForms(target) {
    if (!target) return

    const targetInputs = qsa('[data-filter-item-input]', target)

    targetInputs.forEach((targetInput) => {
      if (targetInput.type === 'checkbox' || targetInput.type === 'radio') {
        const { valueEscaped } = targetInput.dataset
        const items = qsa(
          `input[name='${escapeQuotes(
            targetInput.name,
          )}'][data-value-escaped='${escapeQuotes(valueEscaped)}']`,
        )
        items.forEach((input) => {
          input.checked = targetInput.checked
        })
      } else {
        const items = qsa(`input[name='${targetInput.name}']`)
        items.forEach((input) => {
          input.value = targetInput.value
        })
      }
    })
  }

  // When filters are removed, set the checked attribute to false
  // for all filter inputs for that filter.
  // Can accept multiple filters
  // @param {Array} targets Array of inputs
  function uncheckFilters(targets) {
    if (!targets) return

    let selector

    targets.forEach((target) => {
      selector = selector ? `, ${selector}` : ''
      const { name, valueEscaped } = target.dataset
      selector = `input[name='${escapeQuotes(
        name,
      )}'][data-value-escaped='${escapeQuotes(valueEscaped)}']${selector}`
    })

    const inputs = qsa(selector, container)

    inputs.forEach((input) => {
      input.checked = false
    })
  }

  function escapeQuotes(str) {
    const escapeMap = {
      '"': '\\"',
      "'": "\\'",
    }

    return str.replace(/"|'/g, (m) => escapeMap[m])
  }

  function clearRangeInputs() {
    const rangeInputs = qsa('[data-range-input]', container)
    rangeInputs.forEach((input) => {
      input.value = ''
    })
  }

  function resetForms() {
    forms.forEach((form) => {
      form.reset()
    })
  }

  return {
    getState() {
      return {
        url: searchParams,
      }
    },

    filtersUpdated(target, cb) {
      syncForms(target)
      setParams(target)
      emit('filters:updated')
      return cb(this.getState())
    },

    removeFilters(target, cb) {
      uncheckFilters(target)
      setParams()
      emit('filters:filter-removed')
      return cb(this.getState())
    },

    removeRange(cb) {
      clearRangeInputs()
      setParams()
      return cb(this.getState())
    },

    clearAll(cb) {
      searchParams = ''
      resetForms()

      return cb(this.getState())
    },
  }
}

export default filtering
