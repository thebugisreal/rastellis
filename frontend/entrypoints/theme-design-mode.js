import { load } from '@shopify/theme-sections'
import { add, listen, qs } from '@fluorescent/dom'
import isMobile from 'is-mobile'

import pageTransition from '@/scripts/lib/page-transition'
import modal from '@/scripts/lib/modal'
import storeAvailabilityDrawer from '@/scripts/lib/store-availability-drawer'
import { handleTab } from '@/scripts/lib/a11y'
import sectionClasses from '@/scripts/lib/section-classes'
import { hydrate } from 'evx'
import quickViewModal from '@/scripts/lib/quick-view-modal'
import productLightbox from '@/scripts/lib/product-lightbox'

import { flashAlertModal } from '@/scripts/lib/flash-alert'
import headerOverlay from '@/scripts/lib/header-overlay'
import backToTop from '@/scripts/lib/back-to-top'

// eslint-disable-next-line no-prototype-builtins
if (!HTMLElement.prototype.hasOwnProperty('inert')) {
  import('@/scripts/manualChunks/polyfill-inert.js')
}

// Detect theme editor
if (window.Shopify.designMode === true) {
  add(document.documentElement, 'theme-editor')
  document.documentElement.classList.add('theme-editor')
} else {
  const el = qs('.theme-editor-scroll-offset', document)
  el && el.parentNode.removeChild(el)
}

// Function to load all sections
const loadSections = async () => {
  // Import sections
  const modules = {
    ...import.meta.glob('@/scripts/sections/*.js'),
    ...import.meta.glob('@/scripts/templates/*.js'),
    ...import.meta.glob('@/scripts/modules/*.js'),
  }

  const modulePromises = Object.values(modules).map((module) => module())
  await Promise.all(modulePromises)
  load('*')
  hydrate({ SelectedProductSection: null })
}

// Call above function either immediately or bind on loaded event
if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  loadSections()
} else {
  listen(document, 'DOMContentLoaded', loadSections)
}

if (isMobile({ tablet: true, featureDetect: true })) {
  add(document.body, 'is-mobile')
}

// Page transitions
pageTransition()

// a11y tab handler
handleTab()

// Apply contrast classes
sectionClasses()

// Load productlightbox
productLightbox()

// Quick view modal
const quickViewModalElement = qs('[data-quick-view-modal]', document)

if (quickViewModalElement) {
  quickViewModal(quickViewModalElement)
}

// Setup modal
const modalElement = qs('[data-modal]', document)
modal(modalElement)

const flashModal = qs('[data-flash-alert]', document)
flashAlertModal(flashModal)

// Product availabilty drawer
const availabilityDrawer = qs('[data-store-availability-drawer]', document)
storeAvailabilityDrawer(availabilityDrawer)

// Setup header overlay
const headerOverlayContainer = document.querySelector('[data-header-overlay]')
headerOverlay(headerOverlayContainer)

// Init back to top button
backToTop()

// Make it easy to see exactly what theme version
// this is by commit SHA
window.SHA = '__gitSHA'

if (
  !sessionStorage.getItem('flu_stat_recorded') &&
  !window.Shopify?.designMode
) {
  // eslint-disable-next-line no-process-env
  fetch('https://stats.fluorescent.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...window.theme.coreData,
      s: window.Shopify?.shop,
      r: window.Shopify?.theme?.role,
    }),
  })

  if (window.sessionStorage) {
    sessionStorage.setItem('flu_stat_recorded', 'true')
  }
}
