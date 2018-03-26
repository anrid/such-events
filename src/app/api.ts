import { getCurrentStore } from './store'

export function apiCall (path: string, data: any) {
  const url = `${window['Config']['API_URL']}${path}`
  return postData(url, data)
}

function postData (url: string, data: any) {
  const headers = {
    'content-type': 'application/json'
  }

  // Include our session token (JWT) as part of headers.
  const state = getCurrentStore().getState()
  const session = state.app.session
  if (session && session.token) {
    headers['authorization'] = `Bearer ${session.token}`
  }

  console.log({ tag: 'API', message: 'send', url, data })
  // '*' marks default.
  return fetch(url, {
    method: 'POST',                   // *GET, POST, PUT, DELETE, etc.
    body: JSON.stringify(data),       // Must match 'Content-Type' header.
    headers,
    cache: 'default',                 // *default, no-cache, reload, force-cache, only-if-cached
    mode: 'cors',                     // no-cors, cors, *same-origin
    redirect: 'follow',               // *manual, follow, error
    referrer: 'such-events-client',
  })
  .then(response => response.json())  // Parses response to JSON.
  .then(json => {
    console.log({ tag: 'API', message: 'receive', url, json })
    return json
  })
  .catch(err => {
    console.error({ tag: 'API', message: err.message, url, data, error: err })
    throw err
  })
}
