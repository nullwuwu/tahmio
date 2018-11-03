/**
 * @author caominjie
 * @description 缓存类
 */

export default class Cacher {
  constructor() {
    this.cacheMap = new Map()
    this.expire = this.option.expire || 1000 * 60 * 5
    this.maxCacheSize = this.option.maxCacheSize || 15
    this.excludeHeaders = this.option.excludeHeaders || true
  }

  setCache(key, val) {
    if (this.excludeHeaders) delete key.headers

    const k = JSON.stringify(key)

    this.cacheMap.set(k, val)

    if (this.maxCacheSize && this.cacheMap.size > this.maxCacheSize) {
      this.cacheMap.delete(
        ...this.cacheMap.keys()[0]
      )
    }

    if (this.expire) {
      setTimeout(() => {
        if (this.hasCache(k)) {
          this.cacheMap.delete(k)
        }
      }, this.expire)
    }
  }

  hasCache(key) {
    const k = typeof key === 'object' ? JSON.stringify(key) : key

    return this.cacheMap.has(k)
  }

  getCache(key) {
    const k = typeof key === 'object' ? JSON.stringify(key) : key

    return this.cacheMap.get(k)
  }
}