const paginationRange = (currentPage, totalPages, maxVisiblePages = 5) => {
  const range = []
  const half = Math.floor(maxVisiblePages / 2)

  let startPage = currentPage - half > 0 ? currentPage - half : 1
  let endPage = currentPage + half < totalPages ? currentPage + half : totalPages

  if (currentPage <= half) {
    startPage = 1
    endPage = maxVisiblePages < totalPages ? maxVisiblePages : totalPages
  }

  if (currentPage > totalPages - half) {
    startPage = totalPages - maxVisiblePages + 1 > 1 ? totalPages - maxVisiblePages + 1 : 1
    endPage = totalPages
  }

  if (startPage > 1) {
      range.push(1)
      if (startPage > 2) {
        range.push('...')
      }
  }

  for (let i = startPage; i <= endPage; i++) {
    range.push(i)
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      range.push('...')
    }
    range.push(totalPages)
  }
  return range
}

const buildPaginationHtml = (range, currentPage, queryString = '', isAden) => {
  const hrefPre = currentPage >= 1 ? `${window.location.pathname}?page=${currentPage - 1}${queryString}` : ''
  const disabledPrev = currentPage === 1 ? 'disabled' : ''
  const hrefNext = currentPage < range[range.length - 1] ? `${window.location.pathname}?page=${currentPage + 1}${queryString}` : ''
  const disabledNext = currentPage == range[range.length - 1] ? 'disabled' : ''

  let arrowSvg = `
    <span class="icon icon-new icon-halo icon-arrow-right-30">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.36328" y="1.36353" width="27.2727" height="27.2727" rx="13.6364" fill="#A5BDD6"></rect>
        <path d="M13.1162 10.7682L16.878 15.1185L13.1162 19.2322" stroke="#063B5A" stroke-width="1.41066"></path>
      </svg>
    </span>
  `

  if (isAden == 'true') {
    arrowSvg = `
      <span class="icon icon-new icon-aden icon-arrow-right-30 ">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.36328" y="1.36353" width="27.2727" height="27.2727" rx="13.6364" fill="#F7F7F7"></rect>
          <path d="M13.1162 10.7682L16.878 15.1185L13.1162 19.2322" stroke="#666B6C" stroke-width="1.41066"></path>
        </svg>
      </span>
    `
  }

  let markup = ''
  markup += '<ul class="pagination__list">'

  if (currentPage >= 1) markup += `
    <li class="pagination__item pagination__item--arrow">
      <a href="${hrefPre}" class="pagination__navigation-button pagination__navigation-button--previous" aria-hidden="true" ${disabledPrev} aria-label="Previous page of products">
        ${arrowSvg}
      </a>
    </li>
  `

  range.forEach(page => {
    if (page === currentPage) {
      markup += `<li class="pagination__item pagination__item--active"><span class="pagination__navigation-button">${page}</span></li>`
    } else if (typeof page === 'string') {
      markup += `<li class="pagination__item pagination__item--ellip"><span class="pagination__navigation-button">${page}</span></li>`
    } else {
      markup += `<li class="pagination__item"><a href="${window.location.pathname}?page=${page}${queryString}" class="pagination__navigation-button">${page}</a></li>`
    }
  })

  if (currentPage <= range[range.length - 1]) markup += `
    <li class="pagination__item pagination__item--arrow">
      <a href="${hrefNext}" class="pagination__navigation-button pagination__navigation-button--next" aria-hidden="true" ${disabledNext} aria-label="Next page of products">
        ${arrowSvg}
      </a>
    </li>
  `

  markup += '</ul>'
  return`<div class="pagination">${markup}</div>`
}

const pagination = (currentPage, totalPages, maxVisiblePages, queryString, isAden = 'false') => {
  const pagination = paginationRange(currentPage, totalPages, maxVisiblePages)
  if (pagination.length > 1) {
    return buildPaginationHtml(pagination, currentPage, queryString, isAden)
  }
  return false
}

export default pagination
