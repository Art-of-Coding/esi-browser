import StatusError from './util/StatusError'

interface EsiObject<T> {
  status: number,
  ETag: string,
  expiresOn: Date,
  data: T
}

export default async function fetchEsi<T> (uri: string, opts?: {
  statusCodes?: number[],
  headers?: Record<string, string>,
  check?: boolean
}) {
  const check = typeof opts?.check === 'boolean' ? opts.check : true
  const statusCodes = opts?.statusCodes ?? [ 200 ]
  const headers = opts?.headers ?? {}

  if (!uri.startsWith('/')) {
    uri = `/${uri}`
  }

  if (!uri.endsWith('/')) {
    uri = `${uri}/`
  }

  const strValue = localStorage.getItem(uri)

  let requestInfo: EsiObject<T> | null = null
  if (check && strValue) {
    try { requestInfo = JSON.parse(strValue) }
    catch (e) { throw new Error('Unable to parse stored info') }

    if (requestInfo && new Date(requestInfo.expiresOn).getTime() > Date.now()) {
      return requestInfo.data
    }

    if (requestInfo?.ETag) {
      headers['If-None-Match'] = requestInfo.ETag
    }

    if (!statusCodes.includes(304)) {
      statusCodes.push(304)
    }
  }

  const response = await fetch(`https://esi.evetech.net/latest${uri}`, {
    method: 'GET',
    headers
  })

  if (!statusCodes.includes(response.status)) {
    const data = await response.json()
    throw new StatusError(response.status, data.error ?? 'No message')
  }

  if (requestInfo && response.status === 304) {
    return requestInfo.data
  }

  const data = await response.json()

  if (check && response.status >= 200 && response.status <= 299) {
    localStorage.setItem(uri, JSON.stringify({
      status: response.status,
      ETag: response.headers.get('etag'),
      expiresOn: response.headers.get('expires'),
      data
    }))
  }

  return data
}
