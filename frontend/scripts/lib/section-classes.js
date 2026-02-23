import { add, qsa, listen } from '@fluorescent/dom'

const classes = {
  hidden: 'hidden',
}

export default () => {
  function adjustClasses() {
    const sections = qsa('.main .shopify-section')
    sections.forEach((section) => {
      const { firstElementChild: child } = section

      // Specific to recommended hidden products
      if (child && child.classList.contains(classes.hidden)) {
        add(section, classes.hidden)
      }
    })
  }

  adjustClasses()
  listen(document, 'shopify:section:load', adjustClasses)
}
