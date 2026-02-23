import { qsa, qs } from '@fluorescent/dom'
import section from '@/scripts/glow/section'
import animateStatGroup from '@/scripts/lib/animation/stat-group'
import shouldAnimate from '@/scripts/lib/animation/shouldAnimate'

section('stat-group', {
  onLoad() {

    this.statFunction()

    let resizeTimeout

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout)

        resizeTimeout = setTimeout(() => {
          this.statFunction()
        }, 300)
    })

    if (shouldAnimate(this.container)) {
      this.animateStatGroup = animateStatGroup(this.container)
    }
  },
  statFunction (clear) {
    const items = qsa('.js-group', this.container)
    const color = this.container.getAttribute('data-border-color')
    const duration = parseFloat(this.container.getAttribute('data-duration'))

    items.forEach((group) => {
      const svgObj = qs('.js-svg', group)
      const perObj = qs('.js-number', group)
      const numberCount = parseFloat(group.getAttribute('data-number'))
      const unit = group.getAttribute('data-unit')

      perObj.textContent = ''
      svgObj.innerHTML = ''

      const per = numberCount / 100

      // Establish dimensions
      const wide = group.offsetWidth
      const center = wide / 2
      const radius = wide * 0.96 / 2
      const start = center - radius

      const svg = Snap(svgObj)
      let arc = svg.path("")

      // Initialize the circle pre-animation
      const circle = svg.circle(wide / 2, wide / 2, radius);
      const screenWidth = window.innerWidth

      let strokeW = 3

      if (screenWidth >= 768) {
        strokeW = 5
      }

      circle.attr({
        stroke: 'none',
        fill: 'none',
        strokeWidth: strokeW
      });

      // Gather everything together
      const stat = {
        center: center,
        radius: radius,
        start: start,
        svgObj: svgObj,
        per: per,
        svg: svg,
        arc: arc,
        color: color,
        unit: unit,
        duration: duration,
        circle: circle
      }

      // Call the animation
      this.run(stat)
    })
  },

  // Animation function
  run (stat) {

    // Establish the animation end point
    const endpoint = stat.per * 360

    // Set up animation (from, to, setter)
    Snap.animate(0, endpoint, (val) => {

      // Remove the previous arc
      stat.arc.remove()

      // Get the current percentage
      const curPer = Math.round(val / 360 * 100)

      const screenWidth = window.innerWidth

      let strokeW = 3

      if (screenWidth >= 768) {
        strokeW = 5
      }

      // If it's maxed out
      if (curPer === 100) {
        // Color the circle stroke instead of the arc
        stat.circle.attr({
          stroke: stat.color,
          strokeWidth: strokeW,
        })

      } else {
        // Calculate the arc

        const d = val
        const dr = d - 90
        const radians = Math.PI * (dr) / 180
        const endx = stat.center + stat.radius * Math.cos(radians)
        const endy = stat.center + stat.radius * Math.sin(radians)
        const largeArc = d > 180 ? 1 : 0
        const path = "M" + stat.center + "," + stat.start + " A" + stat.radius + "," + stat.radius + " 0 " + largeArc + ",1 " + endx + "," + endy

        const oldPaths = qsa('path', stat.svg.node)

        oldPaths.forEach(path => {
          path.setAttribute('stroke', 'none')
        })

        stat.arc = stat.svg.path(path)

        stat.arc.attr({
          stroke: stat.color,
          fill: 'none',
          strokeWidth: strokeW,
          strokeLinecap: "round"
        })
      }

      // Grow the percentage text
      stat.svgObj.previousElementSibling.innerHTML = curPer + stat.unit

    }, stat.duration, mina.easeinout)

  },

  onUnload() {
    this._statFunction?.destroy()
    this.animateStatGroup?.destroy()
  },
})
