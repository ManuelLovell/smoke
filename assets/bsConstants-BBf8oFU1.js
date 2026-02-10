(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function i(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(n){if(n.ep)return;n.ep=!0;const s=i(n);fetch(n.href,s)}})();var x=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class ot{constructor(e){this.messageBus=e}get id(){if(!this.messageBus.userId)throw Error("Unable to get user ID: not ready");return this.messageBus.userId}getSelection(){return x(this,void 0,void 0,function*(){const{selection:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_SELECTION",{});return e})}select(e,i){return x(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:e,replace:i})})}deselect(e){return x(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_DESELECT",{items:e})})}getName(){return x(this,void 0,void 0,function*(){const{name:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_NAME",{});return e})}setName(e){return x(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_NAME",{name:e})})}getColor(){return x(this,void 0,void 0,function*(){const{color:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_COLOR",{});return e})}setColor(e){return x(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_COLOR",{color:e})})}getSyncView(){return x(this,void 0,void 0,function*(){const{syncView:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_SYNC_VIEW",{});return e})}setSyncView(e){return x(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_SYNC_VIEW",{syncView:e})})}getId(){return x(this,void 0,void 0,function*(){const{id:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_ID",{});return e})}getRole(){return x(this,void 0,void 0,function*(){const{role:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_ROLE",{});return e})}getMetadata(){return x(this,void 0,void 0,function*(){const{metadata:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_METADATA",{});return e})}setMetadata(e){return x(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_METADATA",{update:e})})}hasPermission(e){return x(this,void 0,void 0,function*(){if((yield this.getRole())==="GM")return!0;const{permissions:o}=yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS",{});return o.indexOf(e)>-1})}getConnectionId(){return x(this,void 0,void 0,function*(){const{connectionId:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_CONNECTION_ID",{});return e})}onChange(e){const i=o=>{e(o.player)};return this.messageBus.send("OBR_PLAYER_SUBSCRIBE",{}),this.messageBus.on("OBR_PLAYER_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_PLAYER_UNSUBSCRIBE",{}),this.messageBus.off("OBR_PLAYER_EVENT_CHANGE",i)}}}var P=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class st{constructor(e){this.messageBus=e}reset(){return P(this,void 0,void 0,function*(){const{transform:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_RESET",{});return e})}animateTo(e){return P(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO",{transform:e})})}animateToBounds(e){return P(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO_BOUNDS",{bounds:e})})}getPosition(){return P(this,void 0,void 0,function*(){const{position:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_POSITION",{});return e})}setPosition(e){return P(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_POSITION",{position:e})})}getScale(){return P(this,void 0,void 0,function*(){const{scale:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_SCALE",{});return e})}setScale(e){return P(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_SCALE",{scale:e})})}getWidth(){return P(this,void 0,void 0,function*(){const{width:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_WIDTH",{});return e})}getHeight(){return P(this,void 0,void 0,function*(){const{height:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_HEIGHT",{});return e})}transformPoint(e){return P(this,void 0,void 0,function*(){const{point:i}=yield this.messageBus.sendAsync("OBR_VIEWPORT_TRANSFORM_POINT",{point:e});return i})}inverseTransformPoint(e){return P(this,void 0,void 0,function*(){const{point:i}=yield this.messageBus.sendAsync("OBR_VIEWPORT_INVERSE_TRANSFORM_POINT",{point:e});return i})}}function nt(t){return typeof t.id=="string"}var ae={exports:{}},Me;function at(){if(Me)return ae.exports;Me=1;var t=typeof Reflect=="object"?Reflect:null,e=t&&typeof t.apply=="function"?t.apply:function(u,f,m){return Function.prototype.apply.call(u,f,m)},i;t&&typeof t.ownKeys=="function"?i=t.ownKeys:Object.getOwnPropertySymbols?i=function(u){return Object.getOwnPropertyNames(u).concat(Object.getOwnPropertySymbols(u))}:i=function(u){return Object.getOwnPropertyNames(u)};function o(l){console&&console.warn&&console.warn(l)}var n=Number.isNaN||function(u){return u!==u};function s(){s.init.call(this)}ae.exports=s,ae.exports.once=E,s.EventEmitter=s,s.prototype._events=void 0,s.prototype._eventsCount=0,s.prototype._maxListeners=void 0;var r=10;function h(l){if(typeof l!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof l)}Object.defineProperty(s,"defaultMaxListeners",{enumerable:!0,get:function(){return r},set:function(l){if(typeof l!="number"||l<0||n(l))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+l+".");r=l}}),s.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},s.prototype.setMaxListeners=function(u){if(typeof u!="number"||u<0||n(u))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+u+".");return this._maxListeners=u,this};function p(l){return l._maxListeners===void 0?s.defaultMaxListeners:l._maxListeners}s.prototype.getMaxListeners=function(){return p(this)},s.prototype.emit=function(u){for(var f=[],m=1;m<arguments.length;m++)f.push(arguments[m]);var g=u==="error",w=this._events;if(w!==void 0)g=g&&w.error===void 0;else if(!g)return!1;if(g){var _;if(f.length>0&&(_=f[0]),_ instanceof Error)throw _;var M=new Error("Unhandled error."+(_?" ("+_.message+")":""));throw M.context=_,M}var Q=w[u];if(Q===void 0)return!1;if(typeof Q=="function")e(Q,this,f);else for(var De=Q.length,it=b(Q,De),m=0;m<De;++m)e(it[m],this,f);return!0};function d(l,u,f,m){var g,w,_;if(h(f),w=l._events,w===void 0?(w=l._events=Object.create(null),l._eventsCount=0):(w.newListener!==void 0&&(l.emit("newListener",u,f.listener?f.listener:f),w=l._events),_=w[u]),_===void 0)_=w[u]=f,++l._eventsCount;else if(typeof _=="function"?_=w[u]=m?[f,_]:[_,f]:m?_.unshift(f):_.push(f),g=p(l),g>0&&_.length>g&&!_.warned){_.warned=!0;var M=new Error("Possible EventEmitter memory leak detected. "+_.length+" "+String(u)+" listeners added. Use emitter.setMaxListeners() to increase limit");M.name="MaxListenersExceededWarning",M.emitter=l,M.type=u,M.count=_.length,o(M)}return l}s.prototype.addListener=function(u,f){return d(this,u,f,!1)},s.prototype.on=s.prototype.addListener,s.prototype.prependListener=function(u,f){return d(this,u,f,!0)};function a(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function c(l,u,f){var m={fired:!1,wrapFn:void 0,target:l,type:u,listener:f},g=a.bind(m);return g.listener=f,m.wrapFn=g,g}s.prototype.once=function(u,f){return h(f),this.on(u,c(this,u,f)),this},s.prototype.prependOnceListener=function(u,f){return h(f),this.prependListener(u,c(this,u,f)),this},s.prototype.removeListener=function(u,f){var m,g,w,_,M;if(h(f),g=this._events,g===void 0)return this;if(m=g[u],m===void 0)return this;if(m===f||m.listener===f)--this._eventsCount===0?this._events=Object.create(null):(delete g[u],g.removeListener&&this.emit("removeListener",u,m.listener||f));else if(typeof m!="function"){for(w=-1,_=m.length-1;_>=0;_--)if(m[_]===f||m[_].listener===f){M=m[_].listener,w=_;break}if(w<0)return this;w===0?m.shift():T(m,w),m.length===1&&(g[u]=m[0]),g.removeListener!==void 0&&this.emit("removeListener",u,M||f)}return this},s.prototype.off=s.prototype.removeListener,s.prototype.removeAllListeners=function(u){var f,m,g;if(m=this._events,m===void 0)return this;if(m.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):m[u]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete m[u]),this;if(arguments.length===0){var w=Object.keys(m),_;for(g=0;g<w.length;++g)_=w[g],_!=="removeListener"&&this.removeAllListeners(_);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(f=m[u],typeof f=="function")this.removeListener(u,f);else if(f!==void 0)for(g=f.length-1;g>=0;g--)this.removeListener(u,f[g]);return this};function y(l,u,f){var m=l._events;if(m===void 0)return[];var g=m[u];return g===void 0?[]:typeof g=="function"?f?[g.listener||g]:[g]:f?S(g):b(g,g.length)}s.prototype.listeners=function(u){return y(this,u,!0)},s.prototype.rawListeners=function(u){return y(this,u,!1)},s.listenerCount=function(l,u){return typeof l.listenerCount=="function"?l.listenerCount(u):A.call(l,u)},s.prototype.listenerCount=A;function A(l){var u=this._events;if(u!==void 0){var f=u[l];if(typeof f=="function")return 1;if(f!==void 0)return f.length}return 0}s.prototype.eventNames=function(){return this._eventsCount>0?i(this._events):[]};function b(l,u){for(var f=new Array(u),m=0;m<u;++m)f[m]=l[m];return f}function T(l,u){for(;u+1<l.length;u++)l[u]=l[u+1];l.pop()}function S(l){for(var u=new Array(l.length),f=0;f<u.length;++f)u[f]=l[f].listener||l[f];return u}function E(l,u){return new Promise(function(f,m){function g(_){l.removeListener(u,w),m(_)}function w(){typeof l.removeListener=="function"&&l.removeListener("error",g),f([].slice.call(arguments))}v(l,u,w,{once:!0}),u!=="error"&&O(l,g,{once:!0})})}function O(l,u,f){typeof l.on=="function"&&v(l,"error",u,f)}function v(l,u,f,m){if(typeof l.on=="function")m.once?l.once(u,f):l.on(u,f);else if(typeof l.addEventListener=="function")l.addEventListener(u,function g(w){m.once&&l.removeEventListener(u,g),f(w)});else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof l)}return ae.exports}var rt=at();let re;const lt=new Uint8Array(16);function dt(){if(!re&&(re=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!re))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return re(lt)}const I=[];for(let t=0;t<256;++t)I.push((t+256).toString(16).slice(1));function ct(t,e=0){return I[t[e+0]]+I[t[e+1]]+I[t[e+2]]+I[t[e+3]]+"-"+I[t[e+4]]+I[t[e+5]]+"-"+I[t[e+6]]+I[t[e+7]]+"-"+I[t[e+8]]+I[t[e+9]]+"-"+I[t[e+10]]+I[t[e+11]]+I[t[e+12]]+I[t[e+13]]+I[t[e+14]]+I[t[e+15]]}const ut=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),Pe={randomUUID:ut};function qe(t,e,i){if(Pe.randomUUID&&!t)return Pe.randomUUID();t=t||{};const o=t.random||(t.rng||dt)();return o[6]=o[6]&15|64,o[8]=o[8]&63|128,ct(o)}class ht extends rt.EventEmitter{constructor(e,i){super(),this.ready=!1,this.userId=null,this.ref=null,this.handleMessage=o=>{const n=o.data;if(o.origin===this.targetOrigin&&nt(n)){if(n.id==="OBR_READY"){this.ready=!0;const s=n.data;this.ref=s.ref,this.userId=s.userId}this.emit(n.id,n.data)}},this.send=(o,n,s)=>{var r;if(!this.ref)throw Error("Unable to send message: not ready");(r=window.parent)===null||r===void 0||r.postMessage({id:o,data:n,ref:this.ref,nonce:s},this.targetOrigin)},this.sendAsync=(o,n,s=5e3)=>{const r=`_${qe()}`;return this.send(o,n,r),Promise.race([new Promise((h,p)=>{const d=this;function a(y){d.off(`${o}_RESPONSE${r}`,a),d.off(`${o}_ERROR${r}`,c),h(y)}function c(y){d.off(`${o}_RESPONSE${r}`,a),d.off(`${o}_ERROR${r}`,c),p(y)}this.on(`${o}_RESPONSE${r}`,a),this.on(`${o}_ERROR${r}`,c)}),...s>0?[new Promise((h,p)=>window.setTimeout(()=>p(new Error(`Message ${o} took longer than ${s}ms to get a result`)),s))]:[]])},this.roomId=i,this.targetOrigin=e,window.addEventListener("message",this.handleMessage),this.setMaxListeners(100)}destroy(){window.removeEventListener("message",this.handleMessage)}}var Ue=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class ft{constructor(e){this.messageBus=e}show(e,i){return Ue(this,void 0,void 0,function*(){const{id:o}=yield this.messageBus.sendAsync("OBR_NOTIFICATION_SHOW",{message:e,variant:i});return o})}close(e){return Ue(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_NOTIFICATION_CLOSE",{id:e})})}}var q=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class pt{constructor(e){this.messageBus=e}getColor(){return q(this,void 0,void 0,function*(){const{color:e}=yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_COLOR",{});return e})}setColor(e){return q(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_COLOR",{color:e})})}getStrokeWidth(){return q(this,void 0,void 0,function*(){const{strokeWidth:e}=yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_STROKE_WIDTH",{});return e})}setStrokeWidth(e){return q(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_STROKE_WIDTH",{strokeWidth:e})})}getFilled(){return q(this,void 0,void 0,function*(){const{filled:e}=yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_FILLED",{});return e})}setFilled(e){return q(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_FILLED",{filled:e})})}onChange(e){const i=o=>{e(o.fog)};return this.messageBus.send("OBR_SCENE_FOG_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_FOG_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_SCENE_FOG_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_FOG_EVENT_CHANGE",i)}}}var R=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class mt{constructor(e){this.messageBus=e}getDpi(){return R(this,void 0,void 0,function*(){const{dpi:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DPI",{});return e})}getScale(){return R(this,void 0,void 0,function*(){return yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_SCALE",{})})}setScale(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_SCALE",{scale:e})})}getColor(){return R(this,void 0,void 0,function*(){const{color:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_COLOR",{});return e})}setColor(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_COLOR",{color:e})})}getOpacity(){return R(this,void 0,void 0,function*(){const{opacity:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_OPACITY",{});return e})}setOpacity(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_OPACITY",{opacity:e})})}getType(){return R(this,void 0,void 0,function*(){const{type:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_TYPE",{});return e})}setType(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_TYPE",{type:e})})}getLineType(){return R(this,void 0,void 0,function*(){const{lineType:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_LINE_TYPE",{});return e})}setLineType(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_LINE_TYPE",{lineType:e})})}getMeasurement(){return R(this,void 0,void 0,function*(){const{measurement:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_MEASUREMENT",{});return e})}setMeasurement(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_MEASUREMENT",{measurement:e})})}getLineWidth(){return R(this,void 0,void 0,function*(){const{lineWidth:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_LINE_WIDTH",{});return e})}setLineWidth(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_LINE_WIDTH",{lineWidth:e})})}snapPosition(e,i,o,n){return R(this,void 0,void 0,function*(){const{position:s}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_SNAP_POSITION",{position:e,snappingSensitivity:i,useCorners:o,useCenter:n});return s})}getDistance(e,i){return R(this,void 0,void 0,function*(){const{distance:o}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DISTANCE",{from:e,to:i});return o})}onChange(e){const i=o=>{e(o.grid)};return this.messageBus.send("OBR_SCENE_GRID_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_GRID_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_SCENE_GRID_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_GRID_EVENT_CHANGE",i)}}}var le=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class gt{constructor(e){this.messageBus=e}undo(){return le(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_UNDO",{})})}redo(){return le(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_REDO",{})})}canUndo(){return le(this,void 0,void 0,function*(){const{canUndo:e}=yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_UNDO",{});return e})}canRedo(){return le(this,void 0,void 0,function*(){const{canRedo:e}=yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_REDO",{});return e})}}var Be=Symbol.for("immer-nothing"),J=Symbol.for("immer-draftable"),L=Symbol.for("immer-state");function C(t,...e){throw new Error(`[Immer] minified error nr: ${t}. Full error at: https://bit.ly/3cXEKWf`)}var H=Object.getPrototypeOf;function z(t){return!!t&&!!t[L]}function G(t){return t?Ke(t)||Array.isArray(t)||!!t[J]||!!t.constructor?.[J]||X(t)||ne(t):!1}var yt=Object.prototype.constructor.toString();function Ke(t){if(!t||typeof t!="object")return!1;const e=H(t);if(e===null)return!0;const i=Object.hasOwnProperty.call(e,"constructor")&&e.constructor;return i===Object?!0:typeof i=="function"&&Function.toString.call(i)===yt}function te(t,e){Y(t)===0?Reflect.ownKeys(t).forEach(i=>{e(i,t[i],t)}):t.forEach((i,o)=>e(o,i,t))}function Y(t){const e=t[L];return e?e.type_:Array.isArray(t)?1:X(t)?2:ne(t)?3:0}function ie(t,e){return Y(t)===2?t.has(e):Object.prototype.hasOwnProperty.call(t,e)}function me(t,e){return Y(t)===2?t.get(e):t[e]}function $e(t,e,i){const o=Y(t);o===2?t.set(e,i):o===3?t.add(i):t[e]=i}function vt(t,e){return t===e?t!==0||1/t===1/e:t!==t&&e!==e}function X(t){return t instanceof Map}function ne(t){return t instanceof Set}function F(t){return t.copy_||t.base_}function be(t,e){if(X(t))return new Map(t);if(ne(t))return new Set(t);if(Array.isArray(t))return Array.prototype.slice.call(t);const i=Ke(t);if(e===!0||e==="class_only"&&!i){const o=Object.getOwnPropertyDescriptors(t);delete o[L];let n=Reflect.ownKeys(o);for(let s=0;s<n.length;s++){const r=n[s],h=o[r];h.writable===!1&&(h.writable=!0,h.configurable=!0),(h.get||h.set)&&(o[r]={configurable:!0,writable:!0,enumerable:h.enumerable,value:t[r]})}return Object.create(H(t),o)}else{const o=H(t);if(o!==null&&i)return{...t};const n=Object.create(o);return Object.assign(n,t)}}function Re(t,e=!1){return pe(t)||z(t)||!G(t)||(Y(t)>1&&Object.defineProperties(t,{set:{value:de},add:{value:de},clear:{value:de},delete:{value:de}}),Object.freeze(t),e&&Object.values(t).forEach(i=>Re(i,!0))),t}function de(){C(2)}function pe(t){return Object.isFrozen(t)}var Ee={};function j(t){const e=Ee[t];return e||C(0,t),e}function _t(t,e){Ee[t]||(Ee[t]=e)}var oe;function Ze(){return oe}function bt(t,e){return{drafts_:[],parent_:t,immer_:e,canAutoFreeze_:!0,unfinalizedDrafts_:0}}function Ge(t,e){e&&(j("Patches"),t.patches_=[],t.inversePatches_=[],t.patchListener_=e)}function we(t){Te(t),t.drafts_.forEach(Et),t.drafts_=null}function Te(t){t===oe&&(oe=t.parent_)}function Ve(t){return oe=bt(oe,t)}function Et(t){const e=t[L];e.type_===0||e.type_===1?e.revoke_():e.revoked_=!0}function Fe(t,e){e.unfinalizedDrafts_=e.drafts_.length;const i=e.drafts_[0];return t!==void 0&&t!==i?(i[L].modified_&&(we(e),C(4)),G(t)&&(t=he(e,t),e.parent_||fe(e,t)),e.patches_&&j("Patches").generateReplacementPatches_(i[L].base_,t,e.patches_,e.inversePatches_)):t=he(e,i,[]),we(e),e.patches_&&e.patchListener_(e.patches_,e.inversePatches_),t!==Be?t:void 0}function he(t,e,i){if(pe(e))return e;const o=e[L];if(!o)return te(e,(n,s)=>We(t,o,e,n,s,i)),e;if(o.scope_!==t)return e;if(!o.modified_)return fe(t,o.base_,!0),o.base_;if(!o.finalized_){o.finalized_=!0,o.scope_.unfinalizedDrafts_--;const n=o.copy_;let s=n,r=!1;o.type_===3&&(s=new Set(n),n.clear(),r=!0),te(s,(h,p)=>We(t,o,n,h,p,i,r)),fe(t,n,!1),i&&t.patches_&&j("Patches").generatePatches_(o,i,t.patches_,t.inversePatches_)}return o.copy_}function We(t,e,i,o,n,s,r){if(z(n)){const h=s&&e&&e.type_!==3&&!ie(e.assigned_,o)?s.concat(o):void 0,p=he(t,n,h);if($e(i,o,p),z(p))t.canAutoFreeze_=!1;else return}else r&&i.add(n);if(G(n)&&!pe(n)){if(!t.immer_.autoFreeze_&&t.unfinalizedDrafts_<1)return;he(t,n),(!e||!e.scope_.parent_)&&typeof o!="symbol"&&(X(i)?i.has(o):Object.prototype.propertyIsEnumerable.call(i,o))&&fe(t,n)}}function fe(t,e,i=!1){!t.parent_&&t.immer_.autoFreeze_&&t.canAutoFreeze_&&Re(e,i)}function wt(t,e){const i=Array.isArray(t),o={type_:i?1:0,scope_:e?e.scope_:Ze(),modified_:!1,finalized_:!1,assigned_:{},parent_:e,base_:t,draft_:null,copy_:null,revoke_:null,isManual_:!1};let n=o,s=Ie;i&&(n=[o],s=se);const{revoke:r,proxy:h}=Proxy.revocable(n,s);return o.draft_=h,o.revoke_=r,h}var Ie={get(t,e){if(e===L)return t;const i=F(t);if(!ie(i,e))return Tt(t,i,e);const o=i[e];return t.finalized_||!G(o)?o:o===ge(t.base_,e)?(ye(t),t.copy_[e]=Ae(o,t)):o},has(t,e){return e in F(t)},ownKeys(t){return Reflect.ownKeys(F(t))},set(t,e,i){const o=Xe(F(t),e);if(o?.set)return o.set.call(t.draft_,i),!0;if(!t.modified_){const n=ge(F(t),e),s=n?.[L];if(s&&s.base_===i)return t.copy_[e]=i,t.assigned_[e]=!1,!0;if(vt(i,n)&&(i!==void 0||ie(t.base_,e)))return!0;ye(t),Oe(t)}return t.copy_[e]===i&&(i!==void 0||e in t.copy_)||Number.isNaN(i)&&Number.isNaN(t.copy_[e])||(t.copy_[e]=i,t.assigned_[e]=!0),!0},deleteProperty(t,e){return ge(t.base_,e)!==void 0||e in t.base_?(t.assigned_[e]=!1,ye(t),Oe(t)):delete t.assigned_[e],t.copy_&&delete t.copy_[e],!0},getOwnPropertyDescriptor(t,e){const i=F(t),o=Reflect.getOwnPropertyDescriptor(i,e);return o&&{writable:!0,configurable:t.type_!==1||e!=="length",enumerable:o.enumerable,value:i[e]}},defineProperty(){C(11)},getPrototypeOf(t){return H(t.base_)},setPrototypeOf(){C(12)}},se={};te(Ie,(t,e)=>{se[t]=function(){return arguments[0]=arguments[0][0],e.apply(this,arguments)}});se.deleteProperty=function(t,e){return se.set.call(this,t,e,void 0)};se.set=function(t,e,i){return Ie.set.call(this,t[0],e,i,t[0])};function ge(t,e){const i=t[L];return(i?F(i):t)[e]}function Tt(t,e,i){const o=Xe(e,i);return o?"value"in o?o.value:o.get?.call(t.draft_):void 0}function Xe(t,e){if(!(e in t))return;let i=H(t);for(;i;){const o=Object.getOwnPropertyDescriptor(i,e);if(o)return o;i=H(i)}}function Oe(t){t.modified_||(t.modified_=!0,t.parent_&&Oe(t.parent_))}function ye(t){t.copy_||(t.copy_=be(t.base_,t.scope_.immer_.useStrictShallowCopy_))}var Ot=class{constructor(t){this.autoFreeze_=!0,this.useStrictShallowCopy_=!1,this.produce=(e,i,o)=>{if(typeof e=="function"&&typeof i!="function"){const s=i;i=e;const r=this;return function(p=s,...d){return r.produce(p,a=>i.call(this,a,...d))}}typeof i!="function"&&C(6),o!==void 0&&typeof o!="function"&&C(7);let n;if(G(e)){const s=Ve(this),r=Ae(e,void 0);let h=!0;try{n=i(r),h=!1}finally{h?we(s):Te(s)}return Ge(s,o),Fe(n,s)}else if(!e||typeof e!="object"){if(n=i(e),n===void 0&&(n=e),n===Be&&(n=void 0),this.autoFreeze_&&Re(n,!0),o){const s=[],r=[];j("Patches").generateReplacementPatches_(e,n,s,r),o(s,r)}return n}else C(1,e)},this.produceWithPatches=(e,i)=>{if(typeof e=="function")return(r,...h)=>this.produceWithPatches(r,p=>e(p,...h));let o,n;return[this.produce(e,i,(r,h)=>{o=r,n=h}),o,n]},typeof t?.autoFreeze=="boolean"&&this.setAutoFreeze(t.autoFreeze),typeof t?.useStrictShallowCopy=="boolean"&&this.setUseStrictShallowCopy(t.useStrictShallowCopy)}createDraft(t){G(t)||C(8),z(t)&&(t=At(t));const e=Ve(this),i=Ae(t,void 0);return i[L].isManual_=!0,Te(e),i}finishDraft(t,e){const i=t&&t[L];(!i||!i.isManual_)&&C(9);const{scope_:o}=i;return Ge(o,e),Fe(void 0,o)}setAutoFreeze(t){this.autoFreeze_=t}setUseStrictShallowCopy(t){this.useStrictShallowCopy_=t}applyPatches(t,e){let i;for(i=e.length-1;i>=0;i--){const n=e[i];if(n.path.length===0&&n.op==="replace"){t=n.value;break}}i>-1&&(e=e.slice(i+1));const o=j("Patches").applyPatches_;return z(t)?o(t,e):this.produce(t,n=>o(n,e))}};function Ae(t,e){const i=X(t)?j("MapSet").proxyMap_(t,e):ne(t)?j("MapSet").proxySet_(t,e):wt(t,e);return(e?e.scope_:Ze()).drafts_.push(i),i}function At(t){return z(t)||C(10,t),Qe(t)}function Qe(t){if(!G(t)||pe(t))return t;const e=t[L];let i;if(e){if(!e.modified_)return e.base_;e.finalized_=!0,i=be(t,e.scope_.immer_.useStrictShallowCopy_)}else i=be(t,!0);return te(i,(o,n)=>{$e(i,o,Qe(n))}),e&&(e.finalized_=!1),i}function Ce(){const e="replace",o="remove";function n(y,A,b,T){switch(y.type_){case 0:case 2:return r(y,A,b,T);case 1:return s(y,A,b,T);case 3:return h(y,A,b,T)}}function s(y,A,b,T){let{base_:S,assigned_:E}=y,O=y.copy_;O.length<S.length&&([S,O]=[O,S],[b,T]=[T,b]);for(let v=0;v<S.length;v++)if(E[v]&&O[v]!==S[v]){const l=A.concat([v]);b.push({op:e,path:l,value:c(O[v])}),T.push({op:e,path:l,value:c(S[v])})}for(let v=S.length;v<O.length;v++){const l=A.concat([v]);b.push({op:"add",path:l,value:c(O[v])})}for(let v=O.length-1;S.length<=v;--v){const l=A.concat([v]);T.push({op:o,path:l})}}function r(y,A,b,T){const{base_:S,copy_:E}=y;te(y.assigned_,(O,v)=>{const l=me(S,O),u=me(E,O),f=v?ie(S,O)?e:"add":o;if(l===u&&f===e)return;const m=A.concat(O);b.push(f===o?{op:f,path:m}:{op:f,path:m,value:u}),T.push(f==="add"?{op:o,path:m}:f===o?{op:"add",path:m,value:c(l)}:{op:e,path:m,value:c(l)})})}function h(y,A,b,T){let{base_:S,copy_:E}=y,O=0;S.forEach(v=>{if(!E.has(v)){const l=A.concat([O]);b.push({op:o,path:l,value:v}),T.unshift({op:"add",path:l,value:v})}O++}),O=0,E.forEach(v=>{if(!S.has(v)){const l=A.concat([O]);b.push({op:"add",path:l,value:v}),T.unshift({op:o,path:l,value:v})}O++})}function p(y,A,b,T){b.push({op:e,path:[],value:A===Be?void 0:A}),T.push({op:e,path:[],value:y})}function d(y,A){return A.forEach(b=>{const{path:T,op:S}=b;let E=y;for(let u=0;u<T.length-1;u++){const f=Y(E);let m=T[u];typeof m!="string"&&typeof m!="number"&&(m=""+m),(f===0||f===1)&&(m==="__proto__"||m==="constructor")&&C(19),typeof E=="function"&&m==="prototype"&&C(19),E=me(E,m),typeof E!="object"&&C(18,T.join("/"))}const O=Y(E),v=a(b.value),l=T[T.length-1];switch(S){case e:switch(O){case 2:return E.set(l,v);case 3:C(16);default:return E[l]=v}case"add":switch(O){case 1:return l==="-"?E.push(v):E.splice(l,0,v);case 2:return E.set(l,v);case 3:return E.add(v);default:return E[l]=v}case o:switch(O){case 1:return E.splice(l,1);case 2:return E.delete(l);case 3:return E.delete(b.value);default:return delete E[l]}default:C(17,S)}}),y}function a(y){if(!G(y))return y;if(Array.isArray(y))return y.map(a);if(X(y))return new Map(Array.from(y.entries()).map(([b,T])=>[b,a(T)]));if(ne(y))return new Set(Array.from(y).map(a));const A=Object.create(H(y));for(const b in y)A[b]=a(y[b]);return ie(y,J)&&(A[J]=y[J]),A}function c(y){return z(y)?a(y):y}_t("Patches",{applyPatches_:d,generatePatches_:n,generateReplacementPatches_:p})}var ke=new Ot;ke.produce;var xe=ke.produceWithPatches.bind(ke),K=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};Ce();class kt{constructor(e){this.messageBus=e}getItems(e){return K(this,void 0,void 0,function*(){if(Array.isArray(e)){const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEMS",{ids:e});return i}else if(e){const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS",{});return i.filter(e)}else{const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS",{});return i}})}isItemArray(e){return Array.isArray(e)&&e.every(i=>typeof i!="string")}updateItems(e,i){return K(this,void 0,void 0,function*(){let o;this.isItemArray(e)?o=e:o=yield this.getItems(e);const[n,s]=xe(o,i),r=n.map(p=>({id:p.id,type:p.type}));for(const p of s){const[d,a]=p.path;typeof d=="number"&&typeof a=="string"&&(r[d][a]=n[d][a])}const h=r.filter(p=>Object.keys(p).length>2);h.length!==0&&(yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_UPDATE_ITEMS",{updates:h}))})}addItems(e){return K(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_ADD_ITEMS",{items:e})})}deleteItems(e){return K(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_DELETE_ITEMS",{ids:e})})}getItemAttachments(e){return K(this,void 0,void 0,function*(){const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_ATTACHMENTS",{ids:e});return i})}getItemBounds(e){return K(this,void 0,void 0,function*(){const{bounds:i}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_BOUNDS",{ids:e});return i})}onChange(e){const i=o=>{e(o.items)};return this.messageBus.send("OBR_SCENE_ITEMS_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_ITEMS_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_SCENE_ITEMS_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_ITEMS_EVENT_CHANGE",i)}}}var $=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};Ce();class St{constructor(e){this.messageBus=e}getItems(e){return $(this,void 0,void 0,function*(){if(Array.isArray(e)){const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEMS",{ids:e});return i}else if(e){const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS",{});return i.filter(e)}else{const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS",{});return i}})}isItemArray(e){return Array.isArray(e)&&e.every(i=>typeof i!="string")}updateItems(e,i,o){return $(this,void 0,void 0,function*(){let n;this.isItemArray(e)?n=e:n=yield this.getItems(e);const[s,r]=xe(n,i),h=s.map(d=>({id:d.id,type:d.type}));for(const d of r){const[a,c]=d.path;typeof a=="number"&&typeof c=="string"&&(h[a][c]=s[a][c])}const p=h.filter(d=>Object.keys(d).length>2);p.length!==0&&(yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_UPDATE_ITEMS",{updates:p,fastUpdate:o}))})}addItems(e){return $(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_ADD_ITEMS",{items:e})})}deleteItems(e){return $(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_DELETE_ITEMS",{ids:e})})}getItemAttachments(e){return $(this,void 0,void 0,function*(){const{items:i}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_ATTACHMENTS",{ids:e});return i})}getItemBounds(e){return $(this,void 0,void 0,function*(){const{bounds:i}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_BOUNDS",{ids:e});return i})}onChange(e){const i=o=>{e(o.items)};return this.messageBus.send("OBR_SCENE_LOCAL_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_LOCAL_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_SCENE_LOCAL_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_LOCAL_EVENT_CHANGE",i)}}}var ve=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Bt{constructor(e){this.messageBus=e,this.grid=new mt(e),this.fog=new pt(e),this.history=new gt(e),this.items=new kt(e),this.local=new St(e)}isReady(){return ve(this,void 0,void 0,function*(){const{ready:e}=yield this.messageBus.sendAsync("OBR_SCENE_IS_READY",{});return e})}onReadyChange(e){const i=o=>{e(o.ready)};return this.messageBus.send("OBR_SCENE_READY_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_EVENT_READY_CHANGE",i),()=>{this.messageBus.send("OBR_SCENE_READY_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_EVENT_READY_CHANGE",i)}}getMetadata(){return ve(this,void 0,void 0,function*(){const{metadata:e}=yield this.messageBus.sendAsync("OBR_SCENE_GET_METADATA",{});return e})}setMetadata(e){return ve(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_SET_METADATA",{update:e})})}onMetadataChange(e){const i=o=>{e(o.metadata)};return this.messageBus.send("OBR_SCENE_METADATA_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_METADATA_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_SCENE_METADATA_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_METADATA_EVENT_CHANGE",i)}}}function Je(t){return t.startsWith("http")?t:`${window.location.origin}${t}`}function ee(t){return t.map(e=>Object.assign(Object.assign({},e),{icon:Je(e.icon)}))}function Ne(t){return Object.assign(Object.assign({},t),{url:Je(t.url)})}var He=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Rt{constructor(e){this.contextMenus={},this.handleClick=i=>{var o;const n=this.contextMenus[i.id];n&&((o=n.onClick)===null||o===void 0||o.call(n,i.context,i.elementId))},this.messageBus=e,e.on("OBR_CONTEXT_MENU_EVENT_CLICK",this.handleClick)}create(e){return He(this,void 0,void 0,function*(){this.messageBus.sendAsync("OBR_CONTEXT_MENU_CREATE",{id:e.id,shortcut:e.shortcut,icons:ee(e.icons),embed:e.embed&&Ne(e.embed)}),this.contextMenus[e.id]=e})}remove(e){return He(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_CONTEXT_MENU_REMOVE",{id:e}),delete this.contextMenus[e]})}}var D=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class It{constructor(e){this.tools={},this.toolActions={},this.toolModes={},this.handleToolClick=i=>{const o=this.tools[i.id];if(o)if(o.onClick){const n=o.onClick(i.context,i.elementId);Promise.resolve(n).then(s=>{s&&this.messageBus.send("OBR_TOOL_ACTIVATE",{id:i.id})})}else this.messageBus.send("OBR_TOOL_ACTIVATE",{id:i.id})},this.handleToolActionClick=i=>{var o;const n=this.toolActions[i.id];n&&((o=n.onClick)===null||o===void 0||o.call(n,i.context,i.elementId))},this.handleToolModeClick=i=>{const o=this.toolModes[i.id];if(o)if(o.onClick){const n=o.onClick(i.context,i.elementId);Promise.resolve(n).then(s=>{s&&this.messageBus.send("OBR_TOOL_MODE_ACTIVATE",{toolId:i.context.activeTool,modeId:i.id})})}else this.messageBus.send("OBR_TOOL_MODE_ACTIVATE",{toolId:i.context.activeTool,modeId:i.id})},this.handleToolModeToolClick=i=>{const o=this.toolModes[i.id];if(o)if(o.onToolClick){const n=o.onToolClick(i.context,i.event);Promise.resolve(n).then(s=>{s&&i.event.target&&!i.event.target.locked&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[i.event.target.id]})})}else i.event.target&&!i.event.target.locked&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[i.event.target.id]})},this.handleToolModeToolDoubleClick=i=>{const o=this.toolModes[i.id];if(o)if(o.onToolDoubleClick){const n=o.onToolDoubleClick(i.context,i.event);Promise.resolve(n).then(s=>{s&&i.event.target&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[i.event.target.id]})})}else i.event.target&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[i.event.target.id]})},this.handleToolModeToolDown=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onToolDown)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeToolMove=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onToolMove)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeToolUp=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onToolUp)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeToolDragStart=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onToolDragStart)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeToolDragMove=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onToolDragMove)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeToolDragEnd=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onToolDragEnd)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeToolDragCancel=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onToolDragCancel)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeKeyDown=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onKeyDown)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeKeyUp=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onKeyUp)===null||o===void 0||o.call(n,i.context,i.event))},this.handleToolModeActivate=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onActivate)===null||o===void 0||o.call(n,i.context))},this.handleToolModeDeactivate=i=>{var o;const n=this.toolModes[i.id];n&&((o=n.onDeactivate)===null||o===void 0||o.call(n,i.context))},this.messageBus=e,e.on("OBR_TOOL_EVENT_CLICK",this.handleToolClick),e.on("OBR_TOOL_ACTION_EVENT_CLICK",this.handleToolActionClick),e.on("OBR_TOOL_MODE_EVENT_CLICK",this.handleToolModeClick),e.on("OBR_TOOL_MODE_EVENT_TOOL_CLICK",this.handleToolModeToolClick),e.on("OBR_TOOL_MODE_EVENT_TOOL_DOUBLE_CLICK",this.handleToolModeToolDoubleClick),e.on("OBR_TOOL_MODE_EVENT_TOOL_DOWN",this.handleToolModeToolDown),e.on("OBR_TOOL_MODE_EVENT_TOOL_MOVE",this.handleToolModeToolMove),e.on("OBR_TOOL_MODE_EVENT_TOOL_UP",this.handleToolModeToolUp),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_START",this.handleToolModeToolDragStart),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_MOVE",this.handleToolModeToolDragMove),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_END",this.handleToolModeToolDragEnd),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_CANCEL",this.handleToolModeToolDragCancel),e.on("OBR_TOOL_MODE_EVENT_KEY_DOWN",this.handleToolModeKeyDown),e.on("OBR_TOOL_MODE_EVENT_KEY_UP",this.handleToolModeKeyUp),e.on("OBR_TOOL_MODE_EVENT_ACTIVATE",this.handleToolModeActivate),e.on("OBR_TOOL_MODE_EVENT_DEACTIVATE",this.handleToolModeDeactivate)}create(e){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_CREATE",{id:e.id,shortcut:e.shortcut,defaultMode:e.defaultMode,defaultMetadata:e.defaultMetadata,icons:ee(e.icons),disabled:e.disabled}),this.tools[e.id]=e})}remove(e){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_REMOVE",{id:e}),delete this.tools[e]})}activateTool(e){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_ACTIVATE",{id:e})})}getActiveTool(){return D(this,void 0,void 0,function*(){const{id:e}=yield this.messageBus.sendAsync("OBR_TOOL_GET_ACTIVE",{});return e})}onToolChange(e){const i=o=>{e(o.id)};return this.messageBus.send("OBR_TOOL_ACTIVE_SUBSCRIBE",{}),this.messageBus.on("OBR_TOOL_ACTIVE_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_TOOL_ACTIVE_UNSUBSCRIBE",{}),this.messageBus.off("OBR_TOOL_ACTIVE_EVENT_CHANGE",i)}}getMetadata(e){return D(this,void 0,void 0,function*(){const{metadata:i}=yield this.messageBus.sendAsync("OBR_TOOL_GET_METADATA",{id:e});return i})}setMetadata(e,i){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_SET_METADATA",{toolId:e,update:i})})}createAction(e){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_ACTION_CREATE",{id:e.id,shortcut:e.shortcut,icons:ee(e.icons),disabled:e.disabled}),this.toolActions[e.id]=e})}removeAction(e){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_ACTION_REMOVE",{id:e}),delete this.tools[e]})}createMode(e){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_MODE_CREATE",{id:e.id,shortcut:e.shortcut,icons:ee(e.icons),preventDrag:e.preventDrag,disabled:e.disabled,cursors:e.cursors}),this.toolModes[e.id]=e})}removeMode(e){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_MODE_REMOVE",{id:e}),delete this.tools[e]})}activateMode(e,i){return D(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_MODE_ACTIVATE",{toolId:e,modeId:i})})}getActiveToolMode(){return D(this,void 0,void 0,function*(){const{id:e}=yield this.messageBus.sendAsync("OBR_TOOL_MODE_GET_ACTIVE",{});return e})}onToolModeChange(e){const i=o=>{e(o.id)};return this.messageBus.send("OBR_TOOL_MODE_ACTIVE_SUBSCRIBE",{}),this.messageBus.on("OBR_TOOL_MODE_ACTIVE_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_TOOL_MODE_ACTIVE_UNSUBSCRIBE",{}),this.messageBus.off("OBR_TOOL_MODE_ACTIVE_EVENT_CHANGE",i)}}}var Z=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Ct{constructor(e){this.messageBus=e}open(e){return Z(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_OPEN",Object.assign({},Ne(e)))})}close(e){return Z(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_CLOSE",{id:e})})}getWidth(e){return Z(this,void 0,void 0,function*(){const{width:i}=yield this.messageBus.sendAsync("OBR_POPOVER_GET_WIDTH",{id:e});return i})}setWidth(e,i){return Z(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_SET_WIDTH",{id:e,width:i})})}getHeight(e){return Z(this,void 0,void 0,function*(){const{height:i}=yield this.messageBus.sendAsync("OBR_POPOVER_GET_HEIGHT",{id:e});return i})}setHeight(e,i){return Z(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_SET_HEIGHT",{id:e,height:i})})}}var ze=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class xt{constructor(e){this.messageBus=e}open(e){return ze(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_MODAL_OPEN",Object.assign({},Ne(e)))})}close(e){return ze(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_MODAL_CLOSE",{id:e})})}}var N=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Nt{constructor(e){this.messageBus=e}getWidth(){return N(this,void 0,void 0,function*(){const{width:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_WIDTH",{});return e})}setWidth(e){return N(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_WIDTH",{width:e})})}getHeight(){return N(this,void 0,void 0,function*(){const{height:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_HEIGHT",{});return e})}setHeight(e){return N(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_HEIGHT",{height:e})})}getBadgeText(){return N(this,void 0,void 0,function*(){const{badgeText:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_TEXT",{});return e})}setBadgeText(e){return N(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_TEXT",{badgeText:e})})}getBadgeBackgroundColor(){return N(this,void 0,void 0,function*(){const{badgeBackgroundColor:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_BACKGROUND_COLOR",{});return e})}setBadgeBackgroundColor(e){return N(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_BACKGROUND_COLOR",{badgeBackgroundColor:e})})}getIcon(){return N(this,void 0,void 0,function*(){const{icon:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_ICON",{});return e})}setIcon(e){return N(this,void 0,void 0,function*(){const i=ee([{icon:e}]);yield this.messageBus.sendAsync("OBR_ACTION_SET_ICON",{icon:i[0].icon})})}getTitle(){return N(this,void 0,void 0,function*(){const{title:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_TITLE",{});return e})}setTitle(e){return N(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_TITLE",{title:e})})}isOpen(){return N(this,void 0,void 0,function*(){const{isOpen:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_IS_OPEN",{});return e})}open(){return N(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_OPEN",{})})}close(){return N(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_CLOSE",{})})}onOpenChange(e){const i=o=>{e(o.isOpen)};return this.messageBus.send("OBR_ACTION_IS_OPEN_SUBSCRIBE",{}),this.messageBus.on("OBR_ACTION_IS_OPEN_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_IS_OPEN_ACTION_UNSUBSCRIBE",{}),this.messageBus.off("OBR_ACTION_IS_OPEN_EVENT_CHANGE",i)}}}var Lt=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};Ce();class Dt{constructor(e){this.messageBus=e}startItemInteraction(e){return Lt(this,void 0,void 0,function*(){const{id:i}=yield this.messageBus.sendAsync("OBR_INTERACTION_START_ITEM_INTERACTION",{baseState:e});let o=e;return[r=>{const[h,p]=xe(o,r);return o=h,this.messageBus.send("OBR_INTERACTION_UPDATE_ITEM_INTERACTION",{id:i,patches:p}),h},()=>{this.messageBus.send("OBR_INTERACTION_STOP_ITEM_INTERACTION",{id:i})}]})}}var Mt=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Pt{constructor(e){this.messageBus=e}getPlayers(){return Mt(this,void 0,void 0,function*(){const{players:e}=yield this.messageBus.sendAsync("OBR_PARTY_GET_PLAYERS",{});return e})}onChange(e){const i=o=>{e(o.players)};return this.messageBus.send("OBR_PARTY_SUBSCRIBE",{}),this.messageBus.on("OBR_PARTY_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_PARTY_UNSUBSCRIBE",{}),this.messageBus.off("OBR_PARTY_EVENT_CHANGE",i)}}}var _e=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Ut{constructor(e){this.messageBus=e}get id(){return this.messageBus.roomId}getPermissions(){return _e(this,void 0,void 0,function*(){const{permissions:e}=yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS",{});return e})}getMetadata(){return _e(this,void 0,void 0,function*(){const{metadata:e}=yield this.messageBus.sendAsync("OBR_ROOM_GET_METADATA",{});return e})}setMetadata(e){return _e(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ROOM_SET_METADATA",{update:e})})}onMetadataChange(e){const i=o=>{e(o.metadata)};return this.messageBus.send("OBR_ROOM_METADATA_SUBSCRIBE",{}),this.messageBus.on("OBR_ROOM_METADATA_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_METADATA_ROOM_UNSUBSCRIBE",{}),this.messageBus.off("OBR_ROOM_METADATA_EVENT_CHANGE",i)}}onPermissionsChange(e){const i=o=>{e(o.permissions)};return this.messageBus.send("OBR_ROOM_PERMISSIONS_SUBSCRIBE",{}),this.messageBus.on("OBR_ROOM_PERMISSIONS_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_PERMISSIONS_ROOM_UNSUBSCRIBE",{}),this.messageBus.off("OBR_ROOM_PERMISSIONS_EVENT_CHANGE",i)}}}var Gt=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Vt{constructor(e){this.messageBus=e}getTheme(){return Gt(this,void 0,void 0,function*(){const{theme:e}=yield this.messageBus.sendAsync("OBR_THEME_GET_THEME",{});return e})}onChange(e){const i=o=>{e(o.theme)};return this.messageBus.send("OBR_THEME_SUBSCRIBE",{}),this.messageBus.on("OBR_THEME_EVENT_CHANGE",i),()=>{this.messageBus.send("OBR_THEME_UNSUBSCRIBE",{}),this.messageBus.off("OBR_THEME_EVENT_CHANGE",i)}}}var ce=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Ft{constructor(e){this.messageBus=e}uploadImages(e,i){return ce(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ASSETS_UPLOAD_IMAGES",{images:e,typeHint:i})})}uploadScenes(e,i){return ce(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ASSETS_UPLOAD_SCENES",{scenes:e,disableShowScenes:i})})}downloadImages(e,i,o){return ce(this,void 0,void 0,function*(){const{images:n}=yield this.messageBus.sendAsync("OBR_ASSETS_DOWNLOAD_IMAGES",{multiple:e,defaultSearch:i,typeHint:o},-1);return n})}downloadScenes(e,i){return ce(this,void 0,void 0,function*(){const{scenes:o}=yield this.messageBus.sendAsync("OBR_ASSETS_DOWNLOAD_SCENES",{multiple:e,defaultSearch:i},-1);return o})}}var Wt=function(t,e,i,o){function n(s){return s instanceof i?s:new i(function(r){r(s)})}return new(i||(i=Promise))(function(s,r){function h(a){try{d(o.next(a))}catch(c){r(c)}}function p(a){try{d(o.throw(a))}catch(c){r(c)}}function d(a){a.done?s(a.value):n(a.value).then(h,p)}d((o=o.apply(t,e||[])).next())})};class Ht{constructor(e){this.messageBus=e}sendMessage(e,i,o){return Wt(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_BROADCAST_SEND_MESSAGE",{channel:e,data:i,options:o})})}onMessage(e,i){return this.messageBus.send("OBR_BROADCAST_SUBSCRIBE",{channel:e}),this.messageBus.on(`OBR_BROADCAST_MESSAGE_${e}`,i),()=>{this.messageBus.send("OBR_BROADCAST_UNSUBSCRIBE",{channel:e}),this.messageBus.off(`OBR_BROADCAST_MESSAGE_${e}`,i)}}}class V{constructor(e){this._item={createdUserId:e.id,id:qe(),name:"Item",zIndex:Date.now(),lastModified:new Date().toISOString(),lastModifiedUserId:e.id,locked:!1,metadata:{},position:{x:0,y:0},rotation:0,scale:{x:1,y:1},type:"ITEM",visible:!0,layer:"POPOVER"}}createdUserId(e){return this._item.createdUserId=e,this.self()}id(e){return this._item.id=e,this.self()}name(e){return this._item.name=e,this.self()}description(e){return this._item.description=e,this.self()}lastModified(e){return this._item.lastModified=e,this.self()}zIndex(e){return this._item.zIndex=e,this.self()}lastModifiedUserId(e){return this._item.lastModifiedUserId=e,this.self()}locked(e){return this._item.locked=e,this.self()}metadata(e){return this._item.metadata=e,this.self()}position(e){return this._item.position=e,this.self()}rotation(e){return this._item.rotation=e,this.self()}scale(e){return this._item.scale=e,this.self()}visible(e){return this._item.visible=e,this.self()}attachedTo(e){return this._item.attachedTo=e,this.self()}layer(e){return this._item.layer=e,this.self()}disableHit(e){return this._item.disableHit=e,this.self()}disableAutoZIndex(e){return this._item.disableAutoZIndex=e,this.self()}disableAttachmentBehavior(e){return this._item.disableAttachmentBehavior=e,this.self()}self(){return this}}class zt extends V{constructor(e){super(e),this._points=[],this._style={fillColor:"black",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:5,strokeDash:[],tension:.5},this._item.name="Curve",this._item.layer="DRAWING"}points(e){return this._points=e,this.self()}style(e){return this._style=e,this.self()}fillColor(e){return this._style.fillColor=e,this.self()}fillOpacity(e){return this._style.fillOpacity=e,this.self()}strokeColor(e){return this._style.strokeColor=e,this.self()}strokeOpacity(e){return this._style.strokeOpacity=e,this.self()}strokeWidth(e){return this._style.strokeWidth=e,this.self()}strokeDash(e){return this._style.strokeDash=e,this.self()}tension(e){return this._style.tension=e,this.self()}closed(e){return this._style.closed=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"CURVE",points:this._points,style:this._style})}}class Yt extends V{constructor(e,i,o){super(e),this._image=i,this._grid=o,this._item.name="Image",this._text={richText:[{type:"paragraph",children:[{text:""}]}],plainText:"",style:{padding:8,fontFamily:"Roboto",fontSize:24,fontWeight:400,textAlign:"CENTER",textAlignVertical:"BOTTOM",fillColor:"white",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:0,lineHeight:1.5},type:"PLAIN",width:"AUTO",height:"AUTO"},this._textItemType="LABEL"}text(e){return this._text=e,this.self()}textItemType(e){return this._textItemType=e,this.self()}textWidth(e){return this._text.width=e,this.self()}textHeight(e){return this._text.height=e,this.self()}richText(e){return this._text.richText=e,this.self()}plainText(e){return this._text.plainText=e,this.self()}textType(e){return this._text.type=e,this.self()}textPadding(e){return this._text.style.padding=e,this.self()}fontFamily(e){return this._text.style.fontFamily=e,this.self()}fontSize(e){return this._text.style.fontSize=e,this.self()}fontWeight(e){return this._text.style.fontWeight=e,this.self()}textAlign(e){return this._text.style.textAlign=e,this.self()}textAlignVertical(e){return this._text.style.textAlignVertical=e,this.self()}textFillColor(e){return this._text.style.fillColor=e,this.self()}textFillOpacity(e){return this._text.style.fillOpacity=e,this.self()}textStrokeColor(e){return this._text.style.strokeColor=e,this.self()}textStrokeOpacity(e){return this._text.style.strokeOpacity=e,this.self()}textStrokeWidth(e){return this._text.style.strokeWidth=e,this.self()}textLineHeight(e){return this._text.style.lineHeight=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"IMAGE",image:this._image,grid:this._grid,text:this._text,textItemType:this._textItemType})}}class jt extends V{constructor(e){super(e),this._color="black",this._radius=20,this._item.layer="POINTER",this._item.name="Pointer"}color(e){return this._color=e,this.self()}radius(e){return this._radius=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"POINTER",color:this._color,radius:this._radius})}}class qt extends V{constructor(e){super(e),this._width=0,this._height=0,this._shapeType="RECTANGLE",this._style={fillColor:"black",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:5,strokeDash:[]},this._item.layer="DRAWING",this._item.name="Shape"}width(e){return this._width=e,this.self()}height(e){return this._height=e,this.self()}shapeType(e){return this._shapeType=e,this.self()}style(e){return this._style=e,this.self()}fillColor(e){return this._style.fillColor=e,this.self()}fillOpacity(e){return this._style.fillOpacity=e,this.self()}strokeColor(e){return this._style.strokeColor=e,this.self()}strokeOpacity(e){return this._style.strokeOpacity=e,this.self()}strokeWidth(e){return this._style.strokeWidth=e,this.self()}strokeDash(e){return this._style.strokeDash=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"SHAPE",width:this._width,height:this._height,shapeType:this._shapeType,style:this._style})}}class Kt extends V{constructor(e){super(e),this._commands=[],this._fillRule="nonzero",this._style={fillColor:"black",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:5,strokeDash:[]},this._item.name="Path",this._item.layer="DRAWING"}commands(e){return this._commands=e,this.self()}fillRule(e){return this._fillRule=e,this.self()}style(e){return this._style=e,this.self()}fillColor(e){return this._style.fillColor=e,this.self()}fillOpacity(e){return this._style.fillOpacity=e,this.self()}strokeColor(e){return this._style.strokeColor=e,this.self()}strokeOpacity(e){return this._style.strokeOpacity=e,this.self()}strokeWidth(e){return this._style.strokeWidth=e,this.self()}strokeDash(e){return this._style.strokeDash=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"PATH",commands:this._commands,fillRule:this._fillRule,style:this._style})}}class $t{constructor(e){this._upload={file:e,grid:{dpi:150,offset:{x:0,y:0}},name:"",rotation:0,scale:{x:1,y:1},text:{richText:[{type:"paragraph",children:[{text:""}]}],plainText:"",style:{padding:8,fontFamily:"Roboto",fontSize:24,fontWeight:400,textAlign:"CENTER",textAlignVertical:"BOTTOM",fillColor:"white",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:0,lineHeight:1.5},type:"PLAIN",width:"AUTO",height:"AUTO"},locked:!1,textItemType:"LABEL",visible:!0}}grid(e){return this._upload.grid=e,this}dpi(e){return this._upload.grid.dpi=e,this}offset(e){return this._upload.grid.offset=e,this}name(e){return this._upload.name=e,this}description(e){return this._upload.description=e,this}rotation(e){return this._upload.rotation=e,this}scale(e){return this._upload.scale=e,this}locked(e){return this._upload.locked=e,this}visible(e){return this._upload.visible=e,this}text(e){return this._upload.text=e,this}textItemType(e){return this._upload.textItemType=e,this}textWidth(e){return this._upload.text.width=e,this}textHeight(e){return this._upload.text.height=e,this}richText(e){return this._upload.text.richText=e,this}plainText(e){return this._upload.text.plainText=e,this}textType(e){return this._upload.text.type=e,this}textPadding(e){return this._upload.text.style.padding=e,this}fontFamily(e){return this._upload.text.style.fontFamily=e,this}fontSize(e){return this._upload.text.style.fontSize=e,this}fontWeight(e){return this._upload.text.style.fontWeight=e,this}textAlign(e){return this._upload.text.style.textAlign=e,this}textAlignVertical(e){return this._upload.text.style.textAlignVertical=e,this}textFillColor(e){return this._upload.text.style.fillColor=e,this}textFillOpacity(e){return this._upload.text.style.fillOpacity=e,this}textStrokeColor(e){return this._upload.text.style.strokeColor=e,this}textStrokeOpacity(e){return this._upload.text.style.strokeOpacity=e,this}textStrokeWidth(e){return this._upload.text.style.strokeWidth=e,this}textLineHeight(e){return this._upload.text.style.lineHeight=e,this}build(){return this._upload}}class Zt{constructor(){this._upload={name:"New Scene",fog:{filled:!1,style:{color:"#222222",strokeWidth:5}},grid:{dpi:150,scale:"5ft",style:{lineColor:"LIGHT",lineOpacity:.4,lineType:"DASHED",lineWidth:2},measurement:"CHEBYSHEV",type:"SQUARE"},items:[]}}name(e){return this._upload.name=e,this}fogFilled(e){return this._upload.fog.filled=e,this}fogColor(e){return this._upload.fog.style.color=e,this}fogStrokeWidth(e){return this._upload.fog.style.strokeWidth=e,this}gridScale(e){return this._upload.grid.scale=e,this}gridColor(e){return this._upload.grid.style.lineColor=e,this}gridOpacity(e){return this._upload.grid.style.lineOpacity=e,this}gridLineType(e){return this._upload.grid.style.lineType=e,this}gridMeasurement(e){return this._upload.grid.measurement=e,this}gridType(e){return this._upload.grid.type=e,this}items(e){return this._upload.items=e,this}baseMap(e){return this._upload.baseMap=e,this}thumbnail(e){return this._upload.thumbnail=e,this}build(){return this._upload}}const Le=typeof Buffer=="function",Ye=typeof TextDecoder=="function"?new TextDecoder:void 0;typeof TextEncoder=="function"&&new TextEncoder;const Xt="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",Qt=Array.prototype.slice.call(Xt),ue=(t=>{let e={};return t.forEach((i,o)=>e[i]=o),e})(Qt),Jt=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/,W=String.fromCharCode.bind(String),je=typeof Uint8Array.from=="function"?Uint8Array.from.bind(Uint8Array):t=>new Uint8Array(Array.prototype.slice.call(t,0)),et=t=>t.replace(/[^A-Za-z0-9\+\/]/g,""),ei=/[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g,ti=t=>{switch(t.length){case 4:var e=(7&t.charCodeAt(0))<<18|(63&t.charCodeAt(1))<<12|(63&t.charCodeAt(2))<<6|63&t.charCodeAt(3),i=e-65536;return W((i>>>10)+55296)+W((i&1023)+56320);case 3:return W((15&t.charCodeAt(0))<<12|(63&t.charCodeAt(1))<<6|63&t.charCodeAt(2));default:return W((31&t.charCodeAt(0))<<6|63&t.charCodeAt(1))}},ii=t=>t.replace(ei,ti),oi=t=>{if(t=t.replace(/\s+/g,""),!Jt.test(t))throw new TypeError("malformed base64.");t+="==".slice(2-(t.length&3));let e,i,o,n=[];for(let s=0;s<t.length;)e=ue[t.charAt(s++)]<<18|ue[t.charAt(s++)]<<12|(i=ue[t.charAt(s++)])<<6|(o=ue[t.charAt(s++)]),i===64?n.push(W(e>>16&255)):o===64?n.push(W(e>>16&255,e>>8&255)):n.push(W(e>>16&255,e>>8&255,e&255));return n.join("")},tt=typeof atob=="function"?t=>atob(et(t)):Le?t=>Buffer.from(t,"base64").toString("binary"):oi,si=Le?t=>je(Buffer.from(t,"base64")):t=>je(tt(t).split("").map(e=>e.charCodeAt(0))),ni=Le?t=>Buffer.from(t,"base64").toString("utf8"):Ye?t=>Ye.decode(si(t)):t=>ii(tt(t)),ai=t=>et(t.replace(/[-_]/g,e=>e=="-"?"+":"/")),ri=t=>ni(ai(t));function li(){const e=new URLSearchParams(window.location.search).get("obrref");let i="",o="";if(e){const s=ri(e).split(" ");s.length===2&&(i=s[0],o=s[1])}return{origin:i,roomId:o}}class di extends V{constructor(e){super(e),this._item.name="Effect",this._width=0,this._height=0,this._sksl="",this._effectType="VIEWPORT",this._uniforms=[],this._blendMode="SRC_OVER"}width(e){return this._width=e,this.self()}height(e){return this._height=e,this.self()}sksl(e){return this._sksl=e,this.self()}effectType(e){return this._effectType=e,this.self()}uniforms(e){return this._uniforms=e,this.self()}blendMode(e){return this._blendMode=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"EFFECT",width:this._width,height:this._height,sksl:this._sksl,effectType:this._effectType,uniforms:this._uniforms,blendMode:this._blendMode})}}class ci extends V{constructor(e){super(e),this._sourceRadius=50,this._attenuationRadius=1800,this._falloff=1,this._innerAngle=360,this._outerAngle=360,this._lightType="PRIMARY",this._item.name="Light",this._item.layer="FOG",this._item.zIndex=0,this._item.disableAutoZIndex=!0}sourceRadius(e){return this._sourceRadius=e,this.self()}attenuationRadius(e){return this._attenuationRadius=e,this.self()}falloff(e){return this._falloff=e,this.self()}innerAngle(e){return this._innerAngle=e,this.self()}outerAngle(e){return this._outerAngle=e,this.self()}lightType(e){return this._lightType=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"LIGHT",sourceRadius:this._sourceRadius,attenuationRadius:this._attenuationRadius,falloff:this._falloff,innerAngle:this._innerAngle,outerAngle:this._outerAngle,lightType:this._lightType})}}class ui extends V{constructor(e){super(e),this._points=[],this._doubleSided=!0,this._blocking=!0,this._item.name="Wall",this._item.layer="FOG",this._item.zIndex=0,this._item.disableAutoZIndex=!0}points(e){return this._points=e,this.self()}doubleSided(e){return this._doubleSided=e,this.self()}blocking(e){return this._blocking=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"WALL",points:this._points,doubleSided:this._doubleSided,blocking:this._blocking})}}var k;(function(t){t[t.MOVE=0]="MOVE",t[t.LINE=1]="LINE",t[t.QUAD=2]="QUAD",t[t.CONIC=3]="CONIC",t[t.CUBIC=4]="CUBIC",t[t.CLOSE=5]="CLOSE"})(k||(k={}));const Se=li(),B=new ht(Se.origin,Se.roomId),hi=new st(B),U=new ot(B),fi=new Pt(B),pi=new ft(B),mi=new Bt(B),gi=new Rt(B),yi=new It(B),vi=new Ct(B),_i=new xt(B),bi=new Nt(B),Ei=new Dt(B),wi=new Ut(B),Ti=new Vt(B),Oi=new Ft(B),Ai=new Ht(B),Bi={onReady:t=>{B.ready?t():B.once("OBR_READY",()=>t())},get isReady(){return B.ready},viewport:hi,player:U,party:fi,notification:pi,scene:mi,contextMenu:gi,tool:yi,popover:vi,modal:_i,action:bi,interaction:Ei,room:wi,theme:Ti,assets:Oi,broadcast:Ai,isAvailable:!!Se.origin};function Ri(){return new zt(U)}function Ii(){return new di(U)}function Ci(t,e){return new Yt(U,t,e)}function xi(){return new ci(U)}function Ni(){return new jt(U)}function Li(){return new qt(U)}function Di(){return new Kt(U)}function Mi(){return new ui(U)}function Pi(t){return new $t(t)}function Ui(){return new Zt}var ki=(t=>(t[t.MOVE=0]="MOVE",t[t.LINE=1]="LINE",t[t.QUAD=2]="QUAD",t[t.CONIC=3]="CONIC",t[t.CUBIC=4]="CUBIC",t[t.CLOSE=5]="CLOSE",t))(ki||{}),Si=(t=>(t.North="NORTH",t.Northeast="NORTHEAST",t.East="EAST",t.Southeast="SOUTHEAST",t.South="SOUTH",t.Southwest="SOUTHWEST",t.West="WEST",t.Northwest="NORTHWEST",t))(Si||{});class Gi{static DELAY=500;static SHORTDELAY=300;static EXTENSIONID="com.battle-system.smoke";static EXTENSIONNOTICE="com.battle-system.smoke-notice";static PROGRESSBAR="com.battle-system.smoke-progress";static RESETID="com.battle-system.smoke-reset";static SPECTREID="com.battle-system.spectre";static EXTENSIONWHATSNEW="com.battle-system.smoke-whatsnew";static LINETOOLID="com.battle-system.linetool";static POLYTOOLID="com.battle-system.polytool";static ELEVATIONTOOLID="com.battle-system.elevationtool";static ELEVATIONWARNID="com.battle-system.elevationwarn";static BRUSHTOOLID="com.battle-system.brushtool";static PROCESSEDID="com.battle-system.processing";static CONTEXTID="com.battle-system.smoke-context";static GRIDID="d9953ba1-f417-431c-8a39-3c3376e3caf0";static SPECTREBROADCASTID="SPECTREBROADCAST";static WARNINGCASTID="SMOKEWARNINGCAST";static RESETPERSISTID="RESETPERSISTID";static DEFAULTLINECOLOR="#000000";static DEFAULTLINEWIDTH=8;static DEFAULTLINESTROKE=[];static LINELAYER="POINTER";static DOORCOLOR="#4000ff";static WINDOWCOLOR="#ADD8E6";static ATTENUATIONDEFAULT="30";static SOURCEDEFAULT="0";static FALLOFFDEFAULT="0";static DARKVISIONDEFAULT="0";static INANGLEDEFAULT="360";static OUTANGLEDEFAULT="360";static CHECKREGISTRATION="https://vrwtdtmnbyhaehtitrlb.supabase.co/functions/v1/patreon-check";static ANONAUTH="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";static DOOROPEN="https://battle-system.com/owlbear/smoke-docs/opendoor.svg";static DOORCLOSED="https://battle-system.com/owlbear/smoke-docs/closeddoor.svg";static DOORLOCKED="https://battle-system.com/owlbear/smoke-docs/lockeddoor.svg";static TRAILINGCOLLAR=[[k.MOVE,250,250],[k.LINE,250,220],[k.LINE,320,220],[k.LINE,320,280],[k.LINE,280,280],[k.LINE,280,200],[k.LINE,220,200],[k.LINE,220,300],[k.LINE,380,280],[k.LINE,380,230],[k.LINE,380,180],[k.CLOSE],[k.MOVE,250,270],[k.CUBIC,300,270,350,260,350,250],[k.CUBIC,350,240,300,230,250,230],[k.CUBIC,200,230,150,240,150,250],[k.CUBIC,150,260,200,270,250,270],[k.CLOSE]];static FOGGYSTYLE="FOGGY";static SPOOKYSTYLE="SPOOKY";static DRIPSTYLE="DRIP";static COSMICSTYLE="COSMIC";static WEIRDSTYLE="WEIRD";static FLESHSTYLE="FLESH";static WATERSTYLE="WATER";static ENHANCEDFOGSTYLES=new Map([["0","Map Fog"],["100","Flat Fog"]]);static ENHANCEDFOGEFECTS=[{key:"NONE",value:"None"},{key:this.DRIPSTYLE,value:"Drip"},{key:this.COSMICSTYLE,value:"Cosmic"},{key:this.FLESHSTYLE,value:"Flesh"},{key:this.FOGGYSTYLE,value:"Foggy"},{key:this.SPOOKYSTYLE,value:"Spooky"},{key:this.WATERSTYLE,value:"Water"},{key:this.WEIRDSTYLE,value:"Weird"}];static WATERSHADER=`
        uniform vec2 size;
        uniform float time;
        const int ITER_GEOMETRY = 3;
        const int ITER_FRAGMENT = 5;
        const float SEA_HEIGHT = 0.6;
        const float SEA_CHOPPY = 4.0;
        const float SEA_SPEED = 0.8;
        const float SEA_FREQ = 0.16;
        const vec3 SEA_BASE = vec3(0.1, 0.19, 0.22);
        const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
        const mat2 octave_m = mat2(1.6, 1.2, -1.2, 1.6);
        const int NUM_STEPS = 8;
        const float PI	 	= 3.141592;
        const float EPSILON	= 1e-3;

        float hash(vec2 p)
        {
            float h = dot(p, vec2(127.1, 311.7));	
            return fract(sin(h) * 43758.5453123);
        }

        float noise(in vec2 p)
        {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y); // No need for normalized -1 to 1 here.
        }

        float diffuse(vec3 n, vec3 l, float p)
        {
            return pow(dot(n, l) * 0.4 + 0.6, p);
        }

        float specular(vec3 n, vec3 l, vec3 e, float s)
        {
            float nrm = (s + 8.0) / (PI * 8.0);
            return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
        }

        float sea_octave(vec2 uv, float choppy)
        {
            uv += noise(uv);        
            vec2 wv = 1.0 - abs(sin(uv));
            vec2 swv = abs(cos(uv));    
            wv = mix(wv, swv, wv);
            return pow(1.0 - pow(wv.x * wv.y, 0.65), choppy);
        }

        float map(vec3 p)
        {
            float freq = SEA_FREQ; // => 0.16
            float amp = SEA_HEIGHT; // => 0.6
            float choppy = SEA_CHOPPY; // => 4.0
            
            // XZ plane.
            vec2 uv = p.xz;
            
            float d, h = 0.0;    
            
            // ITER_GEOMETRY => 3
            for (int i = 0; i < ITER_GEOMETRY; i++)
            {       
                d = sea_octave((uv + (1.0 + time * 0.8)) * freq, choppy);
                d += sea_octave((uv - (1.0 + time * 0.8)) * freq, choppy);
                h += d * amp;
                uv *= octave_m;
                freq *= 2.0;
                amp *= 0.2;
                choppy = mix(choppy, 1.0, 0.2);
            }
            
            return p.y - h;
        }

        float map_detailed(vec3 p)
        {
            float freq = SEA_FREQ;
            float amp = SEA_HEIGHT;
            float choppy = SEA_CHOPPY;
            
            vec2 uv = p.xz;
            
            float d, h = 0.0;
            
            // ITER_FRAGMENT = 5
            
            for (int i = 0; i < ITER_FRAGMENT; i++)
            {        
                d = sea_octave((uv + (1.0 + time * 0.8)) * freq, choppy);
                d += sea_octave((uv - (1.0 + time * 0.8)) * freq, choppy);
                h += d * amp;        
                uv *= octave_m;
                freq *= 2.0;
                amp *= 0.2;
                choppy = mix(choppy, 1.0, 0.2);
            }
            
            return p.y - h;
        }

        vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist)
        {
            float fresnel = clamp(1.0 - dot(n, -eye), 0.0, 1.0);
            fresnel = fresnel * fresnel * fresnel * 0.65;
                
            vec3 skyColor = vec3(0.0, 0.2, 0.5);    
            vec3 refracted = SEA_BASE + diffuse(n, l, 80.0) * SEA_WATER_COLOR * 0.12; 
            
            vec3 color = mix(refracted, skyColor, fresnel);
            
            float atten = max(1.0 - dot(dist, dist) * 0.001, 0.0);
            color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
            
            color += vec3(specular(n, l, eye,60.0));
            
            return color;
        }

        vec3 getNormal(vec3 p, float eps)
        {
            vec3 n;
            n.y = map_detailed(p);    
            n.x = map_detailed(vec3(p.x + eps, p.y, p.z)) - n.y;
            n.z = map_detailed(vec3(p.x, p.y, p.z + eps)) - n.y;
            n.y = eps;
            return normalize(n);
        }

        float heightMapTracing(vec3 ori, vec3 dir, out vec3 p)
        {
            float tm = 0.0;
            
            float tx = 1000.0;
            
            // Calculate 1000m far distance map.
            float hx = map(ori + dir * tx);
            
            // if hx over 0.0 is that ray on the sky. right?
            if(hx > 0.0)
            {
                p = vec3(0.0);
                return tx;   
            }
            
            float hm = map(ori + dir * tm);    
            float tmid = 0.0;
            
            // NUM_STEPS = 8
            for (int i = 0; i < NUM_STEPS; i++)
            {
                // Calculate weight for 'tm' and 'tx' mixing.
                float f = hm / (hm - hx);
                
                tmid = mix(tm, tx, f);                   
                p = ori + dir * tmid;
                
                float hmid = map(p);
                
                if (hmid < 0.0)
                {
                    tx = tmid;
                    hx = hmid;
                }
                else
                {
                    tm = tmid;
                    hm = hmid;
                }
            }
            
            return tmid;
        }

        half4 main(float2 fragCoord) 
        {
            vec2 uv = fragCoord.xy / size.xy;
            uv = uv * 2.0 - 1.0;
        
            const vec3 light = normalize(vec3(0.0, 1.0, 0.8)); 
            // Top-down view modifications
            vec3 ori = vec3(0.0, 10.0, 0.0);  // Camera high above the sea
            vec3 dir = normalize(vec3(uv.x, -1.0, uv.y));  // Remap UV to create top-down projection
            
            // tracing
            vec3 p;
            heightMapTracing(ori, dir, p);
            
            vec3 dist = p - ori;
            vec3 n = getNormal(p, dot(dist, dist) * (0.1 / size.x));
            
            // color
            vec3 sea = getSeaColor(p, n, light, dir, dist);
            
            return vec4(sea, 1.0);
        }
        `;static ANNIHILATIONSHADER=`
        uniform vec2 size;
        uniform float time;

        mat2 rot(float a) {
            float PI = 3.14159265359;
            return mat2(cos(a+PI*vec4(0,1.5,0.5,0)));
        }

        vec4 hash( in vec2 p ) {
            vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099));
            p4 += dot(p4, p4.wzxy+19.19);
            return fract((p4.xxyz+p4.yzzw)*p4.zywx);
        }

        // value noise
        vec4 noise( in vec2 p ) {
            p*=200.0;
            vec2 i = floor( p );
            vec2 f = fract( p );
            vec2 u = f*f*(3.0-2.0*f);
            return mix( mix( hash( i + vec2(0.0,0.0) ), 
                            hash( i + vec2(1.0,0.0) ), u.x),
                        mix( hash( i + vec2(0.0,1.0) ), 
                            hash( i + vec2(1.0,1.0) ), u.x), u.y);
        }

        // domain warped noise
        float liquid( in vec2 p ) {
            p += noise(vec2(0, time*0.0005)-(p*=rot(0.1)*vec2(2.5, 0.5))).rg*0.01;
            p += noise(vec2(0, time*0.0002)+(p*=rot(0.2)*2.5)).ba*0.01;
            p += noise(p*=6.5).rg*0.005;
            return noise(p*0.1).a;
        }

        // used for normal calculation
        float height( in vec3 p ) {
            return p.z-liquid(p.xy)*0.001;
        }

        // normal from central differences
        vec3 normal( in vec2 uv ) {
            const vec2 e = vec2(0.0, 0.0001);
            vec3 p = vec3(uv, 0);
            return normalize(vec3(height(p-e.yxx)-height(p+e.yxx),
                                height(p-e.xyx)-height(p+e.xyx),
                                height(p-e.xxy)-height(p+e.xxy)));
        }

        // custom cubemap
        vec3 cubemap( in vec3 dir ) {
            vec3 color = cos(dir*vec3(1, 9, 2)+vec3(2, 3, 1))*0.5+0.5;
            color = (color * vec3(0.8, 0.3, 0.7)) + vec3(0.2);
            color *= dir.y*0.5+0.5;
            color += exp(6.0*dir.y-2.0)*0.05;
            color = pow(color, vec3(1.0/2.2));
            return color;
        }
            
        half4 main(float2 coord) {
            half4 fragColor;

            vec2 uv = (coord-size.xy*0.5)/size.x;
            vec3 dir = normalize(vec3(uv, 0.2));
            
            vec3 norm = normal(uv*0.02);
            dir = reflect(dir, norm);
            
            dir.xz *= rot(time*0.5);
            dir.yz *= rot(sin(time*0.2)*0.3);
            
            fragColor.rgb = cubemap(dir);
            
            fragColor.rgb = clamp(fragColor.rgb, vec3(0), vec3(1));
            fragColor.rgb = mix(fragColor.rgb, vec3(0), dot(uv, uv)*1.0);
            
            fragColor.a = 0.5;

            return fragColor;
        }
    `;static FLESHSHADER=`
        uniform vec2 size; // Uniform variable for size
        uniform float time; // Uniform variable for time

        mat2 rotate2D(float r) {
            return mat2(cos(r), sin(r), -sin(r), cos(r)); // Rotation matrix
        }

        // Main function
        half4 main(vec2 coord) {
            half4 o = half4(0); // Initialize output color
            vec2 n, N, q, p = (coord.xy * 2.0 - size) / size.y; // Fragment coordinates adjusted
            float S = 5.0, a = 0.0, j = 0.0; // Initialize S, a, and j

            // Rotation matrix
            mat2 m = rotate2D(5.0);

            // Loop for calculations
            for (float j = 0.0; j < 30.0; j += 1.0) {
                S *= 1.2; // Scale S
                p *= m; // Apply rotation to p
                n *= m; // Apply rotation to n
                q = p * S + j + n + time + sin(time) * 0.8; // Update q
                a += dot(cos(q) / S, size / size); // Accumulate a
                n += q = sin(q); // Update n and set q to sin(q)
                N += q / (S + 60.0); // Update N
            }

            // Final adjustments to output color
            o += 0.1 - a * 0.1; // Adjust output color based on a
            o.r *= 5.0; // Enhance the red channel
            o += min(0.7, 0.001 / length(N)); // Add to output based on N
            o -= o * dot(p, p) * 0.7; // Modify output color based on p
            o.a = 0.95;
            return o; // Return final color
        }
        `;static WEIRDSHADER=`
        uniform vec2 size;
        uniform float time;

        mat2 rotate2D(float r) {
            return mat2(cos(r), sin(r), -sin(r), cos(r));
        }

        // Main function
        half4 main(vec2 coord) {
            half4 o = half4(0); // Initialize output color
            vec2 p = coord.xy / size.y; // Adjusted fragment coordinates
            vec2 n = vec2(0.0); // Initialize n
            vec2 q = vec2(0.0); // Initialize q
            vec2 N = vec2(0.0); // Declare and initialize N
            float S = 9.0; // Scaling factor
            float a = 0.0; // Initialize a
            float j = 0.0; // Initialize j

            // Rotation matrix
            mat2 m = rotate2D(5.0);

            // Loop for calculations
            for (float j = 0.0; j < 30.0; j += 1.0) {
                p *= m; // Apply rotation to p
                n *= m; // Apply rotation to n
                q = p * S + j + n + time; // Update q
                a += dot(cos(q) / S, size / size); // Accumulate a
                n += q = sin(q); // Update n and set q to sin(q)
                N += q / (S + 60.0); // Update N
                S *= 1.2; // Scale S
            }

            // Final adjustments to output color
            o += pow(max(o - o, (a + 0.5) * 0.055 * half4(6, 1, 2, 75) + 0.003 / length(N)), o - o + 0.45); 

            return o; // Return final color
        }
        `;static COSMICSHADER=`
        uniform vec2 size;
        uniform float time;
        const int iterations = 17;
        const float formuparam = 0.53;

        const int volsteps = 20;
        const float stepsize = 0.1;

        const float zoom  = 0.800;
        const float tile  = 0.850;
        const float speed = 0.010;

        const float brightness = 0.0015;
        const float darkmatter = 0.300;
        const float distfading = 0.730;
        const float saturation = 0.850;

        half4 main(float2 coord) {
            //get coords and direction
            vec2 uv=coord / size;
            uv.y*=size.y/size.x;
            vec3 dir=vec3(uv*zoom,1.);
            float time=time*speed+.25;
                    
            vec3 from = vec3(1.0, 0.5, 0.5);
            from += vec3(time * 2.0, time, -2.0);

            //volumetric rendering
            float s=0.1,fade=1.;
            vec3 v=vec3(0.);
            for (int r=0; r<volsteps; r++) {
                vec3 p=from+s*dir*.5;
                p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
                float pa,a=pa=0.;
                for (int i=0; i<iterations; i++) { 
                    p=abs(p)/dot(p,p)-formuparam; // the magic formula
                    a+=abs(length(p)-pa); // absolute sum of average change
                    pa=length(p);
                }
                float dm=max(0.,darkmatter-a*a*.001); //dark matter
                a*=a*a; // add contrast
                if (r>6) fade*=1.-dm; // dark matter, don't render near
                //v+=vec3(dm,dm*.5,0.);
                v+=fade;
                v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
                fade*=distfading; // distance fading
                s+=stepsize;
            }
            v=mix(vec3(length(v)),v,saturation); //color adjust
            return vec4(v*.01, 0.85);
        }`;static FOGGYSHADER=`
        uniform vec2 size;
        uniform float time;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 3.0;
            
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(st * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            
            return value;
        }

        half4 main(float2 coord) {
            vec2 p = coord / size;
            
            // Cloud effect
            float cloudNoise = fbm(p * 8.0 + time * 0.1);
            cloudNoise = smoothstep(0.3, 0.7, cloudNoise);
            
            // white clouds with transparency
            return half4(0.5, 0.5, 0.5, cloudNoise * 0.3);
        }
    `;static SPOOKYSHADER=`
        uniform vec2 size;
        uniform float time;

        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        float fbm(vec2 st) {
            float value = 0.0;
            float amplitude = 0.75;
            float frequency = 2.5;
            
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(st * frequency);
                frequency *= 1.8;
                amplitude *= 0.5;
            }
            
            return value;
        }

        half4 main(float2 coord) {
            vec2 p = coord / size;
            
            // Increased movement speed from 0.08 to 0.15
            float cloudNoise = fbm(p * 4 + time * 0.15);
            
            cloudNoise = smoothstep(0.08, 0.8, cloudNoise);
            
            // Same high base opacity with cloud variation
            float opacity = 0.44 + (cloudNoise * 0.5);
            
            // Darker cloud color (reduced from 0.03, 0.01, 0.05)
            return half4(0.01, 0.005, 0.02, opacity);
        }
    `;static TRAILINGFOGSHADER=`
        uniform vec3 darknessColor;
        uniform shader scene;
        uniform float darknessLevel;
        uniform mat3 modelView;

        half4 main(float2 coord) {
            vec2 uv = (vec3(coord, 1) * modelView).xy;
            half4 sceneColor = scene.eval(uv);

            // Create a dark overlay color
            vec3 overlayColor = darknessColor * darknessLevel;
            half4 darkColor = half4(overlayColor, darknessLevel);
            
            // Return the overlay color with the specified alpha
            return mix(sceneColor, darkColor, darkColor.a);
        }
    `;static TRAILINGFOGREVEALSHADER=`
        uniform shader scene;
        uniform vec2 size;
        uniform mat3 modelView;

        half4 main(float2 coord) {
            vec2 sceneCoord = (vec3(coord, 1) * modelView).xy;

            half4 sceneColor = scene.eval(sceneCoord);

            vec2 center = size * 0.5;
            float aspectRatioInv = size.y / size.x; // Precompute inverse of aspect ratio
            vec2 diff = coord - center;
            diff.x *= aspectRatioInv; // Avoid division by multiplying by the inverse
            float distSquared = dot(diff, diff); // Avoid sqrt by using squared distance

            float radiusSquared = (min(size.x, size.y) * 0.5) * (min(size.x, size.y) * 0.5);

            float mask = step(distSquared, radiusSquared);

            // Interpolate between scene color and black
            return mix(half4(0, 0, 0, 0), sceneColor, mask);
        }
    `;static DARKVISIONSHADER=`
        uniform vec2 size;
        uniform vec2 center;
        uniform float radius;
        uniform float clear;
        uniform float smoothwidth;

        half4 main(float2 coord) {
            vec2 normalizedCoord = coord / size;
            float dist = distance(normalizedCoord, center);
            
            float innerAlpha = smoothstep(clear, clear + smoothwidth, dist);
            
            float outerAlpha = 1.0 - step(radius, dist);
            
            float alpha = innerAlpha * outerAlpha;
            
            return half4(0.5, 0.5, 0.5, alpha);
        }
    `;static SMOKEMOBILEMAIN=`
    <div id="tabControls">
                    <div class="controlContainer">
                        <div class="even-set-button-container">
                            <button class="view-button selected" id="smokeViewToggle"><img class="menu_svg" src="./icon.svg"></button>
                            <button class="view-button" id="spectreViewToggle"><img class="menu_svg" src="./ghost.svg"></button>
                            <button class="view-button" id="helpViewToggle"><img class="menu_svg" src="./help.svg"></button>
                            <button class="view-button" id="settingsViewToggle"><img class="menu_svg" src="./settings.svg"></button>
                        </div>
                        <div id="patreonContainer"></div>
                    </div>
                </div>
                <div id="smokeViewPanel" class="panel"></div>
                <div id="spectreViewPanel" class="panel" style="display: none;"></div>
                <div id="settingsViewPanel" class="panel" style="display: none;"></div>
                <div id="helpViewPanel" class="panel" style="display: none;">
                    <div id="markdownHelpContainer"></div>
                </div>
    `;static SMOKEMOBILEHTML=`
    <div id="contextMenu" class="context-menu" style="display: none">
        Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div class="visionTitle grid-3">Vision Enabled<div id="tip_gmtokens" class="note">📝</div>
        <div id="visionPanelToggleContainer"></div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="token_list_div" class="grid-3" padding-bottom: 8px;">
            <table id="smokeUnitTablePrime" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup> 
                <thead>
                    <tr id="visionPanelMain">
                        <th>Name</th>
                        <th id="visionRangeHeader" class="clickable-header"><img id="visionRangeSvg" class="menu_svg" src="./visionRange.svg"></th>
                        <th id="visionFalloffHeader" class="clickable-header"><img id="visionFalloffSvg" class="menu_svg" src="./visionFalloff.svg"></th>
                        <th id="visionBlindHeader" class="clickable-header"><img class="menu_svg" src="./blind.svg"></th>
                        <th id="visionHideHeader" class="clickable-header"><img class="menu_svg" src="./eyeclosed.svg"></th>
                    </tr>
                    <tr id="visionPanelSub" style="display: none;">
                        <th>Name</th>
                        <th id="visionBumperHeader" class="clickable-header"><img id="visionBumperSvg" class="menu_svg" src="./visionBumper.svg"></th>
                        <th id="visionInAngleHeader" class="clickable-header"><img id="visionInnerSvg" class="menu_svg" src="./visionInner.svg"></th>
                        <th id="visionOutAngleHeader" class="clickable-header"><img id="visionOuterSvg" class="menu_svg" src="./visionOuter.svg"></th>
                        <th id="visionDarkHeader" class="clickable-header"><img id="visionDarkSvg" class="menu_svg" src="./darkvision.svg"></th>
                    </tr>
                </thead>
                <tbody id="token_list"></tbody>
            </table>
            <table id="smokeUnitTableSub" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup>
                <tbody id="hidden_list" style="display:none;">~ <input type="button" value="Tap to Show List" class="settingsButton" style="width: 60% !important;" id="hideListToggle"> ~</tbody>
            </table>
        </div>
    </div>
    `;static SMOKEMAIN=`
    <div id="tabControls">
                    <div class="controlContainer">
                        <div class="even-set-button-container">
                            <button class="view-button selected" id="smokeViewToggle">Smoke</button>
                            <button class="view-button" id="spectreViewToggle">Spectre</button>
                            <button class="view-button" id="helpViewToggle">Help</button>
                            <button class="view-button" id="settingsViewToggle">Settings</button>
                        </div>
                        <div id="patreonContainer"></div>
                    </div>
                </div>
                <div id="smokeViewPanel" class="panel"></div>
                <div id="spectreViewPanel" class="panel" style="display: none;"></div>
                <div id="settingsViewPanel" class="panel" style="display: none;"></div>
                <div id="helpViewPanel" class="panel" style="display: none;">
                    <div id="markdownHelpContainer"></div>
                </div>
    `;static SMOKEHTML=`
    <div id="contextMenu" class="context-menu" style="display: none">
        Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div class="visionTitle grid-3">Tokens with Vision Enabled<div id="tip_gmtokens" class="note">📝</div>
        <div id="visionPanelToggleContainer"></div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="token_list_div" class="grid-3" padding-bottom: 8px;">
            <table id="smokeUnitTablePrime" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup> 
                <thead>
                    <tr id="visionPanelMain">
                        <th>Name</th>
                        <th id="visionRangeHeader" class="clickable-header"><img id="visionRangeSvg" class="menu_svg" src="./visionRange.svg"></th>
                        <th id="visionFalloffHeader" class="clickable-header"><img id="visionFalloffSvg" class="menu_svg" src="./visionFalloff.svg"></th>
                        <th id="visionBlindHeader" class="clickable-header"><img class="menu_svg" src="./blind.svg"></th>
                        <th id="visionHideHeader" class="clickable-header"><img class="menu_svg" src="./eyeclosed.svg"></th>
                    </tr>
                    <tr id="visionPanelSub" style="display: none;">
                        <th>Name</th>
                        <th id="visionBumperHeader" class="clickable-header"><img id="visionBumperSvg" class="menu_svg" src="./visionBumper.svg"></th>
                        <th id="visionInAngleHeader" class="clickable-header"><img id="visionInnerSvg" class="menu_svg" src="./visionInner.svg"></th>
                        <th id="visionOutAngleHeader" class="clickable-header"><img id="visionOuterSvg" class="menu_svg" src="./visionOuter.svg"></th>
                        <th id="visionDarkHeader" class="clickable-header"><img id="visionDarkSvg" class="menu_svg" src="./darkvision.svg"></th>
                    </tr>
                </thead>
                <tbody id="token_list"></tbody>
            </table>
            <table id="smokeUnitTableSub" class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                    <col style="width: 15%;">
                </colgroup>
                <tbody id="hidden_list" style="display:none;">~ <input type="button" value="Out-of-Sight List: Click to Show" class="settingsButton" style="width: 60% !important;" id="hideListToggle"> ~</tbody>
            </table>
        </div>
    </div>
    `;static SPECTREHTML=`
    <div class="visionTitle grid-3">Tokens with Spectre Enabled
        <div id= "tip_spectretokens" class="note">📝</div>
    </div>
    <div id="main-ui" class="grid-main">
        <div id="ghostContainer" class="grid-3">
            <table style="margin: auto; padding: 0; width: 100%">
            <colgroup>
                <col style="width: 50%;">
                <col style="width: 25%;">
                <col style="width: 25%;">
            </colgroup>
            <tbody id="ghostList">
            </tbody></table>
            </div> 
        </div>
    </div>
    `;static SETTINGSHTML=`
    <div id="settings-ui">
        <table id="settingsTable">
            <colgroup>
                <col style="width: 30%;">
                <col style="width: 10%;">
                <col style="width: 10%;">
                <col style="width: 30%;">
                <col style="width: 10%;">
                <col style="width: 10%;">
            </colgroup>
            <tbody>
                <tr>
                    <td colspan="2"><label for="toggle_fogfill" id="tip_fogfill">FogFill</label></td>
                    <td><input type="checkbox" id="toggle_fogfill"></td>
                    <td colspan="2"><label for="disable_vision" id="tip_disablevision">Disable Vision</label></td>
                    <td><input type="checkbox" id="disable_vision"></td>
                </tr>
                <tr>
                    <td><label for="toggle_persistence" id="tip_persistence">Persistence</label></td>
                    <td><button id="reset_persistence"><img class="setting_svg" src="./reset.svg"></button></td>
                    <td><input type="checkbox" id="toggle_persistence"></td>
                    <td colspan="2"><label for="toggle_trailingfog" id="tip_trailingfog">Trailing Fog (Beta)</label></td>
                    <td><input type="checkbox" id="toggle_trailingfog"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="toggle_ownerlines" id="tip_ownerrings">Owner Highlight</label></td>
                    <td><input type="checkbox" id="toggle_ownerlines"></td>
                    <td colspan="2"><label for="toggle_autohide" id="tip_autohide">Autohide (Beta)</label></td>
                    <td><input type="checkbox" id="toggle_autohide"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="toggle_unitcontextmenu" id="tip_unitcontextmenu">Show Unit Menu</label></td>
                    <td><input type="checkbox" id="toggle_unitcontextmenu"></td>
                    <td colspan="2"><label for="toggle_wallcontextmenu" id="tip_wallcontextmenu">Show Wall Menu</label></td>
                    <td><input type="checkbox" id="toggle_wallcontextmenu"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="toggle_gmwalls" id="tip_gmwalls">Wall Pass (GM)</label></td>
                    <td><input type="checkbox" id="toggle_gmwalls"></td>
                    <td colspan="2"><label for="snap_checkbox" id="tip_gridsnap">Grid Snap</label></td>
                    <td><input type="checkbox" id="snap_checkbox"></td>
                </tr>
                <tr>
                    <td><label for="toggle_defaultelevation" id="tip_defaultelevation">Default Elevation</label></td>
                    <td colspan="2"><select name="elevationDefault" id="default_elevation_select">
                        <option value="-10">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                    </td>
                    <td><label for="toggle_elevationstyle" id="tip_elevationstyle">Elevation Style</label></td>
                    <td colspan="2"><select name="elevationStyle" id="elevation_style_select">
                        <option value="false">Mesa</option>
                        <option value="true">City</option>
                    </select>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><label for="door_checkbox" id="tip_playerdoors">Players See Doors</label></td>
                    <td><input type="checkbox" id="door_checkbox"></td>
                    <td colspan="2"><label for="warnings_checkbox" id="tip_hardwarewarnings">HW Warnings</label></td>
                    <td><input type="checkbox" id="warnings_checkbox"></td>
                </tr>
                <tr>
                    <td colspan="3"><select class="settingsButton" id="preview_select"></select></td>
                    <td colspan="3"><input class="settingsButton" type="button" id="doublewall_button" value="Double-Side Walls"></td>
                </tr>
                <tr>
                    <td colspan="3"><input class="settingsButton" type="button" id="block_button" value="Block Walls"></td>
                    <td colspan="3"><input class="settingsButton" type="button" id="unblock_button" value="Unblock Walls"></td>
                </tr>
                <tr>
                    <td colspan="3"><input class="settingsButton" type="button" id="lock_button" value="Lock Lines"></td>
                    <td colspan="3"><input class="settingsButton" type="button" id="unlock_button" value="Unlock Lines"></td>
                </tr>
                <tr>
                    <td colspan="6" style="text-align: center; font-weight: bold;">Tool Options</td>
                </tr>
                <tr>
                    <td colspan="6">
                        <div id="toolOptions">
                            Width: <input id="tool_width" type="number" value="8" style="width: 40px;" maxlength="2">
                             - Color: <input id="tool_color" type="text" maxlength="7">
                             - Style: <select id="tool_style">
                                <option value="solid" selected>Solid</option>
                                <option value="dotted">Dotted</option>
                            </select>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="6" style="text-align: center; font-weight: bold;">Vision Defaults</td>
                </tr>
                <tr>
                    <td colspan="2"><label for="visionDefaultInput" id="tip_visionDefault">Vision</label></td>
                    <td><input type="number" id="visionDefaultInput"></td>
                    <td colspan="2"><label for="collisionDefaultInput" id="tip_collisionDefault">Collision</label></td>
                    <td><input type="number" id="collisionDefaultInput"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="falloffDefaultInput" id="tip_falloffDefault">Falloff</label></td>
                    <td><input type="number" id="falloffDefaultInput"></td>
                    <td colspan="2"><label for="greyscaleDefaultInput" id="tip_greyscaleDefault">Greyscale</label></td>
                    <td><input type="number" id="greyscaleDefaultInput"></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="innerAngleDefaultInput" id="tip_innerAngleDefault">Inner-Angle</label></td>
                    <td><input type="number" id="innerAngleDefaultInput"></td>
                    <td colspan="2"><label for="outerAngleDefaultInput" id="tip_outerAngleDefault">Outer-Angle</label></td>
                    <td><input type="number" id="outerAngleDefaultInput"></td>
                </tr>
            </tbody>
        </table>

        <table id="importTable">
            <colgroup>
                <col style="width: 35%;">
                <col style="width: 15%;">
                <col style="width: 35%;">
                <col style="width: 15%;">
            </colgroup>
            <tbody>
                <tr>
                    <td colspan="4" class="tableHeader">Import</td>
                </tr>
                <tr>
                    <td colspan="4">Import files from <a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a></br>and other tools.</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="custom-file-input">
                            <label for="import_file" id="import_file_name">Choose File...</label>
                            <input id="import_file" type="file" accept=".dd2vtt, .ddvtt, .uvtt, .fvtt, .json">
                        </div>
                    </td>
                    <td colspan="2"><input type="button" id="import_button" value="Import" disabled></td>
                </tr>
                <tr>
                    <td colspan="2" >Format</br><select id="import_format"><option value="scene">UVTT/DDVTT Scene</option><option value="foundry">Foundry JSON</option><option value="uvtt">Universal VTT</option></select></td>
                    <td colspan="2">Alignment</br><select id="map_align"><option selected>Loading..</option></select></td>
                </tr>
                <tr>
                    <td colspan="2"><label for="dpi_autodetect" id="tip_importdpi">DPI Autodetect</label></td>
                    <td colspan="2">
                        <input type="checkbox" id="dpi_autodetect" checked>
                        <input id="import_dpi" disabled type="text" value="150" maxlength="4">
                    </td>
                </tr>
            </tbody>
            <div id="import_errors" class="grid-3"></div>
        </table>
    </div>`;static SETTINGSMOBILEHTML=`
