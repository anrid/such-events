import { getCurrentStore } from './store'

export function apiCall (path, data) {
  const url = `${window['Config']['API_URL']}/${path}`
  console.log('url=', url)
  return postData(url, data)
}

function postData (url, data) {
  const headers = {
    'content-type': 'application/json'
  }

  // Include our session token (JWT) as part of headers.
  const state = getCurrentStore().getState()
  const session = state.app.session
  if (session && session.token) {
    headers['authorization'] = `Bearer ${session.token}`
  }

  // '*' marks default.
  return fetch(url, {
    method: 'POST',                   // *GET, POST, PUT, DELETE, etc.
    body: JSON.stringify(data),       // must match 'Content-Type' header
    headers,
    cache: 'default',                 // *default, no-cache, reload, force-cache, only-if-cached
    mode: 'cors',                     // no-cors, cors, *same-origin
    redirect: 'follow',               // *manual, follow, error
    referrer: 'such-events-client',
  })
  .then(response => response.json())  // parses response to JSON
  .catch(err => {
    console.error('[API] error:', err)
    throw err
  })
}
