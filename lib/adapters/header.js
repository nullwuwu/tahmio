function getUserAgnet() {
  const userAgent = window.navigator.userAgent;
  const clientUserAgnet = {};
  const oldEvn = userAgent.match(/yupaopao\/(.*)\/(.*)\/(.*)$/);
  let salt

  if (oldEvn && !/bridge/.test(userAgent)) {
    clientUserAgnet.udid = oldEvn[3].split(' ')[1];
  } else if (/bridge\/\d\.\d \((.*)\)/.test(userAgent)) {
    const env = RegExp.$1.split(';');

    clientUserAgnet.bundleInfo = env[0];
    clientUserAgnet.accessToken = env[2];
    clientUserAgnet.udid = env[3];
    salt = env[4];
    clientUserAgnet.network = env[5];
    clientUserAgnet.equipment = env[6];
    clientUserAgnet.osInfo = env[7];
    clientUserAgnet.channel = env[8];
    clientUserAgnet.webViewVersion = userAgent.match(/webkit\/(.*?)\s/i)[1]
  }

  return {
    clientUserAgnet,
    salt
  }
}

function headerGenerateor() {
  const header = {}
  
  const { clientUserAgnet } = getUserAgnet()

  if (!clientUserAgnet.udid) {
    return header;
  }

  header['X-Udid'] = clientUserAgnet.udid
  header['X-Client-Time'] = +new Date() + ''
  
  if (clientUserAgnet.bundleInfo) {
    header['X-Sign'] = ''
    header['X-AccessToken'] = clientUserAgnet.accessToken
    header['X-NetWork'] = clientUserAgnet.network
    header['X-User-Agent'] = `mapi/1.0 (${clientUserAgnet.osInfo || ' '};${clientUserAgnet.bundleInfo || ' '};${clientUserAgnet.equipment || ' '};${clientUserAgnet.channel || ' '}) kernel/1.0 (webkit;${clientUserAgnet.webViewVersion})`
  }

  return header;
}

function ice(url, options = {}) {
    const header = headerGenerateor()
    const isEmptyHeader = isEmptyObj(header)
    let body = options.body
  
    options.method = options.method || 'POST'
  
    if (body && !isEmptyHeader) {
      header['X-Sign'] = MD5(btoa(JSON.stringify(body)) + salt)
    }
  
    if (!isEmptyHeader) {
      header['X-Authentication'] = MD5(btoa(JSON.stringify(header)) + salt)
    }
  
    header['Content-Type'] = 'application/json; charset=utf-8'
  
    options.headers = {
      ...header,
      ...options.headers
    }
  
    if (body) {
      options.body = JSON.stringify(body)
    }
  
    return fetch(url, options).then(response => response.ok ? response.json() : Promise.reject(response))
  }