<div id="settings-ui">
    <div class="grid-container">
        <div>
            <label for="toggle_fogfill" id="tip_fogfill">FogFill</label>
            <input type="checkbox" id="toggle_fogfill">
        </div>
        <div>
            <label for="disable_vision" id="tip_disablevision">Disable Vision</label>
            <input type="checkbox" id="disable_vision">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="snap_checkbox" id="tip_gridsnap">Grid Snap</label>
            <input type="checkbox" id="snap_checkbox">
        </div>
        <div>
            <label for="toggle_persistence" id="tip_persistence">Persistence</label>
            <button class="mobile-presistence"id="reset_persistence"><img class="setting_svg" src="./reset.svg"></button>
            <input type="checkbox" id="toggle_persistence">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_trailingfog" id="tip_trailingfog">Trailing Fog (Beta)</label>
            <input type="checkbox" id="toggle_trailingfog">
        </div>
        <div>
            <label for="toggle_autohide" id="tip_autohide">Autohide (Beta)</label>
            <input type="checkbox" id="toggle_autohide">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_unitcontextmenu" id="tip_unitcontextmenu">Show Unit Menu</label>
            <input type="checkbox" id="toggle_unitcontextmenu">
        </div>
        <div>
            <label for="toggle_wallcontextmenu" id="tip_wallcontextmenu">Show Wall Menu</label>
            <input type="checkbox" id="toggle_wallcontextmenu">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_gmwalls" id="tip_gmwalls">Wall Pass (GM)</label>
            <input type="checkbox" id="toggle_gmwalls">
        </div>
        <div>
            <label for="toggle_ownerlines" id="tip_ownerrings">Owner Highlight</label>
            <input type="checkbox" id="toggle_ownerlines">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="toggle_defaultelevation" id="tip_defaultelevation">Default Elevation</label>
            <select name="elevationDefault" id="default_elevation_select" style="width: 80px;">
                <option value="-10">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </div>
        <div>
            <label for="toggle_elevationstyle" id="tip_elevationstyle">Elevation Style</label>
            <select name="elevationStyle" id="elevation_style_select" style="width: 80px;">
                        <option value="false">Mesa</option>
                        <option value="true">City</option>
            </select>
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="door_checkbox" id="tip_playerdoors">Players See Doors</label>
            <input type="checkbox" id="door_checkbox">
        </div>
        <div>
            <label for="warnings_checkbox" id="tip_hardwarewarnings">HW Warnings</label>
            <input type="checkbox" id="warnings_checkbox">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <select class="settingsButton" id="preview_select"></select>
        </div>
        <div>
            <input class="settingsButton" type="button" id="doublewall_button" value="Double-Side Walls">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <input class="settingsButton" type="button" id="block_button" value="Block Walls">
        </div>
        <div>
            <input class="settingsButton" type="button" id="unblock_button" value="Unblock Walls">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <input class="settingsButton" type="button" id="lock_button" value="Lock Lines">
        </div>
        <div>
            <input class="settingsButton" type="button" id="unlock_button" value="Unlock Lines">
        </div>
    </div>

    <div style="text-align: center; font-weight: bold;">
        Tool Options
    </div>

    <div class="grid-container">
        <div style="display:flex; width: 100%;place-content: space-evenly;">
            <label>Width:</label>
            <input id="tool_width" type="number" value="8" style="width: 40px;" maxlength="2">
            <div class="mobile-color"> 
                <input id="tool_color" type="text" maxlength="7">
            </div>
        </div>
        <label>Style:</label>
        <select id="tool_style">
            <option value="solid" selected>Solid</option>
            <option value="dotted">Dotted</option>
        </select>
    </div>

    <div style="text-align: center; font-weight: bold;">
        Vision Defaults
    </div>

    <div class="grid-container">
        <div>
            <label for="visionDefaultInput" id="tip_visionDefault">Vision</label>
            <input type="number" id="visionDefaultInput">
        </div>
        <div>
            <label for="collisionDefaultInput" id="tip_collisionDefault">Collision</label>
            <input type="number" id="collisionDefaultInput">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="falloffDefaultInput" id="tip_falloffDefault">Falloff</label>
            <input type="number" id="falloffDefaultInput">
        </div>
        <div>
            <label for="greyscaleDefaultInput" id="tip_greyscaleDefault">Greyscale</label>
            <input type="number" id="greyscaleDefaultInput">
        </div>
    </div>

    <div class="grid-container">
        <div>
            <label for="innerAngleDefaultInput" id="tip_innerAngleDefault">Inner-Angle</label>
            <input type="number" id="innerAngleDefaultInput">
        </div>
        <div>
            <label for="outerAngleDefaultInput" id="tip_outerAngleDefault">Outer-Angle</label>
            <input type="number" id="outerAngleDefaultInput">
        </div>
    </div>

    <div id="importTable">
        <div class="tableHeader">Import</div>

        <div>Import files from <a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a><br>and other tools.</div>

        <div class="grid-container">
            <div class="custom-file-input">
                <label for="import_file" id="import_file_name">Choose File...</label>
                <input id="import_file" type="file" accept=".dd2vtt, .ddvtt, .uvtt, .fvtt, .json">
            </div>
            <div>
                <input type="button" id="import_button" value="Import" disabled>
            </div>
        </div>

        <div class="grid-container">
            <div>
                <label>Format</label>
                <select id="import_format">
                    <option value="scene">UVTT/DDVTT Scene</option>
                    <option value="foundry">Foundry JSON</option>
                    <option value="uvtt">Universal VTT</option>
                </select>
            </div>
            <div>
                <label>Alignment</label>
                <select id="map_align">
                    <option selected>Loading..</option>
                </select>
            </div>
        </div>

        <div class="grid-container">
            <div style="align-items: center;">
                <label for="dpi_autodetect" id="tip_importdpi">DPI Autodetect</label>
                <input class="mobile-import-dpi-input" id="import_dpi" disabled type="text" value="150" maxlength="4">
                <input type="checkbox" id="dpi_autodetect" checked>
            </div>
        </div>

        <div id="import_errors" class="grid-3"></div>
    </div>
