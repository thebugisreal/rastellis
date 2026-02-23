const dispatchCustomEvent = (eventName, data = {}) => {
  const detail = { detail: data }
  const event = new CustomEvent(eventName, data ? detail : null)

  document.dispatchEvent(event)
}

export default dispatchCustomEvent
