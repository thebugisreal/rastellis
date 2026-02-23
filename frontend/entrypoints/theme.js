import { add } from '@fluorescent/dom'
import isMobile from 'is-mobile'
import revive, { idle } from '@/scripts/extra/revive'

// Islands
const islands = {
  ...import.meta.glob('@/scripts/sections/*.js'),
  ...import.meta.glob('@/scripts/templates/*.js'),
  ...import.meta.glob('@/scripts/modules/*.js'),
}

revive(islands)

async function loadLibraries() {
  await idle()

  import('@/scripts/extra/load-libraries.js')
}

loadLibraries()

// eslint-disable-next-line no-prototype-builtins
if (!HTMLElement.prototype.hasOwnProperty('inert')) {
  import('@/scripts/manualChunks/polyfill-inert.js')
}

if (isMobile({ tablet: true, featureDetect: true })) {
  add(document.body, 'is-mobile')
}