</div>
`;static MARKDOWNHELP=`
<a id="smoke" name="smoke"></a>
<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#quick-start-smoke">Smoke: Quick Start</a>
      <li><a href="#quick-start-spectre">Spectre: Quick Start</a></li>
      <li><a href="#overview">Smoke & Spectre UI Overview</a>
      <ul>
        <li><a href="#ui-smoke">Smoke Panel</a></li>
        <li><a href="#ui-spectre">Spectre Panel</a></li>
        <li><a href="#ui-settings">Settings Panel</a></li>
        <li><a href="#ui-tools">Drawing Tools</a></li>
        <li><a href="#ui-convert">Drawing Conversions</a></li>
        <li><a href="#ui-convert">Elevation Tools</a></li>
      </ul></li>
      <li><a href="#obstruct-tools">Smoke: Using the Obstruction Tools</a>
      <ul>
        <li><a href="#obstruct-line">The Obstruction Line</a></li>
        <li><a href="#obstruct-poly">The Obstruction Polygon</a></li>
        <li><a href="#obstruct-brush">The Obstruction Paintbrush</a></li>
      </ul></li>
      <li><a href="#smoke-tokens">Smoke: Using Tokens</a>
      <ul>
        <li><a href="#smoke-vision">Changing a token's vision range</a></li>
        <li><a href="#smoke-player">Who can see this token's view?</a></li>
        <li><a href="#smoke-linked">Linked Vision</a></li>
      </ul></li>
      <li><a href="#smoke-advanced">Smoke: Advanced Features</a>
      <ul>
        <li><a href="#smoke-light">Using Light Sources</a></li>
        <li><a href="#smoke-doors"> Using Doors & Windows</a></li>
        <li><a href="#smoke-customfog"> Using Custom Fog Backgrounds</a></li>
        <li><a href="#smoke-fogeffects"> Using Fog Effects</a></li>
      </ul></li>
      <li><a href="#smoke-elevation">Smoke: Elevation Mapping</a>
      <ul>
        <li><a href="#smoke-elevation-map">How it works</a></li>
        <li><a href="#smoke-elevation-tools">The Mapping Layer Tools</a></li>
        <li><a href="#smoke-elevation-view">The Mapping View Toggle</a></li>
      </ul></li>
      <li><a href="#smoke-import">Smoke: Importing Fog Files</a></li>
      <li><a href="#spectre-usage">Spectre: Usage and Use Cases</a></li>
      <li><a href="#spectre-works">Spectre: How it works</a>
      <ul>
        <li><a href="#spectre-vision">Who can see the token</a></li>
        <li><a href="#spectre-tokens">Where do the tokens go</a></li>
        <li><a href="#spectre-limits">How many things can be Spectred?</a></li>
      </ul></li>
    <li><a href="#support">Support</a></li>
  </ol>
