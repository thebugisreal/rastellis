export default function (elements = []) {
  elements.forEach((el) => {
    const wrapper = document.createElement('div')
    wrapper.classList.add('rte__iframe')

    el.parentNode.insertBefore(wrapper, el)
    wrapper.appendChild(el)
    el.src = el.src
  })
}
