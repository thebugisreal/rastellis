import section from '@/scripts/glow/section'
import { qsa } from '@fluorescent/dom'
import CountdownTimer from '@/scripts/lib/countdown-timer'
import animateCountdownBar from '@/scripts/lib/animation/countdown-bar'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

const selectors = {
  timer: '[data-countdown-timer]',
}

section('countdown-bar', {
  onLoad() {
    const timers = qsa(selectors.timer, this.container)
    this.countdownTimers = []

    timers.forEach((timer) => {
      this.countdownTimers.push(CountdownTimer(timer))
    })

    if (shouldAnimate(this.container)) {
      this.animateCountdownBar = animateCountdownBar(this.container)
    }
  },

  onUnload() {
    this.animateCountdownBar?.destroy()
    this.countdownTimers.forEach((countdownTimer) => countdownTimer.destroy())
  },
})
