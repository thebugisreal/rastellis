import { emit } from 'evx'
import { on } from 'evx'

const FILTERS_REMOVE = 'collection:filters:remove'
const RANGE_REMOVE = 'collection:range:remove'
const EVERYTHING_CLEAR = 'collection:clear'
const FILTERS_UPDATE = 'collection:filters:update'

export const updateFilters = (target) => emit(FILTERS_UPDATE, null, { target })
export const removeFilters = (target) => emit(FILTERS_REMOVE, null, { target })
export const removeRange = () => emit(RANGE_REMOVE)

export const filtersUpdated = (cb) => on(FILTERS_UPDATE, cb)
export const filtersRemoved = (cb) => on(FILTERS_REMOVE, cb)
export const everythingCleared = (cb) => on(EVERYTHING_CLEAR, cb)
export const rangeRemoved = (cb) => on(RANGE_REMOVE, cb)
