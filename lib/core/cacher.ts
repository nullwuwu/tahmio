/**
 * @class 缓存类
 * @description 根据配置项控制缓存
 */

export interface CacherOption {
    cache?: boolean
    expire?: number
    maxCacheSize?: number
    beforeSetCache?: Function
}

export interface CaCher {
    setCache(key: string, val: any): void
    hasCache(key: string): boolean
    getCache(key: string): void
    config(config: CacherOption): void

    cache?: boolean
    beforeSetCache?: Function
}

class Cacher implements CaCher {
    cacheMap: Map<string, object>
    options: CacherOption

    constructor(options: CacherOption = {}) {
        // 缓存集合
        this.cacheMap = new Map()
        // 缓存开关
        this.options.cache = options.cache || false
        // 过期时间
        this.options.expire = options.expire || 1000 * 60 * 5
        // 缓存量
        this.options.maxCacheSize = options.maxCacheSize || 1000 * 60 * 5
        // 缓存设置钩子
        this.options.beforeSetCache = options.beforeSetCache || (() => true)
    }

    config(config: CacherOption) {
        this.options = Object.assign(this.options, config)
    }

    setCache(key: string, val: any) {
        this.cacheMap.set(key, val)

        if (this.options.maxCacheSize && this.cacheMap.size > this.options.maxCacheSize) {
        this.cacheMap.delete(
            this.cacheMap.keys().next().value
        )
    }

        if (this.options.expire) {
            setTimeout(() => {
                if (this.hasCache(key)) {
                    this.cacheMap.delete(key)
                }
            }, this.options.expire)
        }
    }

    hasCache(key: string) {
        return this.cacheMap.has(key)
    }

    getCache(key: string) {
        return this.cacheMap.get(key)
    }
}

export default Cacher