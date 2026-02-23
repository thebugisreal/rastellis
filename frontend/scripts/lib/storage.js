function localStorageAvailable() {
  var test = 'test'
  try {
    localStorage.setItem(test, test)
    if (localStorage.getItem(test) !== test) {
      return false
    }
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

const PREFIX = 'fluco_'

function getStorage(key) {
  if (!localStorageAvailable()) return null
  return JSON.parse(localStorage.getItem(PREFIX + key))
}

function removeStorage(key) {
  if (!localStorageAvailable()) return null
  localStorage.removeItem(PREFIX + key)
  return true
}

function setStorage(key, val) {
  if (!localStorageAvailable()) return null
  localStorage.setItem(PREFIX + key, val)
  return true
}

export { getStorage, removeStorage, setStorage }
