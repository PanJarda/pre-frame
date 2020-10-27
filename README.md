# Pre-Frame
reactive framework inspired by [re-frame](https://github.com/day8/re-frame).
2 kB minified

## Simple counter
```js
import { h, render } from 'preact';

import {
  subscribe as $,
  regEvent,
  dispatchSync,
  $dispatch,
  autoWire,
} from 'pre-frame';

// autoWire creates subscriptions for all keyes in app state
regEvent('init-store',
  params => oldState => autoWire({
    counter: 0
  }));

// all events are pure functions
regEvent('inc',
  params => oldState =>
    ({ ...oldState, counter: oldState.counter + 1 }));

regEvent('dec',
  params => oldState =>
    ({ ...oldState, counter: oldState.counter - 1 }));

// $dispatch is sugar for () => dispatch(..) but
// callback is cached so there is no recreation of callback
// on each render
const App = () =>
  <>
    <h1>{ $('counter') }</h1>
    <button onClick={ $dispatch('inc') }> + </button>
    <button onClick={ $dispatch('dec') }> - </button>
  </>

// dispatch is asynchronous but we need to initialize store
// before render
dispatchSync('init-store');

render(<App/>, document.getElementById('app'))
```
## Advanced example
```js
import { h, render } from 'preact';

import {
  subscribe as $,
  regEvent,
  dispatchSync,
  autoWire,
  bind
} from 'pre-frame';

regEvent('init-store',
  params => state => autoWire({
    color: 'green',
    firstName: 'Jarda',
    lastName: 'Carda'
  }));

// declare signal graph
// every time firstName or lastName changes
// fullName recalculates value and notify preact component to rerender
regSub('fullName',
  ['firstName', 'lastName'],
  (firstName, lastName) => firstName + ' ' + lastName)

const App = () =>
  <div>
    <h1 style={{color: $('color')}}>Mr. { $('fullName') }</h1>
    <h2>Favourite color is: { $('color') }</h2>
    <input { ...bind('color') } />
    <input { ...bind('firstName') } />
    <input { ...bind('lastName') } />
  </div>;

dispatchSync('init-store');

render(<App/>, document.getElementById('app'))
```
## Coeffects and interceptors
```js

// register interceptor
regCofx('now',
  coeff => ({ ...coeff, now: (new Date()).toLocaleTimeString()}));

regEventFx('now',
  [ injectCofx('now') ], // interceptor injects current time to coeffect
  coeff => ({ db: { ...coeff.db, now: coeff.now });
```

## Ajax using effects
```js
// effect handler
regFx('ajax', params => {
  const p = { method: 'method' in params ? params.method : 'GET' };
  fetch(params.uri, p)
  .then(response => params.format === 'json' ? response.json() : response.text())
  .then(data => dispatch(params.onSuccess, data))
  .catch(err => dispatch(...params.onFailure))
});

// register effectfull event
regEventFx('get-articles',
  coeff => ({
    db: {...coeff.db, loading: true },
    ajax: {
      uri: '/api/articles'
      format: 'json',
      method: 'GET',
      onSuccess: 'get-articles-success',
      onFailure: ['api-request-error', 'get-articles']
    }
  }))

regEvent('get-articles-success',
  articles => db =>
    ({ ...db, articles, loading: false }))

regEvent('api-request-error',
  err => db =>
    ({ ...db, loading: false, error: 'failed to retrieve ' + err }))
```