</details>

<p align="right">(<a href="#smoke">back to top</a>)</p>


## Smoke: Quick Start <a id="quick-start-smoke" name="quick-start-smoke"></a>
So, your game starts in an hour and you've prepped nothing - but you want to distract them with some fog. Sure.

1. Click the 'Glasses' icon in the toolbar, and select the Line tool.  Draw to your heart's content.
2. Add a token to the scene. On that token, through the context-menu, 'Enable Vision'.
3. (Optional: Assign ownership of that token to a specific player, so they can only see through that token.)
4. Click the checkbox in settings  to turn on Fog Fill.
5. Done!

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: Quick Start <a id="quick-start-spectre" name="quick-start-spectre"></a>
You need to drive someone crazy in a hurry, I get it.  Just make sure the player is in the game first for this to work.
1. On the token in the scene, that you want to be visible to ONLY certain players - open the context-menu and select "Spectre".  This will make the token visible to YOU, and no one else.
2. In the 'Spectre' window of the extension, you will now see that token. In the drop-down, select the player(s) you want to be able to see that token.
3. Done! Only those specific players (And yourself) can see that token.

<p align="right">(<a href="#smoke">back to top</a>)</p>
 
## Smoke & Spectre UI Overview <a id="overview" name="overview">

#### <a id="ui-smoke"></a>1. Smoke Panel
This panel holds information on all tokens that have Vision Enabled.  This includes Light sources as well as Character Tokens. A token only gets to this list if you click 'Enable Vision' on it.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-panel.webp)
There are two sets of options to configure a token's vision range;
For Basic Settings:
1. Range: Set the desired radius for a token's vision range.
2. Falloff: Change the edge of a tokens' vision range from a hard line to a soft blur (Try values 0 - 5).
3. Disable: Disable a single token's vision - useful for a quick 'Blind' status.
4. Move to Out-of-Sight List: Moves this token to the lower list which can be hidden from view. Useful if you have lots of items in the scene but the majority of them will never be changed/updated
For Advanced Settings:
1. Collision: Set how far away from the token's center collision will occur when using unpassable walls. If the collision range is set too high, it could prove difficult to move a token in a narrow hallway.
2. Inner/Outer Angle: When looking to use coned vision, set these to the angle in which you would like to constrain vision.  The direction doesn't matter as much, as you can rotate the token and the cone will follow it.
3. Greyscale: Enable to remove color from a token's vision radius, useful for a 'Darkvision' effect.  This will set the entire vision radius to greyscale.

