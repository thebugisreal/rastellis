const atBreakpointChange = (breakpointToWatch, callback) => {
  const _screenUnderBP = () => {
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth

    return viewportWidth <= breakpointToWatch
  }

  let screenUnderBP = _screenUnderBP()
  const widthWatcher = () => {
    const currentScreenWidthUnderBP = window.innerWidth <= breakpointToWatch

    if (currentScreenWidthUnderBP !== screenUnderBP) {
      screenUnderBP = currentScreenWidthUnderBP
      return callback()
    }
  }

  window.addEventListener('resize', widthWatcher)

  const unload = () => {
    window.removeEventListener('resize', widthWatcher)
  }

  return { unload }
}

export default atBreakpointChange
