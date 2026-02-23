import section from '@/scripts/glow/section'
import { qsa } from '@fluorescent/dom'
import CountdownTimer from '@/scripts/lib/countdown-timer'
import animateCountdownBanner from '@/scripts/lib/animation/countdown-banner'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  timer: '[data-countdown-timer]',
}

section('countdown-banner', {
  onLoad() {
    const timers = qsa(selectors.timer, this.container)
    this.countdownTimers = []

    timers.forEach((timer) => {
      this.countdownTimers.push(CountdownTimer(timer))
    })

    if (shouldAnimate(this.container)) {
      this.animateCountdownBanner = animateCountdownBanner(this.container)
    }
  },

  onUnload() {
    this.animateCountdownBanner?.destroy()
    this.countdownTimers.forEach((countdownTimer) => countdownTimer.destroy())
  },
})