Also, if you right-click a token's name you can assign an owner for a token quickly and easily (Even if you do not have owner-only permissions turned on in your room)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-spectre"></a>2. Spectre Panel
This panel holds information on all tokens that have been 'Spectred'.  

<i>Note: When a token has been 'Spectred', it has been removed from the scene that items generally exist in. This can cause some issues with other extensions that might try to interact with the Spectred item, if they are not scoped to ignore these 'out-of-play' local items. In general, only do Spectre things with Spectred tokens.</i>
![gmview view](https://battle-system.com/owlbear/smoke-docs/spectre-panel.webp)
The options next to a token's name are;
1. Set Viewer(s): Designate which other players are able to see this token.
2. Delete: Remove the Spectre from play.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-settings"></a>3. Settings Panel

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-settings.webp)

The settings for smoke are generally saved to the Scene, as each scene might have different needs to make it work.  The options are as follows;
1. Fog Fill: This will enable/disable the Fog Fill in the Owlbear Rodeo Fog settings.  S&S3.0 requires fog fill in order  to do dynamic fog processing (but does not require it for collision detection). This is a  deviation from S&S2.0 where fog could be calculated in a small area via the bounding grid - which is no longer possible.
2. Disable Vision: This will disable vision for ALL tokens that have vision enabled.  Useful if you need to blind the entire group, but do not wish to click each individual token.
3. Persistence/Reset: This will enable/disable Persistence on your map. Persistence will keep areas that a token has stopped as 'discovered', and it will not be covered in fog when the token moves away.  The 'reset' button next to the toggle will reset the uncovered areas for everyone currently in the room.
4. Trailing Fog (Beta): Trailing fog puts an 'overlay' over the entire map that darkens it further. When an area is visited by a token with vision, this area is left 'revealed' but slightly darker than the area the token is currently in.  This is to show that an area was explored, but no one is present. Trailing fog REQUIRES Persistence to be enabled to work. As for it's BETA status, it currently does not check collision data so will always show a full radius around the token.
5. Owner Highlight: This will enable/disable the colored rings that indicate a player's viewable range as a GM.
6. Autohide (Beta): Autohide adds a new context menu option for tokens (Enable Autohide).  When this is toggled on for a token, that token will AUTOMATICALLY be changed to 'Hidden' when a token with vision is not in visible range of it. As for it's BETA status, it currently does not check collision data so will always show a full radius around the token.
7. Show Unit Menu: This enables the 'Unit Context Menu' where you can change a unit's vision parameters directly on the token.  It will also show the 'Advanced' options for a unit, allowing you to change it's owner or assign it a dedicated elevation level to be at (a case for flying units).
8. Show Wall Menu: This enables the 'Wall Context Menu' where you can see the 'Advanced' options for a wall.  This includes assigning it a SPECIFIC viewer to interact with and assigning a dedicated elevation level.
9. Wall Pass (GM): When enabled, allows a GM the ability to drag a token through walls - even if the walls have blocking enabled.
10. Grid Snap: This will enable/disable the custom grid snapping used for drawing Obstruction Lines/Objects in S&S (Note: You can hold CTRL while drawing to temporarily disable this.). <i>This is independent of the default Snap setting in OBR.</i>
11. Default Elevation:  This will assign the default elevation for all areas where an Elevation Mapping does not exist.
12. Elevation Style: This will swap between the Mesa and City wall styles, which change how elevation layers above 0 interact.
13. Players-See-Doors: This will allow player's to see and interact with doors that have been created.

