import { qs } from '@fluorescent/dom'
import { emit } from 'evx'
import animateCollection from '@/scripts/lib/animation/collection'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import pagination from '@/scripts/lib/pagination'
import fetchData from '@/scripts/lib/fetch-data'
import ProductItem from '@/scripts/lib/product-item'
import VideoModule from '@/scripts/sections/video-module'

const selectors = {
  plpAjax: '[data-plp-ajax]',
  paginate: '[data-plp-paginate]',
  plpItem: '[data-plp-item]',
}

const getCurrentPage = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const page = urlParams.get('page')
  return page ? parseInt(page) : 1
}

const paginatedResults = (results, page, perPage) => {
  let firstPageCount = perPage

  if (page === 1) {
    return results.slice(0, firstPageCount)
  }

  let from = firstPageCount + (page - 2) * perPage
  let to = from + perPage

  return results.slice(from, to)
}

const renderProductItem = (plpAjaxEl, results, currentPage, pageSize, container) => {
  const resultsPage = paginatedResults(results, currentPage, pageSize)

  plpAjaxEl.innerHTML = ''
  resultsPage.forEach(snippet => {
    plpAjaxEl.innerHTML += snippet
  })

  ProductItem(container)
  VideoModule(container)

  if (shouldAnimate(container)) {
    animateCollection(container)
  }

  emit('collection:updated')
}

const plpAjax = async (container) => {
  let currentPage = getCurrentPage()
  const { collectionItemCount, sectionId, collectionItemsPerPage, isAden } = container.dataset
  const plpAjaxEl = qs(selectors.plpAjax, container)
  if (!plpAjaxEl) return
  const totalCount = parseInt(collectionItemCount || 0)
  const paginateEl = qs(selectors.paginate, container)
  const pageSize = parseInt(collectionItemsPerPage || 12)
  const totalPages = Math.ceil((totalCount + 1) / pageSize)
  const urlParams = new URLSearchParams(window.location.search)
  const sortBy = urlParams.get('sort_by') ? `&sort_by=${urlParams.get('sort_by')}` : ''

  const results = await fetchData(1, totalPages, sectionId, selectors.plpItem, sortBy)
  if (!results.length) return

  renderProductItem(plpAjaxEl, results, currentPage, pageSize, container)

  const paginationMarkup = pagination(currentPage, totalPages, 4, sortBy, isAden)
  if (paginationMarkup && paginateEl) {
    paginateEl.innerHTML = paginationMarkup
  }
}

export default plpAjax
