export default function debounce() {
  let timer

  return function (func, time = 100) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(func, time)
  }
}
