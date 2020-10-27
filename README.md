# Pre-Frame
reactive framework inspired by [re-frame](https://github.com/day8/re-frame).
1.5 kB (gzipped)

There is one way data flow, similar to [redux](https://redux.js.org/). But without tons of boilerplate code,
adapters, mappings to props and dispatch, context providers etc.
And on top of this, you have more predictable state changes, due to ability to describe
effectfull event handlers by pure functions and chain that event handlers.
You only care of pure state transformations and dealing with
external state of world is handled by pre-frame for you via concept of coeffects.

**Easier testing, less code, less bugs. 1.5 kB**

### It works like this
1. describe your data store aka db in re-frame terminology
2. describe events, there are two types
  a) regEvent - pure transformations of state
  b) regEventFx - can calculate new state based on some other state from outer world
      for example actual date, results of some ajax queries, etc. and can trigger other
       event handlers
3. describe signal graph, which means describe what happens when app state changes
4. describe view - simply preact components, and bind it with app state through
  subscriptions.
  
For more detailed information read [re-frame documentation](http://day8.github.io/re-frame/re-frame/).

## Examples
### Simple counter
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
### Advanced example
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
    <input { ...bind('firstName') } /> // equals <input onInput={ $dispatch('firstName') } value={ $('firstName') }/>
    <input { ...bind('lastName') } />
  </div>;

dispatchSync('init-store');

render(<App/>, document.getElementById('app'))
```
### Coeffects and interceptors
```js

// register interceptor
regCofx('now',
  coeff => ({ ...coeff, now: (new Date()).toLocaleTimeString()}));

regEventFx('now',
  [ injectCofx('now') ], // interceptor injects current time to coeffect
  coeff => ({ db: { ...coeff.db, now: coeff.now });
```

### Ajax using effects
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
regEventFx('get-articles',  // use: dispatch('get-articles')
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
