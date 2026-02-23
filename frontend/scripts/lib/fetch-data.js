import { qsa } from '@fluorescent/dom'

const fetchChain = async (url) => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.text()
    return data

  } catch (error) {
    throw new Error(`Failed to fetch data: ${error.message}`)
  }
}

const fetchData =  async (currentPage = 1, totalPages, sectionId, itemEl, queryString = '') => {
  const chain = []
  for (let i = currentPage; i <= totalPages; i++) {
    chain.push(fetchChain(`${window.location.pathname}?section_id=${sectionId}&page=${i}${queryString}`))
  }
  const allResults = await Promise.all(chain)
  const combinedResults = []

  allResults.forEach(htmlString => {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')
    const results = [...qsa(itemEl, doc)].map(element => element.innerHTML)
    combinedResults.push(...results)
  })

  return combinedResults
}

export default fetchData
