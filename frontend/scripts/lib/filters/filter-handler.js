import Delegate from 'ftdomdelegate'
import filtering from '@/scripts/lib/filters/filtering'

import { hydrate } from 'evx'
import {
  filtersUpdated,
  removeFilters,
  filtersRemoved,
  rangeRemoved,
  everythingCleared,
} from '@/scripts/lib/filters/events'

const filterHandler = ({ container, renderCB }) => {
  let subscriptions = null
  let filters = null
  let delegate = null

  filters = filtering(container)

  // Set initial evx state from collection url object
  hydrate(filters.getState())

  subscriptions = [
    filtersRemoved((_, { target }) => {
      filters.removeFilters(target, (data) => {
        renderCB(data.url)
        hydrate(data)()
      })
    }),

    rangeRemoved(() => {
      filters.removeRange((data) => {
        renderCB(data.url)
        hydrate(data)()
      })
    }),

    filtersUpdated((_, { target }) => {
      filters.filtersUpdated(target, (data) => {
        renderCB(data.url)
        hydrate(data)()
      })
    }),

    everythingCleared(() => {
      filters.clearAll((data) => {
        renderCB(data.url)
        hydrate(data)()
      })
    }),
  ]

  delegate = new Delegate(container)

  delegate.on('click', '[data-remove-filter]', (e) => {
    e.preventDefault()
    removeFilters([e.target])
  })

  window.addEventListener('popstate', onPopstate)

  function onPopstate() {
    const url = new URL(window.location)
    const searchParams = url.search.replace('?', '')
    renderCB(searchParams, false)
    hydrate({ url: searchParams })
  }

  const unload = () => {
    delegate && delegate.off()
    subscriptions && subscriptions.forEach((unsubscribe) => unsubscribe())
    window.removeEventListener('popstate', onPopstate)
  }

  return { unload }
}

export default filterHandler
