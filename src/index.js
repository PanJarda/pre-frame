import { options } from 'preact';
import { Signal, signalsRegistry } from './Signal';

const tmp = options.__r;

let currentComponent;

options.__r = vnode => {
  //if (typeof vnode.type === 'function') {
  currentComponent = vnode;
  //}
  if (tmp) {
    tmp(vnode);
  }
};

let currentSubName;

const db = { _: {}};

const events = {};

const eventsFx = {};

const effects = {
  dispatch: params => dispatch(...params),
  db: newDb => {db._ = newDb}
};

const coeffects = {};

export const regEvent = (name, effect) => (events[name] = effect);

export const regEventFx = function(name) {
  let interceptors;
  let effect;
  if (arguments.length > 2) {
    interceptors = arguments[1];
    effect = arguments[2];
  } else {
    effect = arguments[1];
  }

  eventsFx[name] = [interceptors, effect];
}

export const regFx = (name, handler) => effects[name] = handler;

export const regCofx = (name, handler) => coeffects[name] = handler;
// handler = coeffects => coeffects;

export const injectCofx = name => ({ before: coeffects[name] });

const subs = {};

const masterSub = new Set();

signalsRegistry.appDb = new Signal('appDb', db => db);

export const regSub = function(name, signals, extractor) {
  if (arguments.length === 1) {
    const path = name.split('.');
    if (path.length > 0) {
      signals = db => path.reduce((acc, key) => acc[key], db);
    } else {
      signals = db => db[name];
    }
  }
  signalsRegistry[name] = new Signal(name, signals, extractor);
};

const notifySubscribers = (db, sync) => {
  signalsRegistry.appDb.update('appDb', db, sync);
};

const deffaultInterceptors = [
  {
    after: (ctx, ev) => {
      Object.keys(ctx.effects).forEach(key => {
        effects[key](ctx.effects[key]);
      })
    }
  }
]

export const dispatchSync = (name, params) => {
  if (name in events) {
    var newDb = events[name](params)(db._);
    db._ = newDb;
    notifySubscribers(db._, true);
  } else {
    throw "cannot find registered event";
  }
}

export const dispatch = (name, params) => {
  if (name in events) {
    queueMicrotask(() => {
      var newDb = events[name](params)(db._);
      db._ = newDb;
      notifySubscribers(db._);
    });
  } else if (name in eventsFx) {
    queueMicrotask(() => {
      let interceptors = eventsFx[name][0];
      let effect = eventsFx[name][1];

      let coeff = deffaultInterceptors.reduce((acc, interceptor) => 'before' in interceptor ? interceptor.before(acc) : acc, {event: [name].concat(params), db: db._ })
      let ctx;
      if (Array.isArray(interceptors)) {
        coeff = interceptors.reduce((acc, interceptor) => 'before' in interceptor ? interceptor.before(acc) : acc, coeff);

        ctx = { coeffects: coeff, effects: effect(coeff, params) };
        ctx = interceptors.reduceRight((acc, interceptor) => 'after' in interceptor ? interceptor.after(acc) : acc, ctx);
      } else {
        ctx = { coeffects: coeff, effects: effect(coeff, params) };
      }
      deffaultInterceptors.reduceRight((acc, interceptor) => 'after' in interceptor ? interceptor.after(acc) : acc , ctx)
      notifySubscribers(db._);
    });
  }
};

export const subscribe = name => {
  const comp = '__c' in currentComponent ? currentComponent.__c : currentComponent._component;
  const signal = signalsRegistry[name];
  if (!signal.subscribers.has(comp)) {
    comp.componentWillUnmount = function() {
      comp.unsubscribe(sub);
    };
    const res = signal.subscribe(comp);
    return res;
  }
  return signal.value;
};

export const autoWire = (obj = db._, prefix = '') => {
  Object.keys(obj).forEach(key => {
    const name = prefix + key;
    if (!(name in signalsRegistry)) {
      regSub(prefix + key);
    }
    if (!(name in events) && !(name in eventsFx)) {
      regEvent(name, prop => db => ({ ...db, [name]: prop }));
    }
    const child = obj[key];
    if (typeof child === 'object' && child.constructor.name === 'Object') {
      autoWire(child, prefix + key + '.');
    }
  })
  return obj;
};

const cachedBinds = {};

export const bind = name => ({
  onInput: cachedBinds[name] || (cachedBinds[name] = e => dispatch(name, e.target.value)),
  value: subscribe(name)
});

const cachedDispatches = {};

export const $dispatch = name => {
    if (name in cachedDispatches) {
      return cachedDispatches[name];
    } else {
      return (cachedDispatches[name] = () => dispatch(name));
    }
}

export { signalsRegistry };
