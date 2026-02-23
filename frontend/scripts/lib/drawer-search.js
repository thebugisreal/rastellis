import { listen, qs, add, remove, toggle } from '@fluorescent/dom'
import PredictiveSearch from '@/scripts/lib/predictive-search'

const selectors = {
  clear: '[data-search-clear]',
  input: '[data-input]',
  results: '[data-search-results]',
  search: '[data-search-submit]',
}

export default function DrawerSearch(container) {
  // Elements
  const input = qs(selectors.input, container)
  const resultsContainer = qs(selectors.results, container)
  const clearButton = qs(selectors.clear, container)
  const searchButton = qs(selectors.search, container)

  const predictiveSearch = PredictiveSearch(resultsContainer)

  // Events
  const inputChange = listen(input, 'input', handleInputChange)
  const clearClick = listen(clearButton, 'click', reset)

  function handleInputChange({ target: { value } }) {
    if (value === '') reset()
    toggle([clearButton, searchButton], 'visible', value !== '')
    toggle(input, 'active', value !== '')

    predictiveSearch.getSearchResults(value)
  }

  function reset(e) {
    e && e.preventDefault()

    clear()
    input.focus()
  }

  function clear() {
    input.value = ''
    remove([resultsContainer, clearButton, searchButton], 'visible')
    remove(input, 'active')
    resultsContainer.innerHTML = ''
  }

  function destroy() {
    inputChange()
    clearClick()
  }

  return { destroy, clear }
}
