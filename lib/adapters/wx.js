const concurrency = 10

import wrapper from '../core/concurrency'

let request

try {
  request = wx && wrapper(wx.request, concurrency)
} catch (error) {
  
}

export default function wxAdapter(config) {
  return new Promise((resolve, reject) => {
    const { url, data, body, method, headers } = config

    request({
      url,
      data: data || body || {},
      header: headers,
      method: method.toUpperCase(),
      success: function (res) {
        if (res.statusCode !== 200) {
          reject({ ...res, ...config })
        } else {
          resolve({ ...res, ...config })
        }
      },
      fail: function (e) {
        reject({ ...e, ...config })
      }
    })
  })  
}
