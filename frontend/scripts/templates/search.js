import { qs, qsa, add, remove } from '@fluorescent/dom'
import { Ajaxinate } from 'ajaxinate'

import section from '@/scripts/glow/section'
import atBreakpointChange from '@/scripts/lib/at-breakpoint-change'
import getMediaQuery from '@/scripts/lib/media-queries'
import ProductItem from '@/scripts/lib/product-item'
import filterHandler from '@/scripts/lib/filters/filter-handler'
import filterDrawer from '@/scripts/lib/filters/filter-drawer'
import filterBar from '@/scripts/lib/filters/filter-bar'
import filterSidebar from '@/scripts/lib/filters/filter-sidebar'
import { default as stickyScroll } from '@/scripts/lib/sticky-scroll'
import { emit } from 'evx'
import animateSearch from '@/scripts/lib/animation/search'
import animateSearchBanner from '@/scripts/lib/animation/search-banner'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  searchSection: '.search',
  searchBanner: '.search-header',
  infiniteScrollContainer: '.search__infinite-container',
  infiniteScrollTrigger: '.search__infinite-trigger',
  partial: '[data-partial]',
  filterDrawer: '[data-filter-drawer]',
  filterBar: '[data-filter-bar]',
  filterSidebar: '[data-filter-sidebar]',
  loader: '.search__loading',
  paginationItemCount: '[data-pagination-item-count]',
  searchItems: '.product-item, .search-item',
}

const classes = {
  active: 'is-active',
  hideProducts: 'animation--search-products-hide',
}

const { strings } = window.theme

section('search', {
  infiniteScroll: null,

  onLoad() {
    this.searchBannerEl = qs(selectors.searchBanner, this.container)
    if (shouldAnimate(this.searchBannerEl)) {
      this.animateSearchBanner = animateSearchBanner(this.searchBannerEl)
    }

    const { searchItemCount, paginationType } = this.container.dataset

    if (!parseInt(searchItemCount)) return

    this.searchSectionEl = qs(selectors.searchSection, this.container)
    this.filterDrawerEl = qs(selectors.filterDrawer, this.container)
    this.filterBarEl = qs(selectors.filterBar, this.container)
    this.paginationItemCount = qs(selectors.paginationItemCount, this.container)

    if (this.filterBarEl) {
      this.partial = qs(selectors.partial, this.container)

      this.filterDrawer = filterDrawer(this.searchSectionEl)
      this.filterBar = filterBar(this.searchSectionEl)
      this.filterSidebar = filterSidebar(this.searchSectionEl)
      this.filterHandler = filterHandler({
        container: this.searchSectionEl,
        renderCB: this._renderView.bind(this),
      })

      if (
        this.filterSidebar &&
        this.searchSectionEl.dataset.enableStickyFilterSidebar === 'true'
      ) {
        this.mobileQuery = window.matchMedia(getMediaQuery('below-960'))
        this._initStickyScroll()
        this.breakPointHandler = atBreakpointChange(960, () => {
          this._initStickyScroll()
        })
      }
    }

    // Ininite scroll
    this.paginationType = paginationType
    this.paginated = this.paginationType === 'paginated'

    this.infiniteScrollTrigger = qs(
      selectors.infiniteScrollTrigger,
      this.container,
    )

    if (!this.paginated) {
      this._initInfiniteScroll()
    }

    this.productItem = ProductItem(this.container)

    if (shouldAnimate(this.searchSectionEl)) {
      this.animateSearch = animateSearch(this.searchSectionEl)
    }
  },

  _initStickyScroll() {
    if (this.mobileQuery.matches) {
      if (this.stickyScroll) {
        this.stickyScroll.destroy()
        this.stickyScroll = null
      }
    } else if (!this.stickyScroll) {
      this.stickyScroll = stickyScroll(this.searchSectionEl)
    }
  },

  _initInfiniteScroll() {
    const infiniteScrollOptions = {
      container: selectors.infiniteScrollContainer,
      pagination: selectors.infiniteScrollTrigger,
      loadingText: 'Loading...',
      callback: () => {
        this.productItem && this.productItem.unload()
        this.productItem = ProductItem(this.container)
        this.animateSearch?.infiniteScrollReveal()
        this._updatePaginationCount()

        emit('collection:updated')
      },
    }

    if (this.paginationType === 'click') {
      infiniteScrollOptions.method = 'click'
    }

    this.infiniteScroll = new Ajaxinate(infiniteScrollOptions)
  },

  _updatePaginationCount() {
    const searchItemCount = qsa(selectors.searchItems, this.container).length
    const viewing = strings.pagination.viewing
      .replace('{{ of }}', `1-${searchItemCount}`)
      .replace('{{ total }}', this.partial.dataset.searchResultsCount)
    this.paginationItemCount.innerHTML = `${viewing} ${strings.pagination.results}`
  },

  _renderView(searchParams, updateHistory = true) {
    const url = `${window.location.pathname}?section_id=${this.container.dataset.sectionId}&${searchParams}`
    const loading = qs(selectors.loader, this.container)

    add(loading, classes.active)

    fetch(url)
      .then((res) => res.text())
      .then((res) => {
        if (updateHistory) {
          this._updateURLHash(searchParams)
        }
        const doc = new DOMParser().parseFromString(res, 'text/html')
        const updatedPartial = qs(selectors.partial, doc)
        this.partial.innerHTML = updatedPartial.innerHTML
        this.partial.dataset.searchResultsCount =
          updatedPartial.dataset.searchResultsCount
        this.animateSearch?.updateContents()

        if (!this.paginated && this.infiniteScrollTrigger) {
          this.infiniteScrollTrigger.innerHTML = ''

          this._initInfiniteScroll()
        }

        this.filterDrawer && this.filterDrawer.renderFilters(doc)
        this.filterBar && this.filterBar.renderFilters(doc)
        this.filterSidebar && this.filterSidebar.renderFilters(doc)
        this.productItem && this.productItem.unload()
        this.productItem = ProductItem(this.container)
        this.paginationItemCount = qs(
          selectors.paginationItemCount,
          this.container,
        )

        remove(loading, classes.active)
        emit('collection:updated')
      })
  },

  _updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      '',
      `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`,
    )
  },

  onUnload() {
    this.infiniteScroll && this.infiniteScroll.destroy()
    this.filterHandler && this.filterHandler.unload()

    this.filterDrawer && this.filterDrawer.unload()
    this.filterBar && this.filterBar.unload()
    this.filterSidebar && this.filterSidebar.unload()
    this.filtering && this.filtering.unload()

    this.productItem && this.productItem.unload()

    this.animateSearch?.destroy()
    this.animateSearchBanner?.destroy()
  },
})
