export default function PredictiveSearch(resultsContainer) {
  const cachedResults = {}

  function renderSearchResults(resultsMarkup) {
    resultsContainer.innerHTML = resultsMarkup
  }

  function getSearchResults(searchTerm) {
    const queryKey = searchTerm.replace(' ', '-').toLowerCase()

    // Render result if it appears within the cache
    if (cachedResults[`${queryKey}`]) {
      renderSearchResults(cachedResults[`${queryKey}`])
      return
    }

    const params = new URLSearchParams()
    params.set('section_id', 'predictive-search')
    params.set('q', searchTerm)

    if (window.theme.searchableFields) {
      params.set('resources[options][fields]', window.theme.searchableFields)
    }

    const url = `${window.theme.routes.predictive_search_url}?${params}`

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.status)
          throw error
        }

        return response.text()
      })
      .then((text) => {
        let resultsMarkup = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('#shopify-section-predictive-search').innerHTML

        // Cache results
        cachedResults[queryKey] = resultsMarkup
        renderSearchResults(resultsMarkup)
      })
      .catch((error) => {
        throw error
      })
  }

  return { getSearchResults }
}
