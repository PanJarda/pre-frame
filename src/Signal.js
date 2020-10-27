function Signal(name, signals, extractor) {
  this.name = name;
  this._signals = typeof signals === 'function'
    ? ['appDb']
    : signals;
  this._signalsNames = this._signals.reduce((acc, v, i) => {acc[v] = i; return acc} ,{});
  this._extractor = typeof signals === 'function' ? signals : extractor;
  this.subscribers = new Set();
  this.value;
  this._updateQueue = {};
  this._triggerUpdate = true;
  this._processQueue = this._processQueue.bind(this);
  if (name === 'appDb') {
    this._signals = [];
  }
}

Signal.prototype.subscribe = function(caller) {
  if (this.subscribers.size === 0) {
    this.subscribers.add(caller);
    this._signals.forEach(name => this._updateQueue[name] = signalsRegistry[name].subscribe(this));
    this._processQueue(true);
  } else {
    this.subscribers.add(caller);
  }
  return this.value;
};

Signal.prototype.unsubscribe = function(caller) {
  this.subscribers.delete(caller);
  if (this.subscribers.size === 0) {
    this._signals.forEach(name => signalsRegistry[name].unsubscribe(this))
  }
};

Signal.prototype._processQueue = function(withoutUpdate) {
  this._triggerUpdate = true;
  const signalsValues = [];
  Object.keys(this._updateQueue).forEach(name => {
    const newValue = this._updateQueue[name];
    signalsValues[this._signalsNames[name]] = newValue;
  });
  const result = this._extractor.apply(null, signalsValues);
  if (result === this.value) {
    return;
  }
  this.value = result;
  if (!withoutUpdate) {
    this.subscribers.forEach(sub => {
      if ('update' in sub) {
        sub.update(this.name, result);
      } else { // it is component;
        //sub.base.style.backgroundColor = "rgba(255,0,0,0.1)";
        //setTimeout(() => sub.base.style.backgroundColor = "unset", 100)
        sub.setState({});//({prdel: Math.floor(Math.random() * Math.floor(12346))}) // preact allready debouncing this
      }
    });
  }
};

Signal.prototype.update = function(name, newValue, sync) {
  this._updateQueue[name] = newValue;
  if (this._triggerUpdate) {
    this._triggerUpdate = false;
    queueMicrotask(this._processQueue);
  }
};

export const signalsRegistry = {};

export { Signal };
