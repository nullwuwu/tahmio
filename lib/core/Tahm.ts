import Cacher from './cacher';
import InterceptorManager from './interceptorManager';
import dispatchRequest from './dispatchRequest';

// helpers
import isAbsoluteURL from '../helpers/isAbsoluteURL'
import combineURL from '../helpers/combineURL'

// interface
import { Interceptor } from './interceptorManager';
import { CaCher } from './cacher';
import { merge } from '../utils';

interface TahmInterceptor {
    request: Interceptor
    response: Interceptor
}

interface Tahm {
    request(config: any): Promise<any>
}

export interface TahmDefaultConfig {
    baseURI?: string
    method?: string
    headers?: Headers
    timeout?: number
}

class Tahm implements Tahm{
    defaults: TahmDefaultConfig = {}
    cacher: CaCher
    interceptors: TahmInterceptor

    constructor(defaultConfig: TahmDefaultConfig = {}) {
        this.defaults = defaultConfig
        // 功能类的持有
        this.cacher = new Cacher()

        this.interceptors = {
            request: new InterceptorManager(),
            response: new InterceptorManager()
        }
    }

    request(config: any) {
        /**
         * @main 参数合并
         * @description 可以使用两种方式进行传参
         * request(url, {
         *  method: 'post'
         * })
         * 
         * request({
         *  url: '',
         *  method: 'post'
         * })
         */
        if (typeof config === 'string') {
            config = Object.assign(
                { url: arguments[0] },
                arguments[1]
            )
        }

        config = merge(this.defaults, config)


        if (config.baseURL && !isAbsoluteURL(config.url)) {
            config.url = combineURL(config.baseURL, config.url)
        }

        config.headers = merge({}, config.headers || {})

        let promise: Promise<any> = Promise.resolve(config)

        const chain: Array<any> = [dispatchRequest, undefined]

        /**
         * @main 根据配置进行缓存控制
         */
        const { cache, beforeSetCache } = this.cacher

        // 判断全局开关
        if (cache) {
            const cacheKey = `${config.url}${JSON.stringify(config.data || config.body)}`

            // 判断cacheMap里是否有缓存
            if (this.cacher.hasCache(cacheKey)) {
                // 替换缓存response
                chain.splice(0, 1, () => this.cacher.getCache(cacheKey))
            } else {
                // 植入缓存设置拦截器
                chain.push(
                    response => {
                        // 根据用户配置的钩子判断是否需要缓存
                        const beforeSetCacheHook = beforeSetCache && beforeSetCache(response)

                        beforeSetCacheHook && this.cacher.setCache(cacheKey, response)

                        return response
                    },
                    undefined
                )
            }
        }

        /**
         * @main 拦截器入栈
         * @description request前置，response后置
         */
        this.interceptors.request.reducer(({ fulfilled, rejected }) => {
            chain.unshift(fulfilled, rejected)
        })

        this.interceptors.response.reducer(({ fulfilled, rejected }) => {
            chain.push(fulfilled, rejected)
        })

        /**
         * @main promise
         * @description 链式调用
         */
        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift())
        }

        return promise
    }
}

export default Tahm