14. Double-Side Walls: This will change all walls on the map to be double-sided walls. This can be useful if an imported map lacked the information, and you do not wish to set each wall individually.
15. Block/Unblock Walls: By default, when you draw an obstruction it will be passable (with the exception of the Obstruction Brush tool).  This will block/unblock all walls so that tokens ability to pass them is changed.
16. Lock/Unlock Lines: By default, when you draw an obstruction it will be auto-locked to make sure they are not moved on accident.  Use these buttons to lock/unlock all lines so that they can be manipulated again. 
17. Tool Options: This is for customizing the style of the lines that are created when drawing with the Obstruction Tools
18. Vision Defaults: This allows you to set the defaults for a token when their vision is enabled.
19. Import: Smoke is able to accept the UVTT format for building a scene for you. Select the map and Import, and the map image, obstructions, doors and light sources will be created in a new scene.

#### <a id="ui-tools"></a>7. Drawing Tools
Added to the OBR Toolbar are Smoke's drawing tools.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

1. Obstruction Polygon: This tool is slightly different, in that it will create a closed shape - but the inside will be visible.  This is useful for items like 'Large Boulders' on a map, where the player can see that it's a boulder, but they cannot see past it.
2. Obstruction Line: This is your default tool for making an obstruction. Just click in your scene to create points for the line, and select Finish (or push Enter) when you're done.
3. Obstruction Paintbrush: This tool creates obstructions by the grid. Click and drag to fill in the desired area, and when you let go walls will be created around the shape you have painted. This is useful for maps that are blocky and/or very square with angular hallways.
    - This brush should reflect what the currently selected grid option is in Owlbear Rodeo, and supports Square, Hexagon and Isometric grids.
