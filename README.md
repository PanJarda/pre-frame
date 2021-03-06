# 🔄 Pre-Frame
Truly reactive framework inspired by [re-frame](https://github.com/day8/re-frame).
1.5 kB (gzipped)

There is one way data flow, similar to [redux](https://redux.js.org/). But without tons of boilerplate reducers,
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
  
For more detailed description read [re-frame documentation](http://day8.github.io/re-frame/re-frame/).
## Install
```sh
yarn add PanJarda/pre-frame
```
or
```html
<script src="preact.min.js"></script>
<!-- make sure that pre-frame.min.js is loaded after preact.min.js -->
<script src="pre-frame.min.js"></script>
```
## Examples
### Simple counter
```js
import { h, render } from 'preact';

import {
  subscribe as $,
  regEvent,
  dispatchSync,
  $dispatch,
  bind,
  autoWire,
} from 'pre-frame';

// autoWire creates subscriptions for all keyes in app state
// autoWire is not pure, since it automatically registers subscriptions and eventhandlers
// but it is there just for convenience
regEvent('init-store',
  params => state => autoWire({
    counter: 0
  }));
/* without autoWire it would be equivalent to write:
regEvent('init-store',
  params => state => ({ counter: 0 }))

regEvent('counter',
  params => state => ({...state, counter: params }));

regSub('counter') // which is sugar for regSub('counter', state => state.counter)
*/

// all events are pure functions
regEvent('inc',
  params => state =>
    ({ ...state, counter: parseInt(state.counter) + 1 }));

regEvent('dec',
  params => state =>
    ({ ...state, counter: state.counter - 1 }));

// $dispatch is same as () => dispatch(..), but
// callback is cached so there is no recreation of callback
// on each render (similar to useCallback hook)
const App = () => (<div>
    <h1>{ $('counter') }</h1>
    <button onClick={ $dispatch('inc') }> + </button>
    <button onClick={ $dispatch('dec') }> - </button>
    <br/>
    <label>Set counter:</label>
    <input { ...bind('counter') } type="number" />
  </div>);

// dispatch is asynchronous but we need to initialize store
// before render, so we use synchronous version
dispatchSync('init-store');

render(<App/>, document.getElementById('app'))
```
### Signal graph
```js
import { h, render } from 'preact';

import {
  subscribe as $,
  regSub,
  regEvent,
  $dispatch,
  dispatchSync,
  autoWire,
  bind
} from 'pre-frame';

regEvent('init-store',
  params => state => autoWire({
    color: 'green',
    firstName: 'John',
    lastName: 'Doe'
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
// <input { ...bind('firstName') } is the same as <input onInput={ $dispatch('firstName') } value={ $('firstName') }/>

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
