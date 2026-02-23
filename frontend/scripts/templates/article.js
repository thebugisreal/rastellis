import { qs, qsa } from '@fluorescent/dom'
import { focusFormStatus } from '@/scripts/lib/a11y'

import section from '@/scripts/glow/section'
import wrapIframes from '@/scripts/lib/rte/wrapIframes'
import wrapTables from '@/scripts/lib/rte/wrapTables'
import SocialShare from '@/scripts/lib/social-share'
import animateArticle from '@/scripts/lib/animation/article'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'
import ProductItem from '@/scripts/lib/product-item'

section('article', {
  onLoad() {
    focusFormStatus(this.container)

    const socialShareContainer = qs('.social-share', this.container)

    if (socialShareContainer) {
      this.socialShare = SocialShare(socialShareContainer)
    }

    wrapIframes(qsa('iframe', this.container))
    wrapTables(qsa('table', this.container))

    this.productItem = ProductItem(this.container)

    if (shouldAnimate(this.container)) {
      this.animateArticle = animateArticle(this.container)
    }
  },

  onUnload() {
    this.socialShare && this.socialShare()
    this.animateArticle?.destroy()
    this.productItem && this.productItem.unload()
  },
})