4. Trim Tool: This tool will allow you to click two points on a line, and 'cut' it from the base line. Allowing you to easily lop off a section you didn't intend on, or add a door/window.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>8. Drawing Conversions
If you prefer to use the base Owlbear Rodeo drawing tools, you can.  All shapes and lines created via the default tools can be converted into an Obstruction.  Just right-click the shape and select 'Convert to Obstruction'.
This will remove the shape/line/drawing as it was, and recreate it as an Obstruction object.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-convert.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>9. Elevation Tools
Also on the Smoke Toolbar are the Elevation Mapping tools;

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

1. Elevation Layers: Elevation Mapping Layers 1-5 let you draw a shape at that elevation level, and all points (from obstructions or tokens) when processed will be drawn with that depth in mind.  A quick example (with Mesa style), if you draw an obstruction around a house on your map - and then draw around the house with Elevation 1 - you won't be able to see around/above the house when on the ground, but if you put the token on the house it will be able to see everywhere.
2. Elevation Selection Tool: This let's you select your Elevation Layers.
3. Elevation View Toggle: This toggles on/off the visibility of the Elevation Layers, as they should be hidden away when not being configured. (They still take effect when not seen.)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Using the Obstruction Tools <a id="obstruct-tools" name="obstruct-tools">

When drawing obstructions, you have some options in the form of buttons...
1. Finish: This will complete your line based on the points you added to the scene. You can also push "ENTER" on the keyboard instead of clicking the button.
2. Cancel: This will remove all points and stop any line-drawing in process. You can also push "ESC" on the keyboard.
3. Undo: This will remove the last point you have placed. You can also push "Z" on the keyboard. (Not CTRL+Z, just 'Z')

