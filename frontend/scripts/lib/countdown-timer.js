import { qs, add } from '@fluorescent/dom'

const selectors = {
  settings: '[data-timer-settings]',
  days: '[data-days]',
  hours: '[data-hours]',
  minutes: '[data-minutes]',
  seconds: '[data-seconds]',
}

const classes = {
  active: 'active',
  hide: 'hide',
  complete: 'complete',
}

export default function CountdownTimer(container) {
  const settings = qs(selectors.settings, container)
  const {
    year,
    month,
    day,
    hour,
    minute,
    shopTimezone,
    timeZoneSelection,
    hideTimerOnComplete,
  } = JSON.parse(settings.innerHTML)

  const daysEl = qs(selectors.days, container)
  const hoursEl = qs(selectors.hours, container)
  const minutesEl = qs(selectors.minutes, container)
  const secondsEl = qs(selectors.seconds, container)

  const timezoneString =
    timeZoneSelection === 'shop' ? ` GMT${shopTimezone}` : ''
  const countDownDate = new Date(
    Date.parse(`${month} ${day}, ${year} ${hour}:${minute}${timezoneString}`),
  )
  const countDownTime = countDownDate.getTime()

  const timerInterval = setInterval(timerLoop, 1000)
  timerLoop()
  add(container, classes.active)

  function timerLoop() {
    window.requestAnimationFrame(() => {
      // Get today's date and time
      const now = new Date().getTime()

      // Find the distance between now and the count down date
      const distance = countDownTime - now

      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      // If the count down is finished, write some text
      if (distance < 0) {
        timerInterval && clearInterval(timerInterval)
        daysEl.innerHTML = 0
        hoursEl.innerHTML = 0
        minutesEl.innerHTML = 0
        secondsEl.innerHTML = 0

        add(container, classes.complete)

        if (hideTimerOnComplete) {
          add(container, classes.hide)
        }
      } else {
        daysEl.innerHTML = days
        hoursEl.innerHTML = hours
        minutesEl.innerHTML = minutes
        secondsEl.innerHTML = seconds
      }
    })
  }

  function destroy() {
    timerInterval && clearInterval(timerInterval)
  }

  return { destroy }
}
