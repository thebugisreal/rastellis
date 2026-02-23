import section from '@/scripts/glow/section'
import { qs, qsa, listen } from '@fluorescent/dom'
import { emit, on } from 'evx'
import animateImageCompare from '@/scripts/lib/animation/image-compare'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  imageContainer: '.image-compare__image-container',
  labelContainer: '.image-compare__label-container',
  slider: '.image-compare__slider',
}

section('image-compare', {
  onLoad() {
    this.events = []
    this._initSliders()

    if (shouldAnimate(this.container)) {
      this.animateImageCompare = animateImageCompare(this.container)
    }
  },

  _initSliders() {
    this.imageContainer = qs(selectors.imageContainer, this.container)
    this.labelContainers = qsa(selectors.labelContainer, this.container)
    this.slider = qs(selectors.slider, this.container)

    // Check if slider exists (must be some blocks to exist)
    this.slider &&
      this.events.push(
        listen(this.slider, 'input', (e) =>
          this.imageContainer.style.setProperty(
            '--position',
            `${e.target.value}%`,
          ),
        ),
        listen(this.slider, 'mousedown', () => this.hideLabelContainers()),
        listen(this.slider, 'touchstart', () => this.hideLabelContainers()),
        listen(this.slider, 'mouseup', () => this.showLabelContainers()),
        listen(this.slider, 'touchend', () => this.showLabelContainers()),
      )
  },

  hideLabelContainers() {
    this.labelContainers.forEach((e) => {
      e.style.setProperty('opacity', `0`)
    })
  },

  showLabelContainers() {
    this.labelContainers.forEach((e) => {
      e.style.setProperty('opacity', `1`)
    })
  },

  onUnload() {
    this.events.forEach((unsubscribe) => unsubscribe())
    this.animateImageCompare?.destroy()
  },
})