#### <a id="obstruct-line"></a>1. The Obstruction Line
The line tool is the basic building block for scenes, and likely will be the most used when creating a scene.
By default, they block vision no matter what side of the line you are on. (The 'hidden' area is seen from the GM view in this screenshot, so it's only lightly obscured by darkness.)

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-line.webp)

<i> Note: You are able to change how the default vision works for a line by going to the context-menu for a line and changing between Two-Sided, and One-sided.</i>

You can also toggle an Obstruction Line's ability to block vision by clicking 'Disable/Enable Vision Line' in the context menu.
In addition to that, you can also toggle a line into a 'Door'.  Which works similar to the Vision toggle, but adds a door icon. More on this in the Doors section.
You can change how an obstruction behaves in several ways:
1. Enable/Disable Vision Line: This will toggle how this line interacts with a token's vision.
2. Swap to One-Sided/Two-Sided: This will toggle how a token sees this line. A one-sided line will block vision from one side, but allow vision from the other. A two-sided line will block vision from both sides.
	A. (When on One-sided) Swap Obstructing Side: This will change what side of the line you are able to see through.
3. Swap to Passable/Unpassable: This will change how this line behaves as a collider.  A passable line will not stop a token's movement, but an unpassable one will.
4. Enable Door: This will change the line to have 'Door' functionality. A line that has Door functionable has a few more buttons to improve flow.
	- A. Disable Door: This will disable the line behaving as a door.
	- B. Open/Close Door: This will change if a token can see through, and pass through this line.
	- C.  Lock Door: This will lock the door, so that players are unable to open it.
	- <i>Note: The 'Door' picture that appears can be double-clicked in order to open the door. It only serves the purposes of showing a door though. In order to manipulate the obstruction line that is the door - select the line.</i>
5. Enable Window: This will change the line to have 'Window' functionality. A Window line will be shown as a dashed line, and will also NOT block vision. It will block movement though.
    - <i>Note: If you want a window that can be opened, also Enable Door on the Windowed line.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="obstruct-poly"></a>2. The Obstruction Polygon
The polygon tool is more of a special case, it creates a closed shape where the INSIDE is visible from the outside. The area 'behind' that shape though, you are unable to see.

The use-case for this is generally with objects that are large (and the player would know what it is on sight), but they cannot see behind it.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-poly.webp)

It can also be useful when attached to a large 'Monster' token, as the players would be able to view the token - but not be able to view behind it. (In case it's so big that it blocks vision!)

Polygons also block vision if you are INSIDE of the shape. As in, you'll be able to see the area around you (within the shape) but not see outside of it.  This could be useful if the shape is around a 'barrel' - and a player wants to hide inside. They will not be able to peer out of the barrel.

There is no hard-rule to how this thing is used, so it's really up to you to determine the best case. Feel free to experiment.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="obstruct-brush"></a>3. The Obstruction Brush
The brush tool is a quick-setup tool for maps that are blocky in nature, with lots of square rooms and hallways (Meaning, not a cave with lots of jagged its).

It's based on the grid, so be sure to line your map up accordingly first. After that, just click and drag as the brush highlights the squares it will draw obstruction lines around.  The benefits of this tool is it will let you setup large maps rather quickly by just coloring them in.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-brush.webp)

<i>Note: While this aids in setting up large areas quickly, you might find it useful to use the 'Trim' tool after to add a door.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Using Tokens <a id="smoke-tokens" name="smoke-tokens">

#### <a id="smoke-vision"></a>1. Changing a token's vision range
In the Smoke Panel, once a token has had it's Vision Enabled, the token will appear on the list with some options. The default radius is 30, but you can change this to whatever suits your needs.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-vision.webp)

There are two sets of settings - Basic and Advanced. In order, the controls are:
1. (Basic) Vision Range.
2. (Basic) Vision Falloff.
3. (Basic) Vision Disable.
4. (Advanced) Collision Range.
5. (Advanced) Inner Vision Angle.
6. (Advanced) Outer Vision Angle.
7. (Advanced) Greyscale Vision.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-vision"></a>2. Who can see this token's view?
When a token is added to the scene, the OWNER of that token is the person who added it to the scene. Normally this is the GM.
When vision is enabled on a token (and it's owner is the GM) every player is able to see the vision for this token.  This is useful if you do not want everyone in your game to have their own personalized vision based on their token.
If you do want people to only see from the viewpoint of their token, you want to make sure they are the owner of that token.

To speed up the flow of assigning ownership, you have two options:
1. Let players drag in their own tokens. If they brought it in, they're the owner! Then just enable vision on it.
2. Right-click a token's name in the Smoke Panel, and you are able to assign an owner to a token from a list of **players who have entered the room at any point in time**.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-player.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>
  
#### <a id="smoke-linked"></a>3. Linked Vision
To quickly assign vision groups, or simply have a token 'piggy-back' another token's vision settings - you can 'Link' a token to another one. From the Vision List, click and drag the name of a token on top of the token you want to link it to.  This will 'nest' it, removing it's controls from view.  From this point on, that token will use the parent token's vision settings.

To undo this, you click and drag the name onto itself - this will remove the link.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-links.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>
  
  
## Smoke: Advanced Features <a id="smoke-advanced" name="smoke-advanced">

#### <a id="smoke-light"></a>1. Using Torchlight (Previously Light Sources)
If you need ambient lighting on a map, you need to create a 'Torch'.  This can only be token with token's on the PROP or ATTACHMENT layer.  When you open the context menu of a token on either layer, you will see the 'Create Torchlight' option.
Torchlights are added to the token vision list like all other tokens, but are appended with a 🔦 icon. All of the same settings can be used.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light.webp)

This is easiest to see with narrow hallways.  If you add a torchlight to a small room, and then have a narrow hallway between it and a character token with vision, you will see that the vision the torch gives is constricted.

If you're looking to have your characters explore a dark area where they have to hold torches, it's a simple task.   Create torch tokens, enable vision, set them as a torchlight and then attach them to the characters.  Your other players will then be able to see each other when the light of the torch is not behind something obstructing it.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light2.webp)

<i>Given that torchlights are not needed to be manipulated often, it's often better to move them to the 'Out-of-Sight' list, to clean up the clutter in the Smoke panel.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-doors"></a>2. Using Doors & Windows
In the context-menu for an Obstruction Line, there is an option for 'Enable Door' and 'Enable Window'.

Enabling a door will draw a 'Door' icon on top of that line, which can be toggled to turn on/off the obstruction properties for that line (thus opening the door, allowing people to see through).

Enabling a window will change the line to be 'dashed'.  A windowed line is able to be seen through by players, but will still block movement (if blocking is enabled).

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-door.webp)

You can 'disable' a door and remove the door icon through the same process, selecting 'Disable Door'.
You can toggle the opening of a door in two ways;
1. Double click the door icon.
2. Select 'Open Door' on the context menu

By default, only a GM can see doors on a map.  If you would like your players to be able to see doors, select the option in the Settings panel.
If your players are a little click-happy, you can 'Lock Door' to stop players from being able to toggle them open.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-customfog"></a>3. Using Custom Fog
Sometimes flat-colored fog isn't exactly what you're going for.  If you want things to get a little fancy, Custom Fog is a great feature to spruce things up.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog1.webp)

The basic steps are;
1. Make sure your Custom Fog image is on the Map layer.
2. Overlay the Custom Fog image on top of your regular map.
3. On the context-menu for the Custom Fog image, select 'Convert to Fog Background'.
4. Done!

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog2.webp)

<i>Note: To remove the Fog Background, use the Fog Tool to Select the Custom Fog Background (Because it's a Fog Item now!) and select the option to Convert the item back.</i>
<p align="right">(<a href="#smoke">back to top</a>)</p>


#### <a id="smoke-fogeffects"></a>3. Using Fog Effects

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-enhancedfog.webp)

Fog Effects is a one-touch way of getting stylish fog effects without needing to do much setup.  The flip-side is, you only have access to the ones I have created!

To add a fog-style, double-click a map to see the "Auto Fog" options.
- Effect: A list of different effects to replace the default 'fog' with.
- Style: This dictates the style.  
    - Map fog is generally see-through in a way that you can still see the base map through the effect (though it will still obscure tokens).
    - Flat fog will block the transparency, and only display the effect as fog.

<i>Note: Fog Effects are done via Shaders - and using a lot of them at once can cause some strain on lower-end devices.  Be smart in how you set your scenes up.</i>

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-enhancedfog2.webp)

<i>Note: To remove the Fog Background, use the Fog Tool to Select the Custom Fog Background (Because it's a Fog Item now!) and select the option to Convert the item back.</i>
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Elevation Mapping <a id="smoke-elevation" name="smoke-elevation">
Elevation Mapping allows you to add some depth to your 2D Scene, by assigning 'areas' to the map where certain points/tokens are higher than others.

#### <a id="smoke-elevation-map"></a>1. How it works
When setting up elevation, you have two styles and a few layers to play with. (I've limited this to six to keep things simple, but technically it can be expanded.)

The styles are "Mesa" and "City".
The idea behind Mesa style - is hills, plateaus and cliffs. 
With layers 1-6, the calculations become different. If you have a token and an obstruction both within a Layer 1 mapping, the token can see PAST the obstruction!
But if you have a token with a Layer 1 mapping, and an obstruction within a Layer 2 Mapping, the player CANNOT see past the obstruction. Because the obstruction is at a higher depth.

The "City" style is the same as you would expect on the base layer, but for all layers.

Now for an active example (with Mesa);
Here is a token on an island map. Their vision is not obstructed at all. I have toggled on the Elevation Mapping View so I can use the tools.  I have used Elevation Mapping Layer-1 tool to surround the area I'm going to be working in. (This is to make sure no obstructions I draw within here end up on Elevation Mapping Layer-0, and thus always block vision.)

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-1.webp)

Next, I draw obstruction lines around the items I want to block vision. (This screenshot has the Elevation Mapping View toggled off, so that you can see easier.)
Notice how the obstruction lines don't block a single thing.  This is because the token AND the obstructions all exist within the Elevation Mapping Layer-1 area.  So they are all at the same depth.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-2.webp)

With the base work done, I want to make sure my rocks are higher up - so that I can't see past them when I'm on the ground, and if I stood upon them - I can see the top of them and everything below.  So I'm going to use the Elevation Mapping Layer-1 Tool and draw an area around my rocks.
I draw my mappings AROUND the obstructions, fairly closely. This is because if a player is standing CLOSE to the object, I do not want them to accidentally be within that mapping.
<i>Note: You can layer mappings, and the highest layer will always take priority.</i>

Notice that while on the beach area, I can no longer see past the rocks.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-3.webp)
But when standing on the rocks (within Elevation Mapping Layer-1, the same that the obstruction lines are in), I can see on top of them and off the sides!


![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-4.webp)

But I can still see the next rock above me.. so I'm going to use the next numbered elevation mapping tool.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-5.webp)

Now I can no longer see to the top, but I can see below.  Turn off the Elevation Mapping View so that the layers hide themselves and the effect is complete.

![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-6.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-elevation-tools"></a>2. The Mapping Layer Tools

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

The numbered mountains on the Obstruction Tool Bar are the Elevation Mapping Layer Tools.
Or "MEL" if you want to read it as Mapping Elevation Layer, which for the suck of not writing it a million times - I will.
Each MEL Tool has a number next to it designating what layer it interacts with.
Tier 1 is Blue colored.
Tier 2 is Green colored.
Tier 3 is Yellow colored.
Tier 4 is Orange colored.
Tier 5 is Red colored.
They mimic a regular elevation map that you would see for mountains.  You can stack these mappings if you want, and for any points within several shapes - only the highest mapping is considered.
Meaning, if you circled your entire map in Tier 1, and then drew in the center as Tier 5 - any points in that center would be considered at Tier 5.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-elevation-view"></a>3. The Mapping View Toggle
The last two tools are the MEL Select Tool and MEL View Toggle.
Since the layers can cause a lot of visual clutter, you need to enable the toggle in order to see/use them.
This is also for people who do not want to use them do not need to see anything about it.
When the View is toggled on, the MEL tools are all enabled and you can draw.  When you turn the MEL View off - the information is then saved to the scene, and the visual indications of the layers are removed.
To make things easier and not have to swap between different tool bars, the MEL Select Tool exists so you can grab a layer and interact with it while staying on the Obstruction Tool Bar.

![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Importing Fog Files <a id="smoke-import" name="smoke-import">
You can find information on the UVTT Format here - [ArkenForge UVTT](https://arkenforge.com/universal-vtt-files/) as well as a sample file to try it out [here](https://www.dropbox.com/s/s494c3l6bnblmbu/The%20Pig%20and%20Whistle%20tavern.uvtt?dl=1).
UVTT Files have the .uvtt extension (Though some may differ depending on the application the VTT they were designed for).  Smoke&Spectre can accept general UVTT scenes as well as ones configured for Foundry (more may be added in the future).
When importing a scene, you will be asked where you want to import the Map to in your OBR storage - and the rest will handled for you.
For the other types, it generally expects the map to already be within the scene - so select the map from the Alignment dropdown, and then import your file.  It may take some trial and error depending on the DPI of the map (Not all files are made the same!). Owlbear's default DPI is 150 per grid unit.
<i>Note: There are some exceptions to this rule, where some files are outright badly configured.  There isn't much to be done in this case, so use your best judgement to align the map to the obstruction lines once they are imported.</i>
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-import.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: Usage and Use Cases<a id="spectre-usage" name="spectre-usage">
Spectre is completely different form dynamic fog, in the sense that the two have nothing to do with each other!
Zip! Zero! Nothing!
They are together simply because I thought combined that they created a dramatic event for scenes.

When a token becomes  a "Spectre", it becomes viewable to only you. The person who has made it a spectre.  You are able to see it on your screen all the same though. You are then able to select which people within your room you want to be able to view that token.
Why would you want to do this?
1. Perhaps you have some notes on the screen that you do not want to be 'hidden' because they become partially transparent and hard to read. If you Spectre it, it will maintain it's visibility and only be visible to you.
2. One of your players is haunted by ghosts only they can see.  You could Spectre a ghost, and make it only visible to them. Then when that player begins asking questions about the ghost, everyone else would just assume they are crazy - because no one else sees it.
3. Maybe one of your players has Truesight.  You could set up a seemingly boring room with few things in it, which is what other players would see - and then load it up with Spectre'd props like gold, bodies, books, etc that only they can see.

There's no defined list in how you go about it, but the general idea is controlling their perception (Which is very much where Smoke & Spectre intersect on their use cases.)

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Spectre: How it works<a id="spectre-works" name="spectre-works">
Now, <i> from a technical perspective</i>...
Spectre removes an item from the scene, and recreates it as a local item.  Local items are 'temporary' items that are only seen by the creator. Local items generally have the caveat of disappearing on refresh, but Spectre snapshots everything to your scene so you will not lose your items on a refresh.

A drawback to this is that a Spectre item isn't a 'real' item. So other extensions cannot (Should not) interact with a Spectre'd token.
You can still manipulate a Spectre'd token, in terms of moving and resizing it. A player can also interact with the token if they need to. The way the Spectre'd token update will be a little 'choppier' though, as again, it's not a real item so the way OBR generally animates tokens moving/resizing doesn't happen here.

From a thematic perspective, there are ways around this. You could hide the tokens before moving them, or simply wait until the token is out of their view range. Or blind your player for a moment before doing your updates.
Or just.. do it in front of them. The difference isn't super noticeable, I just feel the need to point it out.
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="spectre-vision"></a>1. Who can see the token
On the Spectre Panel, when a token has been Spectre'd you'll see it pop up here. Next to the token's name is a player drop down.
You can select as many other players as you want to be able to view this token.
You can only select players that are in the room, as the list is populated based on that.
By default, when you Spectre a token you are the only person that can see it.  For everyone else, it'll look as if it was deleted.
![gmview view](https://battle-system.com/owlbear/smoke-docs/spectre-vision.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="spectre-tokens"></a>2. Where do the tokens go
Spectre'd token data is bundled up and stored in your scene. So if you decide to clear out your scene metadata, the Spectre'd token information will also go along with it.  In general, scene data is rather large (it uses your OBR storage, and if you have subscribed you probably have a ton of it) - but Spectre does place a cap on how many things you can it enabled on in the scene for data transmission purposes.

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Support

If you have questions, please join the [Owlbear Rodeo Discord](https://discord.gg/u5RYMkV98s).

Or you can reach out to me at manuel@battle-system.com.
You can also support these projects at the [Battle-System Patreon](https://www.patreon.com/battlesystem).
<p align="right">(<a href="#smoke">back to top</a>)</p>`}export{Gi as C,Si as L,Bi as O,ki as P,Li as a,Ci as b,Ri as c,Ii as d,Mi as e,xi as f,Pi as g,Ui as h,k as i,Di as j,Ni as k};
