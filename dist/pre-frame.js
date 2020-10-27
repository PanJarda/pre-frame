"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("preact");function t(e,t,s){this.name=e,this._signals="function"==typeof t?["appDb"]:t,this._signalsNames=this._signals.reduce(((e,t,s)=>(e[t]=s,e)),{}),this._extractor="function"==typeof t?t:s,this.subscribers=new Set,this.value,this._updateQueue={},this._triggerUpdate=!0,this._processQueue=this._processQueue.bind(this),"appDb"===e&&(this._signals=[])}t.prototype.subscribe=function(e){return 0===this.subscribers.size?(this.subscribers.add(e),this._signals.forEach((e=>this._updateQueue[e]=s[e].subscribe(this))),this._processQueue(!0)):this.subscribers.add(e),this.value},t.prototype.unsubscribe=function(e){this.subscribers.delete(e),0===this.subscribers.size&&this._signals.forEach((e=>s[e].unsubscribe(this)))},t.prototype._processQueue=function(e){this._triggerUpdate=!0;const t=[];Object.keys(this._updateQueue).forEach((e=>{const s=this._updateQueue[e];t[this._signalsNames[e]]=s}));const s=this._extractor.apply(null,t);s!==this.value&&(this.value=s,e||this.subscribers.forEach((e=>{"update"in e?e.update(this.name,s):e.setState({})})))},t.prototype.update=function(e,t,s){this._updateQueue[e]=t,this._triggerUpdate&&(this._triggerUpdate=!1,queueMicrotask(this._processQueue))};const s={},i=e.options.__r;let r;e.options.__r=e=>{r=e,i&&i(e)};const n={_:{}},u={},o={},c={dispatch:e=>_(...e),db:e=>{n._=e}},a={},p=(e,t)=>u[e]=t;s.appDb=new t("appDb",(e=>e));const h=function(e,i,r){if(1===arguments.length){const t=e.split(".");i=t.length>0?e=>t.reduce(((e,t)=>e[t]),e):t=>t[e]}s[e]=new t(e,i,r)},b=(e,t)=>{s.appDb.update("appDb",e,t)},f=[{after:(e,t)=>{Object.keys(e.effects).forEach((t=>{c[t](e.effects[t])}))}}],_=(e,t)=>{e in u?queueMicrotask((()=>{var s=u[e](t)(n._);n._=s,b(n._)})):e in o&&queueMicrotask((()=>{let s,i=o[e][0],r=o[e][1],u=f.reduce(((e,t)=>"before"in t?t.before(e):e),{event:[e].concat(t),db:n._});Array.isArray(i)?(u=i.reduce(((e,t)=>"before"in t?t.before(e):e),u),s={coeffects:u,effects:r(u,t)},s=i.reduceRight(((e,t)=>"after"in t?t.after(e):e),s)):s={coeffects:u,effects:r(u,t)},f.reduceRight(((e,t)=>"after"in t?t.after(e):e),s),b(n._)}))},d=e=>{const t="__c"in r?r.__c:r._component,i=s[e];if(!i.subscribers.has(t)){t.componentWillUnmount=function(){t.unsubscribe(sub)};return i.subscribe(t)}return i.value},l=(e=n._,t="")=>(Object.keys(e).forEach((i=>{const r=t+i;r in s||h(t+i),r in u||r in o||p(r,(e=>t=>({...t,[r]:e})));const n=e[i];"object"==typeof n&&"Object"===n.constructor.name&&l(n,t+i+".")})),e),g={},x={};exports.$dispatch=e=>e in x?x[e]:x[e]=()=>_(e),exports.autoWire=l,exports.bind=e=>({onInput:g[e]||(g[e]=t=>_(e,t.target.value)),value:d(e)}),exports.dispatch=_,exports.dispatchSync=(e,t)=>{if(!(e in u))throw"cannot find registered event";var s=u[e](t)(n._);n._=s,b(n._,!0)},exports.injectCofx=e=>({before:a[e]}),exports.regCofx=(e,t)=>a[e]=t,exports.regEvent=p,exports.regEventFx=function(e){let t,s;arguments.length>2?(t=arguments[1],s=arguments[2]):s=arguments[1],o[e]=[t,s]},exports.regFx=(e,t)=>c[e]=t,exports.regSub=h,exports.signalsRegistry=s,exports.subscribe=d;
