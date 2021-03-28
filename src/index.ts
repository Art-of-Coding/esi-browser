/** URL to Eve Online ESI */
export const ESI_URL = 'https://esi.evetech.net/latest'

export interface ESIObject<T = any> {
  ETag: string,
  expires: number,
  data: T
}

export default async function fetchFromESI<T = any> (uri: string, endpoint = ESI_URL) {
  const key = `/esi${uri}`
  const strValue = localStorage.getItem(key)

  let info: ESIObject<T> = null

  if (strValue) {
    try {
      info = JSON.parse(strValue)
    } catch (e) {}
  }

  //
  const headers: Record<string, string> = {}

  if (info) {
    if (info.expires > Date.now()) {
      // Not expired - return data
      return info.data
    }

    headers['If-None-Match'] = info.ETag
  }

  const response = await fetch(`${endpoint}${uri}`, { headers })

  if (info && response.status === 304) {
    // @ts-ignore
    info.expires = new Date(response.headers['expires']).getTime()

    // Store the object again
    localStorage.setItem(key, JSON.stringify(info))

    return info.data
  }

  info = {
    // @ts-ignore
    ETag: response.headers['etag'],
    // @ts-ignore
    expires: new Date(response.headers['expires']).getTime(),
    data: await response.json()
  }

  // Store the object
  localStorage.setItem(key, JSON.stringify(info))
  return info.data
}
