## tahmio
> request lib

## Install
```js
```

## 支持功能
- [x] 接口缓存
- [x] request & response拦截器
- [x] 请求队列
- [x] 兼容其它端

## 拦截器配置

>> 上一个拦截器的返回值为下一个拦截器的参数。

```js
import request from '@fe/request'

request.interceptor.request.use(config => {
  // 对 请求参数 进行处理
  return config
}, undefined)


request.interceptor.response.use(response => {
  // 对 Status Code: 200 的接口进行处理
  return response
}, err => {
  // 对 Status Code: 500 404 403 的接口进行处理
})
```

## 缓存配置

```js
request.cacher.config({
    cache?: boolean,  // 全局开关
    beforeSetCache?: Function // 缓存设置钩子: 返回值为true时设置，否则不设置。
})
```