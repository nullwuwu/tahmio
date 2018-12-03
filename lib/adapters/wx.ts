import wrapper from '../core/concurrency'

interface requestMap {
  [key: number]: Function
}

const requestMap: requestMap = {

}

export default function wxAdapter(config) {
  return new Promise((resolve, reject) => {
    const { url, data, body, method, headers, concurrency = 10 } = config

    if (!requestMap[concurrency]) {
      requestMap[concurrency] = wrapper(wx.request)
    }

    return requestMap[concurrency]({
      url,
      data: data || body || {},
      header: headers,
      method: method.toUpperCase(),
      success: function(res) {
        if (res.statusCode !== 200) {
          reject({ ...res, ...config })
        } else {
          resolve({ ...res, ...config })
        }
      },
      fail: function(e) {
        reject({ ...e, ...config })
      }
    })
  })
}