let callCount = 0
let lastEndpoint = 'none'
const listeners = []

export function incrementApiCall(endpoint) {
  callCount++
  lastEndpoint = endpoint
  listeners.forEach(fn => fn(callCount, endpoint))
}

export function subscribeToApiCalls(fn) {
  listeners.push(fn)
  return () => {
    const index = listeners.indexOf(fn)
    listeners.splice(index, 1)
  }
}
