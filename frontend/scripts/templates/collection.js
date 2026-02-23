import { add, qs, qsa, remove } from '@fluorescent/dom'
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
import animateCollection from '@/scripts/lib/animation/collection'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import PlpAjax from '@/scripts/lib/plp-ajax'
import VideoModule from '@/scripts/sections/video-module'

const selectors = {
  infiniteScrollContainer: '.collection__infinite-container',
  infiniteScrollTrigger: '.collection__infinite-trigger',
  partial: '[data-partial]',
  filterDrawer: '[data-filter-drawer]',
  filterBar: '[data-filter-bar]',
  filterSidebar: '[data-filter-sidebar]',
  loader: '.collection__loading',
  paginationItemCount: '[data-pagination-item-count]',
  productItems: '.product-item',
}

const classes = {
  active: 'is-active',
  hideProducts: 'animation--collection-products-hide',
}

const { strings } = window.theme

section('collection', {
  infiniteScroll: null,

  onLoad() {
    const { collectionItemCount, paginationType } = this.container.dataset

    if (!parseInt(collectionItemCount)) return

    this.filterDrawerEl = qs(selectors.filterDrawer, this.container)
    this.filterbarEl = qs(selectors.filterBar, this.container)
    this.paginationItemCount = qs(selectors.paginationItemCount, this.container)

    if (this.filterDrawerEl || this.filterbarEl) {
      this.partial = qs(selectors.partial, this.container)

      this.filterDrawer = filterDrawer(this.container)
      this.filterBar = filterBar(this.container)
      this.filterSidebar = filterSidebar(this.container)
      this.filterHandler = filterHandler({
        container: this.container,
        renderCB: this._renderView.bind(this),
      })

      if (
        this.filterSidebar &&
        this.container.dataset.enableStickyFilterSidebar === 'true'
      ) {
        this.mobileQuery = window.matchMedia(getMediaQuery('below-960'))
        this._initStickyScroll()
        this.breakPointHandler = atBreakpointChange(960, () => {
          this._initStickyScroll()
        })
      }
    }

    // Infinite scroll
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
    this.videoModule = VideoModule(this.container)

    if (shouldAnimate(this.container)) {
      this.animateCollection = animateCollection(this.container)
    }

    this.plpAjax = PlpAjax(this.container)
  },

  _initStickyScroll() {
    if (this.mobileQuery.matches) {
      if (this.stickyScroll) {
        this.stickyScroll.destroy()
        this.stickyScroll = null
      }
    } else if (!this.stickyScroll) {
      this.stickyScroll = stickyScroll(this.container)
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
        this.videoModule && this.videoModule.unload()
        this.videoModule = VideoModule(this.container)
        this.animateCollection?.infiniteScrollReveal()
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
    const productItemCount = qsa(selectors.productItems, this.container).length
    const viewing = strings.pagination.viewing
      .replace('{{ of }}', `1-${productItemCount}`)
      .replace('{{ total }}', this.partial.dataset.collectionProductsCount)
    this.paginationItemCount.innerHTML = `${viewing} ${strings.pagination.products}`
  },

  _renderView(searchParams, updateHistory = true) {
    const url = `${window.location.pathname}?section_id=${this.container.dataset.sectionId}&${searchParams}`
    const loading = qs(selectors.loader, this.container)

    add(this.partial, classes.hideProducts)
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
        this.partial.dataset.collectionProductsCount =
          updatedPartial.dataset.collectionProductsCount
        this.animateCollection?.updateContents()

        if (!this.paginated && this.infiniteScrollTrigger) {
          this.infiniteScrollTrigger.innerHTML = ''

          this._initInfiniteScroll()
        }

        this.filterDrawer && this.filterDrawer.renderFilters(doc)
        this.filterBar && this.filterBar.renderFilters(doc)
        this.filterSidebar && this.filterSidebar.renderFilters(doc)
        this.productItem && this.productItem.unload()
        this.productItem = ProductItem(this.container)
        this.videoModule && this.videoModule.unload()
        this.videoModule = VideoModule(this.container)
        this.paginationItemCount = qs(
          selectors.paginationItemCount,
          this.container,
        )

        this.plpAjax = PlpAjax(this.container)
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
    this.videoModule && this.videoModule.unload()
    this.plpAjax && this.plpAjax.unload()

    this.animateCollection?.destroy()
  },
})
