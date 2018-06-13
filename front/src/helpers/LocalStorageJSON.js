/* global localStorage */
class LocalStorageJSON {
  constructor (storageKey) {
    this.storageKey = storageKey
    const dataJSON = localStorage.getItem(storageKey)
    try {
      this.data = JSON.parse(dataJSON) || {}
    } catch (e) {
      this.data = null
    }
  }
  get () {
    return this.data
  }
  set (data) {
    this.data = data
    localStorage.setItem(this.storageKey, JSON.stringify(this.data))
  }
}

export default LocalStorageJSON
