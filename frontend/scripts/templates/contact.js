import { qsa } from '@fluorescent/dom'
import section from '@/scripts/glow/section'

import accordions from '@/scripts/lib/accordions'
import wrapIframes from '@/scripts/lib/rte/wrapIframes'
import wrapTables from '@/scripts/lib/rte/wrapTables'

section('contact', {
  onLoad() {
    this.accordions = accordions(qsa('.accordion', this.container))

    wrapIframes(qsa('iframe', this.container))
    wrapTables(qsa('table', this.container))
  },

  onUnload() {
    this.accordions.unload()
  },
})
