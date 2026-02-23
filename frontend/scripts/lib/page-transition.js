import Delegate from 'ftdomdelegate'

export default () => {
  const pageTransitionOverlay = document.querySelector(
    '#page-transition-overlay',
  )
  const animationDuration = 200

  if (pageTransitionOverlay) {
    pageTransitionOverlay.classList.remove('skip-transition')

    setTimeout(function () {
      pageTransitionOverlay.classList.remove('active')
    }, 0)

    setTimeout(() => {
      // Prevent the theme editor from seeing this
      pageTransitionOverlay.classList.remove('active')
    }, animationDuration)

    const delegate = new Delegate(document.body)

    delegate.on(
      'click',
      'a[href]:not([href^="#"]):not(.no-transition):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"]):not([href="javascript:void(0)"])',
      onClickedToLeave,
    )

    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        pageTransitionOverlay.classList.remove('active')
      }
    })
  }

  function onClickedToLeave(event, target) {
    // avoid interupting open-in-new-tab click
    if (event.ctrlKey || event.metaKey) return

    event.preventDefault()

    // Hint to browser to prerender destination
    let linkHint = document.createElement('link')
    linkHint.setAttribute('rel', 'prerender')
    linkHint.setAttribute('href', target.href)

    document.head.appendChild(linkHint)

    setTimeout(() => {
      window.location.href = target.href
    }, animationDuration)

    pageTransitionOverlay.classList.add('active')
  }
}
