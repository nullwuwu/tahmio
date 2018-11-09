/**
 * @author caominjie
 * @description 缓存类
 */

export default class Cacher {
  constructor(option = {}) {
    this.cacheMap = new Map()

    this.expire = option.expire || 1000 * 60 * 5
    this.maxCacheSize = option.maxCacheSize || 15
    this.excludeHeaders = option.excludeHeaders || true
  }

  setCache(key, val) {
    this.cacheMap.set(key, val)

    if (this.maxCacheSize && this.cacheMap.size > this.maxCacheSize) {
      this.cacheMap.delete(
        this.cacheMap.keys().next().value
      )
    }

    if (this.expire) {
      setTimeout(() => {
        if (this.hasCache(key)) {
          this.cacheMap.delete(key)
        }
      }, this.expire)
    }
  }

  hasCache(key) {
    return this.cacheMap.has(key)
  }

  getCache(key) {
    return this.cacheMap.get(key)
  }
}