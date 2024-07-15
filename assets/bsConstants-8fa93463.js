(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();var E=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class lt{constructor(e){this.messageBus=e}get id(){if(!this.messageBus.userId)throw Error("Unable to get user ID: not ready");return this.messageBus.userId}getSelection(){return E(this,void 0,void 0,function*(){const{selection:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_SELECTION",{});return e})}select(e,t){return E(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:e,replace:t})})}deselect(e){return E(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_DESELECT",{items:e})})}getName(){return E(this,void 0,void 0,function*(){const{name:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_NAME",{});return e})}setName(e){return E(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_NAME",{name:e})})}getColor(){return E(this,void 0,void 0,function*(){const{color:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_COLOR",{});return e})}setColor(e){return E(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_COLOR",{color:e})})}getSyncView(){return E(this,void 0,void 0,function*(){const{syncView:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_SYNC_VIEW",{});return e})}setSyncView(e){return E(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_SYNC_VIEW",{syncView:e})})}getId(){return E(this,void 0,void 0,function*(){const{id:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_ID",{});return e})}getRole(){return E(this,void 0,void 0,function*(){const{role:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_ROLE",{});return e})}getMetadata(){return E(this,void 0,void 0,function*(){const{metadata:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_METADATA",{});return e})}setMetadata(e){return E(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_PLAYER_SET_METADATA",{update:e})})}hasPermission(e){return E(this,void 0,void 0,function*(){if((yield this.getRole())==="GM")return!0;const{permissions:o}=yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS",{});return o.indexOf(e)>-1})}getConnectionId(){return E(this,void 0,void 0,function*(){const{connectionId:e}=yield this.messageBus.sendAsync("OBR_PLAYER_GET_CONNECTION_ID",{});return e})}onChange(e){const t=o=>{e(o.player)};return this.messageBus.send("OBR_PLAYER_SUBSCRIBE",{}),this.messageBus.on("OBR_PLAYER_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_PLAYER_UNSUBSCRIBE",{}),this.messageBus.off("OBR_PLAYER_EVENT_CHANGE",t)}}}var S=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class ht{constructor(e){this.messageBus=e}reset(){return S(this,void 0,void 0,function*(){const{transform:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_RESET",{});return e})}animateTo(e){return S(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO",{transform:e})})}animateToBounds(e){return S(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO_BOUNDS",{bounds:e})})}getPosition(){return S(this,void 0,void 0,function*(){const{position:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_POSITION",{});return e})}setPosition(e){return S(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_POSITION",{position:e})})}getScale(){return S(this,void 0,void 0,function*(){const{scale:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_SCALE",{});return e})}setScale(e){return S(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_SCALE",{scale:e})})}getWidth(){return S(this,void 0,void 0,function*(){const{width:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_WIDTH",{});return e})}getHeight(){return S(this,void 0,void 0,function*(){const{height:e}=yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_HEIGHT",{});return e})}transformPoint(e){return S(this,void 0,void 0,function*(){const{point:t}=yield this.messageBus.sendAsync("OBR_VIEWPORT_TRANSFORM_POINT",{point:e});return t})}inverseTransformPoint(e){return S(this,void 0,void 0,function*(){const{point:t}=yield this.messageBus.sendAsync("OBR_VIEWPORT_INVERSE_TRANSFORM_POINT",{point:e});return t})}}function ct(i){return typeof i.id=="string"}var Ee={exports:{}},W=typeof Reflect=="object"?Reflect:null,xe=W&&typeof W.apply=="function"?W.apply:function(e,t,o){return Function.prototype.apply.call(e,t,o)},J;W&&typeof W.ownKeys=="function"?J=W.ownKeys:Object.getOwnPropertySymbols?J=function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:J=function(e){return Object.getOwnPropertyNames(e)};function ut(i){console&&console.warn&&console.warn(i)}var Ke=Number.isNaN||function(e){return e!==e};function p(){p.init.call(this)}Ee.exports=p;Ee.exports.once=yt;p.EventEmitter=p;p.prototype._events=void 0;p.prototype._eventsCount=0;p.prototype._maxListeners=void 0;var Ne=10;function se(i){if(typeof i!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof i)}Object.defineProperty(p,"defaultMaxListeners",{enumerable:!0,get:function(){return Ne},set:function(i){if(typeof i!="number"||i<0||Ke(i))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+i+".");Ne=i}});p.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0};p.prototype.setMaxListeners=function(e){if(typeof e!="number"||e<0||Ke(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this};function qe(i){return i._maxListeners===void 0?p.defaultMaxListeners:i._maxListeners}p.prototype.getMaxListeners=function(){return qe(this)};p.prototype.emit=function(e){for(var t=[],o=1;o<arguments.length;o++)t.push(arguments[o]);var s=e==="error",n=this._events;if(n!==void 0)s=s&&n.error===void 0;else if(!s)return!1;if(s){var r;if(t.length>0&&(r=t[0]),r instanceof Error)throw r;var c=new Error("Unhandled error."+(r?" ("+r.message+")":""));throw c.context=r,c}var u=n[e];if(u===void 0)return!1;if(typeof u=="function")xe(u,this,t);else for(var l=u.length,a=et(u,l),o=0;o<l;++o)xe(a[o],this,t);return!0};function Ze(i,e,t,o){var s,n,r;if(se(t),n=i._events,n===void 0?(n=i._events=Object.create(null),i._eventsCount=0):(n.newListener!==void 0&&(i.emit("newListener",e,t.listener?t.listener:t),n=i._events),r=n[e]),r===void 0)r=n[e]=t,++i._eventsCount;else if(typeof r=="function"?r=n[e]=o?[t,r]:[r,t]:o?r.unshift(t):r.push(t),s=qe(i),s>0&&r.length>s&&!r.warned){r.warned=!0;var c=new Error("Possible EventEmitter memory leak detected. "+r.length+" "+String(e)+" listeners added. Use emitter.setMaxListeners() to increase limit");c.name="MaxListenersExceededWarning",c.emitter=i,c.type=e,c.count=r.length,ut(c)}return i}p.prototype.addListener=function(e,t){return Ze(this,e,t,!1)};p.prototype.on=p.prototype.addListener;p.prototype.prependListener=function(e,t){return Ze(this,e,t,!0)};function dt(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function Xe(i,e,t){var o={fired:!1,wrapFn:void 0,target:i,type:e,listener:t},s=dt.bind(o);return s.listener=t,o.wrapFn=s,s}p.prototype.once=function(e,t){return se(t),this.on(e,Xe(this,e,t)),this};p.prototype.prependOnceListener=function(e,t){return se(t),this.prependListener(e,Xe(this,e,t)),this};p.prototype.removeListener=function(e,t){var o,s,n,r,c;if(se(t),s=this._events,s===void 0)return this;if(o=s[e],o===void 0)return this;if(o===t||o.listener===t)--this._eventsCount===0?this._events=Object.create(null):(delete s[e],s.removeListener&&this.emit("removeListener",e,o.listener||t));else if(typeof o!="function"){for(n=-1,r=o.length-1;r>=0;r--)if(o[r]===t||o[r].listener===t){c=o[r].listener,n=r;break}if(n<0)return this;n===0?o.shift():ft(o,n),o.length===1&&(s[e]=o[0]),s.removeListener!==void 0&&this.emit("removeListener",e,c||t)}return this};p.prototype.off=p.prototype.removeListener;p.prototype.removeAllListeners=function(e){var t,o,s;if(o=this._events,o===void 0)return this;if(o.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):o[e]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete o[e]),this;if(arguments.length===0){var n=Object.keys(o),r;for(s=0;s<n.length;++s)r=n[s],r!=="removeListener"&&this.removeAllListeners(r);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(t=o[e],typeof t=="function")this.removeListener(e,t);else if(t!==void 0)for(s=t.length-1;s>=0;s--)this.removeListener(e,t[s]);return this};function Qe(i,e,t){var o=i._events;if(o===void 0)return[];var s=o[e];return s===void 0?[]:typeof s=="function"?t?[s.listener||s]:[s]:t?pt(s):et(s,s.length)}p.prototype.listeners=function(e){return Qe(this,e,!0)};p.prototype.rawListeners=function(e){return Qe(this,e,!1)};p.listenerCount=function(i,e){return typeof i.listenerCount=="function"?i.listenerCount(e):Je.call(i,e)};p.prototype.listenerCount=Je;function Je(i){var e=this._events;if(e!==void 0){var t=e[i];if(typeof t=="function")return 1;if(t!==void 0)return t.length}return 0}p.prototype.eventNames=function(){return this._eventsCount>0?J(this._events):[]};function et(i,e){for(var t=new Array(e),o=0;o<e;++o)t[o]=i[o];return t}function ft(i,e){for(;e+1<i.length;e++)i[e]=i[e+1];i.pop()}function pt(i){for(var e=new Array(i.length),t=0;t<e.length;++t)e[t]=i[t].listener||i[t];return e}function yt(i,e){return new Promise(function(t,o){function s(r){i.removeListener(e,n),o(r)}function n(){typeof i.removeListener=="function"&&i.removeListener("error",s),t([].slice.call(arguments))}tt(i,e,n,{once:!0}),e!=="error"&&mt(i,s,{once:!0})})}function mt(i,e,t){typeof i.on=="function"&&tt(i,"error",e,t)}function tt(i,e,t,o){if(typeof i.on=="function")o.once?i.once(e,t):i.on(e,t);else if(typeof i.addEventListener=="function")i.addEventListener(e,function s(n){o.once&&i.removeEventListener(e,s),t(n)});else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof i)}var gt=Ee.exports;let q;const _t=new Uint8Array(16);function vt(){if(!q&&(q=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!q))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return q(_t)}const _=[];for(let i=0;i<256;++i)_.push((i+256).toString(16).slice(1));function Et(i,e=0){return _[i[e+0]]+_[i[e+1]]+_[i[e+2]]+_[i[e+3]]+"-"+_[i[e+4]]+_[i[e+5]]+"-"+_[i[e+6]]+_[i[e+7]]+"-"+_[i[e+8]]+_[i[e+9]]+"-"+_[i[e+10]]+_[i[e+11]]+_[i[e+12]]+_[i[e+13]]+_[i[e+14]]+_[i[e+15]]}const bt=typeof crypto<"u"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),Le={randomUUID:bt};function it(i,e,t){if(Le.randomUUID&&!e&&!i)return Le.randomUUID();i=i||{};const o=i.random||(i.rng||vt)();if(o[6]=o[6]&15|64,o[8]=o[8]&63|128,e){t=t||0;for(let s=0;s<16;++s)e[t+s]=o[s];return e}return Et(o)}class wt extends gt.EventEmitter{constructor(e,t){super(),this.ready=!1,this.userId=null,this.ref=null,this.handleMessage=o=>{const s=o.data;if(o.origin===this.targetOrigin&&ct(s)){if(s.id==="OBR_READY"){this.ready=!0;const n=s.data;this.ref=n.ref,this.userId=n.userId}this.emit(s.id,s.data)}},this.send=(o,s,n)=>{var r;if(!this.ref)throw Error("Unable to send message: not ready");(r=window.parent)===null||r===void 0||r.postMessage({id:o,data:s,ref:this.ref,nonce:n},this.targetOrigin)},this.sendAsync=(o,s,n=5e3)=>{const r=`_${it()}`;return this.send(o,s,r),Promise.race([new Promise((c,u)=>{const l=this;function a(f){l.off(`${o}_RESPONSE${r}`,a),l.off(`${o}_ERROR${r}`,h),c(f)}function h(f){l.off(`${o}_RESPONSE${r}`,a),l.off(`${o}_ERROR${r}`,h),u(f)}this.on(`${o}_RESPONSE${r}`,a),this.on(`${o}_ERROR${r}`,h)}),...n>0?[new Promise((c,u)=>window.setTimeout(()=>u(new Error(`Message ${o} took longer than ${n}ms to get a result`)),n))]:[]])},this.roomId=t,this.targetOrigin=e,window.addEventListener("message",this.handleMessage),this.setMaxListeners(100)}destroy(){window.removeEventListener("message",this.handleMessage)}}var Me=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Tt{constructor(e){this.messageBus=e}show(e,t){return Me(this,void 0,void 0,function*(){const{id:o}=yield this.messageBus.sendAsync("OBR_NOTIFICATION_SHOW",{message:e,variant:t});return o})}close(e){return Me(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_NOTIFICATION_CLOSE",{id:e})})}}var P=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Ot{constructor(e){this.messageBus=e}getColor(){return P(this,void 0,void 0,function*(){const{color:e}=yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_COLOR",{});return e})}setColor(e){return P(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_COLOR",{color:e})})}getStrokeWidth(){return P(this,void 0,void 0,function*(){const{strokeWidth:e}=yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_STROKE_WIDTH",{});return e})}setStrokeWidth(e){return P(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_STROKE_WIDTH",{strokeWidth:e})})}getFilled(){return P(this,void 0,void 0,function*(){const{filled:e}=yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_FILLED",{});return e})}setFilled(e){return P(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_FILLED",{filled:e})})}onChange(e){const t=o=>{e(o.fog)};return this.messageBus.send("OBR_SCENE_FOG_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_FOG_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_SCENE_FOG_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_FOG_EVENT_CHANGE",t)}}}var b=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class At{constructor(e){this.messageBus=e}getDpi(){return b(this,void 0,void 0,function*(){const{dpi:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DPI",{});return e})}getScale(){return b(this,void 0,void 0,function*(){return yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_SCALE",{})})}setScale(e){return b(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_SCALE",{scale:e})})}getColor(){return b(this,void 0,void 0,function*(){const{color:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_COLOR",{});return e})}setColor(e){return b(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_COLOR",{color:e})})}getOpacity(){return b(this,void 0,void 0,function*(){const{opacity:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_OPACITY",{});return e})}setOpacity(e){return b(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_OPACITY",{opacity:e})})}getType(){return b(this,void 0,void 0,function*(){const{type:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_TYPE",{});return e})}setType(e){return b(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_TYPE",{type:e})})}getLineType(){return b(this,void 0,void 0,function*(){const{lineType:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_LINE_TYPE",{});return e})}setLineType(e){return b(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_LINE_TYPE",{lineType:e})})}getMeasurement(){return b(this,void 0,void 0,function*(){const{measurement:e}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_MEASUREMENT",{});return e})}setMeasurement(e){return b(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_MEASUREMENT",{measurement:e})})}snapPosition(e,t,o,s){return b(this,void 0,void 0,function*(){const{position:n}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_SNAP_POSITION",{position:e,snappingSensitivity:t,useCorners:o,useCenter:s});return n})}getDistance(e,t){return b(this,void 0,void 0,function*(){const{distance:o}=yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DISTANCE",{from:e,to:t});return o})}onChange(e){const t=o=>{e(o.grid)};return this.messageBus.send("OBR_SCENE_GRID_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_GRID_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_SCENE_GRID_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_GRID_EVENT_CHANGE",t)}}}var Z=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class kt{constructor(e){this.messageBus=e}undo(){return Z(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_UNDO",{})})}redo(){return Z(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_REDO",{})})}canUndo(){return Z(this,void 0,void 0,function*(){const{canUndo:e}=yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_UNDO",{});return e})}canRedo(){return Z(this,void 0,void 0,function*(){const{canRedo:e}=yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_REDO",{});return e})}}function v(i){for(var e=arguments.length,t=Array(e>1?e-1:0),o=1;o<e;o++)t[o-1]=arguments[o];throw Error("[Immer] minified error nr: "+i+(t.length?" "+t.map(function(s){return"'"+s+"'"}).join(","):"")+". Find the full error at: https://bit.ly/3cXEKWf")}function M(i){return!!i&&!!i[k]}function I(i){var e;return!!i&&(function(t){if(!t||typeof t!="object")return!1;var o=Object.getPrototypeOf(t);if(o===null)return!0;var s=Object.hasOwnProperty.call(o,"constructor")&&o.constructor;return s===Object||typeof s=="function"&&Function.toString.call(s)===Lt}(i)||Array.isArray(i)||!!i[j]||!!(!((e=i.constructor)===null||e===void 0)&&e[j])||ne(i)||ae(i))}function H(i,e,t){t===void 0&&(t=!1),x(i)===0?(t?Object.keys:Be)(i).forEach(function(o){t&&typeof o=="symbol"||e(o,i[o],i)}):i.forEach(function(o,s){return e(s,o,i)})}function x(i){var e=i[k];return e?e.i>3?e.i-4:e.i:Array.isArray(i)?1:ne(i)?2:ae(i)?3:0}function $(i,e){return x(i)===2?i.has(e):Object.prototype.hasOwnProperty.call(i,e)}function ee(i,e){return x(i)===2?i.get(e):i[e]}function ot(i,e,t){var o=x(i);o===2?i.set(e,t):o===3?i.add(t):i[e]=t}function Bt(i,e){return i===e?i!==0||1/i==1/e:i!=i&&e!=e}function ne(i){return xt&&i instanceof Map}function ae(i){return Nt&&i instanceof Set}function N(i){return i.o||i.t}function be(i){if(Array.isArray(i))return Array.prototype.slice.call(i);var e=Mt(i);delete e[k];for(var t=Be(e),o=0;o<t.length;o++){var s=t[o],n=e[s];n.writable===!1&&(n.writable=!0,n.configurable=!0),(n.get||n.set)&&(e[s]={configurable:!0,writable:!0,enumerable:n.enumerable,value:i[s]})}return Object.create(Object.getPrototypeOf(i),e)}function we(i,e){return e===void 0&&(e=!1),Te(i)||M(i)||!I(i)||(x(i)>1&&(i.set=i.add=i.clear=i.delete=St),Object.freeze(i),e&&H(i,function(t,o){return we(o,!0)},!0)),i}function St(){v(2)}function Te(i){return i==null||typeof i!="object"||Object.isFrozen(i)}function C(i){var e=ge[i];return e||v(18,i),e}function Rt(i,e){ge[i]||(ge[i]=e)}function De(){return z}function le(i,e){e&&(C("Patches"),i.u=[],i.s=[],i.v=e)}function te(i){pe(i),i.p.forEach(Ct),i.p=null}function pe(i){i===z&&(z=i.l)}function Pe(i){return z={p:[],l:z,h:i,m:!0,_:0}}function Ct(i){var e=i[k];e.i===0||e.i===1?e.j():e.g=!0}function he(i,e){e._=e.p.length;var t=e.p[0],o=i!==void 0&&i!==t;return e.h.O||C("ES5").S(e,i,o),o?(t[k].P&&(te(e),v(4)),I(i)&&(i=ie(e,i),e.l||oe(e,i)),e.u&&C("Patches").M(t[k].t,i,e.u,e.s)):i=ie(e,t,[]),te(e),e.u&&e.v(e.u,e.s),i!==ke?i:void 0}function ie(i,e,t){if(Te(e))return e;var o=e[k];if(!o)return H(e,function(c,u){return Ue(i,o,e,c,u,t)},!0),e;if(o.A!==i)return e;if(!o.P)return oe(i,o.t,!0),o.t;if(!o.I){o.I=!0,o.A._--;var s=o.i===4||o.i===5?o.o=be(o.k):o.o,n=s,r=!1;o.i===3&&(n=new Set(s),s.clear(),r=!0),H(n,function(c,u){return Ue(i,o,s,c,u,t,r)}),oe(i,s,!1),t&&i.u&&C("Patches").N(o,t,i.u,i.s)}return o.o}function Ue(i,e,t,o,s,n,r){if(M(s)){var c=ie(i,s,n&&e&&e.i!==3&&!$(e.R,o)?n.concat(o):void 0);if(ot(t,o,c),!M(c))return;i.m=!1}else r&&t.add(s);if(I(s)&&!Te(s)){if(!i.h.D&&i._<1)return;ie(i,s),e&&e.A.l||oe(i,s)}}function oe(i,e,t){t===void 0&&(t=!1),!i.l&&i.h.D&&i.m&&we(e,t)}function ce(i,e){var t=i[k];return(t?N(t):i)[e]}function Ge(i,e){if(e in i)for(var t=Object.getPrototypeOf(i);t;){var o=Object.getOwnPropertyDescriptor(t,e);if(o)return o;t=Object.getPrototypeOf(t)}}function ye(i){i.P||(i.P=!0,i.l&&ye(i.l))}function ue(i){i.o||(i.o=be(i.t))}function me(i,e,t){var o=ne(e)?C("MapSet").F(e,t):ae(e)?C("MapSet").T(e,t):i.O?function(s,n){var r=Array.isArray(s),c={i:r?1:0,A:n?n.A:De(),P:!1,I:!1,R:{},l:n,t:s,k:null,o:null,j:null,C:!1},u=c,l=_e;r&&(u=[c],l=F);var a=Proxy.revocable(u,l),h=a.revoke,f=a.proxy;return c.k=f,c.j=h,f}(e,t):C("ES5").J(e,t);return(t?t.A:De()).p.push(o),o}function It(i){return M(i)||v(22,i),function e(t){if(!I(t))return t;var o,s=t[k],n=x(t);if(s){if(!s.P&&(s.i<4||!C("ES5").K(s)))return s.t;s.I=!0,o=Ve(t,n),s.I=!1}else o=Ve(t,n);return H(o,function(r,c){s&&ee(s.t,r)===c||ot(o,r,e(c))}),n===3?new Set(o):o}(i)}function Ve(i,e){switch(e){case 2:return new Map(i);case 3:return Array.from(i)}return be(i)}function Oe(){function i(o){if(!I(o))return o;if(Array.isArray(o))return o.map(i);if(ne(o))return new Map(Array.from(o.entries()).map(function(r){return[r[0],i(r[1])]}));if(ae(o))return new Set(Array.from(o).map(i));var s=Object.create(Object.getPrototypeOf(o));for(var n in o)s[n]=i(o[n]);return $(o,j)&&(s[j]=o[j]),s}function e(o){return M(o)?i(o):o}var t="add";Rt("Patches",{$:function(o,s){return s.forEach(function(n){for(var r=n.path,c=n.op,u=o,l=0;l<r.length-1;l++){var a=x(u),h=r[l];typeof h!="string"&&typeof h!="number"&&(h=""+h),a!==0&&a!==1||h!=="__proto__"&&h!=="constructor"||v(24),typeof u=="function"&&h==="prototype"&&v(24),typeof(u=ee(u,h))!="object"&&v(15,r.join("/"))}var f=x(u),d=i(n.value),y=r[r.length-1];switch(c){case"replace":switch(f){case 2:return u.set(y,d);case 3:v(16);default:return u[y]=d}case t:switch(f){case 1:return y==="-"?u.push(d):u.splice(y,0,d);case 2:return u.set(y,d);case 3:return u.add(d);default:return u[y]=d}case"remove":switch(f){case 1:return u.splice(y,1);case 2:return u.delete(y);case 3:return u.delete(n.value);default:return delete u[y]}default:v(17,c)}}),o},N:function(o,s,n,r){switch(o.i){case 0:case 4:case 2:return function(c,u,l,a){var h=c.t,f=c.o;H(c.R,function(d,y){var m=ee(h,d),T=ee(f,d),O=y?$(h,d)?"replace":t:"remove";if(m!==T||O!=="replace"){var A=u.concat(d);l.push(O==="remove"?{op:O,path:A}:{op:O,path:A,value:T}),a.push(O===t?{op:"remove",path:A}:O==="remove"?{op:t,path:A,value:e(m)}:{op:"replace",path:A,value:e(m)})}})}(o,s,n,r);case 5:case 1:return function(c,u,l,a){var h=c.t,f=c.R,d=c.o;if(d.length<h.length){var y=[d,h];h=y[0],d=y[1];var m=[a,l];l=m[0],a=m[1]}for(var T=0;T<h.length;T++)if(f[T]&&d[T]!==h[T]){var O=u.concat([T]);l.push({op:"replace",path:O,value:e(d[T])}),a.push({op:"replace",path:O,value:e(h[T])})}for(var A=h.length;A<d.length;A++){var D=u.concat([A]);l.push({op:t,path:D,value:e(d[A])})}h.length<d.length&&a.push({op:"replace",path:u.concat(["length"]),value:h.length})}(o,s,n,r);case 3:return function(c,u,l,a){var h=c.t,f=c.o,d=0;h.forEach(function(y){if(!f.has(y)){var m=u.concat([d]);l.push({op:"remove",path:m,value:y}),a.unshift({op:t,path:m,value:y})}d++}),d=0,f.forEach(function(y){if(!h.has(y)){var m=u.concat([d]);l.push({op:t,path:m,value:y}),a.unshift({op:"remove",path:m,value:y})}d++})}(o,s,n,r)}},M:function(o,s,n,r){n.push({op:"replace",path:[],value:s===ke?void 0:s}),r.push({op:"replace",path:[],value:o})}})}var We,z,Ae=typeof Symbol<"u"&&typeof Symbol("x")=="symbol",xt=typeof Map<"u",Nt=typeof Set<"u",He=typeof Proxy<"u"&&Proxy.revocable!==void 0&&typeof Reflect<"u",ke=Ae?Symbol.for("immer-nothing"):((We={})["immer-nothing"]=!0,We),j=Ae?Symbol.for("immer-draftable"):"__$immer_draftable",k=Ae?Symbol.for("immer-state"):"__$immer_state",Lt=""+Object.prototype.constructor,Be=typeof Reflect<"u"&&Reflect.ownKeys?Reflect.ownKeys:Object.getOwnPropertySymbols!==void 0?function(i){return Object.getOwnPropertyNames(i).concat(Object.getOwnPropertySymbols(i))}:Object.getOwnPropertyNames,Mt=Object.getOwnPropertyDescriptors||function(i){var e={};return Be(i).forEach(function(t){e[t]=Object.getOwnPropertyDescriptor(i,t)}),e},ge={},_e={get:function(i,e){if(e===k)return i;var t=N(i);if(!$(t,e))return function(s,n,r){var c,u=Ge(n,r);return u?"value"in u?u.value:(c=u.get)===null||c===void 0?void 0:c.call(s.k):void 0}(i,t,e);var o=t[e];return i.I||!I(o)?o:o===ce(i.t,e)?(ue(i),i.o[e]=me(i.A.h,o,i)):o},has:function(i,e){return e in N(i)},ownKeys:function(i){return Reflect.ownKeys(N(i))},set:function(i,e,t){var o=Ge(N(i),e);if(o?.set)return o.set.call(i.k,t),!0;if(!i.P){var s=ce(N(i),e),n=s?.[k];if(n&&n.t===t)return i.o[e]=t,i.R[e]=!1,!0;if(Bt(t,s)&&(t!==void 0||$(i.t,e)))return!0;ue(i),ye(i)}return i.o[e]===t&&(t!==void 0||e in i.o)||Number.isNaN(t)&&Number.isNaN(i.o[e])||(i.o[e]=t,i.R[e]=!0),!0},deleteProperty:function(i,e){return ce(i.t,e)!==void 0||e in i.t?(i.R[e]=!1,ue(i),ye(i)):delete i.R[e],i.o&&delete i.o[e],!0},getOwnPropertyDescriptor:function(i,e){var t=N(i),o=Reflect.getOwnPropertyDescriptor(t,e);return o&&{writable:!0,configurable:i.i!==1||e!=="length",enumerable:o.enumerable,value:t[e]}},defineProperty:function(){v(11)},getPrototypeOf:function(i){return Object.getPrototypeOf(i.t)},setPrototypeOf:function(){v(12)}},F={};H(_e,function(i,e){F[i]=function(){return arguments[0]=arguments[0][0],e.apply(this,arguments)}}),F.deleteProperty=function(i,e){return F.set.call(this,i,e,void 0)},F.set=function(i,e,t){return _e.set.call(this,i[0],e,t,i[0])};var Dt=function(){function i(t){var o=this;this.O=He,this.D=!0,this.produce=function(s,n,r){if(typeof s=="function"&&typeof n!="function"){var c=n;n=s;var u=o;return function(m){var T=this;m===void 0&&(m=c);for(var O=arguments.length,A=Array(O>1?O-1:0),D=1;D<O;D++)A[D-1]=arguments[D];return u.produce(m,function(rt){var Ie;return(Ie=n).call.apply(Ie,[T,rt].concat(A))})}}var l;if(typeof n!="function"&&v(6),r!==void 0&&typeof r!="function"&&v(7),I(s)){var a=Pe(o),h=me(o,s,void 0),f=!0;try{l=n(h),f=!1}finally{f?te(a):pe(a)}return typeof Promise<"u"&&l instanceof Promise?l.then(function(m){return le(a,r),he(m,a)},function(m){throw te(a),m}):(le(a,r),he(l,a))}if(!s||typeof s!="object"){if((l=n(s))===void 0&&(l=s),l===ke&&(l=void 0),o.D&&we(l,!0),r){var d=[],y=[];C("Patches").M(s,l,d,y),r(d,y)}return l}v(21,s)},this.produceWithPatches=function(s,n){if(typeof s=="function")return function(l){for(var a=arguments.length,h=Array(a>1?a-1:0),f=1;f<a;f++)h[f-1]=arguments[f];return o.produceWithPatches(l,function(d){return s.apply(void 0,[d].concat(h))})};var r,c,u=o.produce(s,n,function(l,a){r=l,c=a});return typeof Promise<"u"&&u instanceof Promise?u.then(function(l){return[l,r,c]}):[u,r,c]},typeof t?.useProxies=="boolean"&&this.setUseProxies(t.useProxies),typeof t?.autoFreeze=="boolean"&&this.setAutoFreeze(t.autoFreeze)}var e=i.prototype;return e.createDraft=function(t){I(t)||v(8),M(t)&&(t=It(t));var o=Pe(this),s=me(this,t,void 0);return s[k].C=!0,pe(o),s},e.finishDraft=function(t,o){var s=t&&t[k],n=s.A;return le(n,o),he(void 0,n)},e.setAutoFreeze=function(t){this.D=t},e.setUseProxies=function(t){t&&!He&&v(20),this.O=t},e.applyPatches=function(t,o){var s;for(s=o.length-1;s>=0;s--){var n=o[s];if(n.path.length===0&&n.op==="replace"){t=n.value;break}}s>-1&&(o=o.slice(s+1));var r=C("Patches").$;return M(t)?r(t,o):this.produce(t,function(c){return r(c,o)})},i}(),B=new Dt;B.produce;var Se=B.produceWithPatches.bind(B);B.setAutoFreeze.bind(B);B.setUseProxies.bind(B);B.applyPatches.bind(B);B.createDraft.bind(B);B.finishDraft.bind(B);var U=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};Oe();class Pt{constructor(e){this.messageBus=e}getItems(e){return U(this,void 0,void 0,function*(){if(Array.isArray(e)){const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEMS",{ids:e});return t}else if(e){const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS",{});return t.filter(e)}else{const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS",{});return t}})}isItemArray(e){return Array.isArray(e)&&e.every(t=>typeof t!="string")}updateItems(e,t,o=!0){return U(this,void 0,void 0,function*(){let s;this.isItemArray(e)?s=e:s=yield this.getItems(e);const[n,r]=Se(s,t),c=n.map(l=>({id:l.id,type:l.type}));for(const l of r){const[a,h]=l.path;typeof a=="number"&&typeof h=="string"&&(c[a][h]=n[a][h])}const u=c.filter(l=>Object.keys(l).length>2);u.length!==0&&(yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_UPDATE_ITEMS",{updates:u,updateAttachments:o}))})}addItems(e){return U(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_ADD_ITEMS",{items:e})})}deleteItems(e){return U(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_DELETE_ITEMS",{ids:e})})}getItemAttachments(e){return U(this,void 0,void 0,function*(){const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_ATTACHMENTS",{ids:e});return t})}getItemBounds(e){return U(this,void 0,void 0,function*(){const{bounds:t}=yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_BOUNDS",{ids:e});return t})}onChange(e){const t=o=>{e(o.items)};return this.messageBus.send("OBR_SCENE_ITEMS_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_ITEMS_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_SCENE_ITEMS_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_ITEMS_EVENT_CHANGE",t)}}}var G=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};Oe();class Ut{constructor(e){this.messageBus=e}getItems(e){return G(this,void 0,void 0,function*(){if(Array.isArray(e)){const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEMS",{ids:e});return t}else if(e){const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS",{});return t.filter(e)}else{const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS",{});return t}})}isItemArray(e){return Array.isArray(e)&&e.every(t=>typeof t!="string")}updateItems(e,t,o,s=!0){return G(this,void 0,void 0,function*(){let n;this.isItemArray(e)?n=e:n=yield this.getItems(e);const[r,c]=Se(n,t),u=r.map(a=>({id:a.id,type:a.type}));for(const a of c){const[h,f]=a.path;typeof h=="number"&&typeof f=="string"&&(u[h][f]=r[h][f])}const l=u.filter(a=>Object.keys(a).length>2);l.length!==0&&(yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_UPDATE_ITEMS",{updates:l,fastUpdate:o,updateAttachments:s}))})}addItems(e){return G(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_ADD_ITEMS",{items:e})})}deleteItems(e){return G(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_DELETE_ITEMS",{ids:e})})}getItemAttachments(e){return G(this,void 0,void 0,function*(){const{items:t}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_ATTACHMENTS",{ids:e});return t})}getItemBounds(e){return G(this,void 0,void 0,function*(){const{bounds:t}=yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_BOUNDS",{ids:e});return t})}onChange(e){const t=o=>{e(o.items)};return this.messageBus.send("OBR_SCENE_LOCAL_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_LOCAL_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_SCENE_LOCAL_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_LOCAL_EVENT_CHANGE",t)}}}var de=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Gt{constructor(e){this.messageBus=e,this.grid=new At(e),this.fog=new Ot(e),this.history=new kt(e),this.items=new Pt(e),this.local=new Ut(e)}isReady(){return de(this,void 0,void 0,function*(){const{ready:e}=yield this.messageBus.sendAsync("OBR_SCENE_IS_READY",{});return e})}onReadyChange(e){const t=o=>{e(o.ready)};return this.messageBus.send("OBR_SCENE_READY_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_EVENT_READY_CHANGE",t),()=>{this.messageBus.send("OBR_SCENE_READY_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_EVENT_READY_CHANGE",t)}}getMetadata(){return de(this,void 0,void 0,function*(){const{metadata:e}=yield this.messageBus.sendAsync("OBR_SCENE_GET_METADATA",{});return e})}setMetadata(e){return de(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_SCENE_SET_METADATA",{update:e})})}onMetadataChange(e){const t=o=>{e(o.metadata)};return this.messageBus.send("OBR_SCENE_METADATA_SUBSCRIBE",{}),this.messageBus.on("OBR_SCENE_METADATA_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_SCENE_METADATA_UNSUBSCRIBE",{}),this.messageBus.off("OBR_SCENE_METADATA_EVENT_CHANGE",t)}}}function st(i){return i.startsWith("http")?i:`${window.location.origin}${i}`}function Y(i){return i.map(e=>Object.assign(Object.assign({},e),{icon:st(e.icon)}))}function Re(i){return Object.assign(Object.assign({},i),{url:st(i.url)})}var Fe=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Vt{constructor(e){this.contextMenus={},this.handleClick=t=>{var o;const s=this.contextMenus[t.id];s&&((o=s.onClick)===null||o===void 0||o.call(s,t.context,t.elementId))},this.messageBus=e,e.on("OBR_CONTEXT_MENU_EVENT_CLICK",this.handleClick)}create(e){return Fe(this,void 0,void 0,function*(){this.messageBus.sendAsync("OBR_CONTEXT_MENU_CREATE",{id:e.id,shortcut:e.shortcut,icons:Y(e.icons),embed:e.embed&&Re(e.embed)}),this.contextMenus[e.id]=e})}remove(e){return Fe(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_CONTEXT_MENU_REMOVE",{id:e}),delete this.contextMenus[e]})}}var R=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Wt{constructor(e){this.tools={},this.toolActions={},this.toolModes={},this.handleToolClick=t=>{const o=this.tools[t.id];if(o)if(o.onClick){const s=o.onClick(t.context,t.elementId);Promise.resolve(s).then(n=>{n&&this.messageBus.send("OBR_TOOL_ACTIVATE",{id:t.id})})}else this.messageBus.send("OBR_TOOL_ACTIVATE",{id:t.id})},this.handleToolActionClick=t=>{var o;const s=this.toolActions[t.id];s&&((o=s.onClick)===null||o===void 0||o.call(s,t.context,t.elementId))},this.handleToolModeClick=t=>{const o=this.toolModes[t.id];if(o)if(o.onClick){const s=o.onClick(t.context,t.elementId);Promise.resolve(s).then(n=>{n&&this.messageBus.send("OBR_TOOL_MODE_ACTIVATE",{toolId:t.context.activeTool,modeId:t.id})})}else this.messageBus.send("OBR_TOOL_MODE_ACTIVATE",{toolId:t.context.activeTool,modeId:t.id})},this.handleToolModeToolClick=t=>{const o=this.toolModes[t.id];if(o)if(o.onToolClick){const s=o.onToolClick(t.context,t.event);Promise.resolve(s).then(n=>{n&&t.event.target&&!t.event.target.locked&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[t.event.target.id]})})}else t.event.target&&!t.event.target.locked&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[t.event.target.id]})},this.handleToolModeToolDoubleClick=t=>{const o=this.toolModes[t.id];if(o)if(o.onToolDoubleClick){const s=o.onToolDoubleClick(t.context,t.event);Promise.resolve(s).then(n=>{n&&t.event.target&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[t.event.target.id]})})}else t.event.target&&this.messageBus.sendAsync("OBR_PLAYER_SELECT",{items:[t.event.target.id]})},this.handleToolModeToolDown=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onToolDown)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeToolMove=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onToolMove)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeToolUp=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onToolUp)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeToolDragStart=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onToolDragStart)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeToolDragMove=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onToolDragMove)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeToolDragEnd=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onToolDragEnd)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeToolDragCancel=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onToolDragCancel)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeKeyDown=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onKeyDown)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeKeyUp=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onKeyUp)===null||o===void 0||o.call(s,t.context,t.event))},this.handleToolModeActivate=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onActivate)===null||o===void 0||o.call(s,t.context))},this.handleToolModeDeactivate=t=>{var o;const s=this.toolModes[t.id];s&&((o=s.onDeactivate)===null||o===void 0||o.call(s,t.context))},this.messageBus=e,e.on("OBR_TOOL_EVENT_CLICK",this.handleToolClick),e.on("OBR_TOOL_ACTION_EVENT_CLICK",this.handleToolActionClick),e.on("OBR_TOOL_MODE_EVENT_CLICK",this.handleToolModeClick),e.on("OBR_TOOL_MODE_EVENT_TOOL_CLICK",this.handleToolModeToolClick),e.on("OBR_TOOL_MODE_EVENT_TOOL_DOUBLE_CLICK",this.handleToolModeToolDoubleClick),e.on("OBR_TOOL_MODE_EVENT_TOOL_DOWN",this.handleToolModeToolDown),e.on("OBR_TOOL_MODE_EVENT_TOOL_MOVE",this.handleToolModeToolMove),e.on("OBR_TOOL_MODE_EVENT_TOOL_UP",this.handleToolModeToolUp),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_START",this.handleToolModeToolDragStart),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_MOVE",this.handleToolModeToolDragMove),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_END",this.handleToolModeToolDragEnd),e.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_CANCEL",this.handleToolModeToolDragCancel),e.on("OBR_TOOL_MODE_EVENT_KEY_DOWN",this.handleToolModeKeyDown),e.on("OBR_TOOL_MODE_EVENT_KEY_UP",this.handleToolModeKeyUp),e.on("OBR_TOOL_MODE_EVENT_ACTIVATE",this.handleToolModeActivate),e.on("OBR_TOOL_MODE_EVENT_DEACTIVATE",this.handleToolModeDeactivate)}create(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_CREATE",{id:e.id,shortcut:e.shortcut,defaultMode:e.defaultMode,defaultMetadata:e.defaultMetadata,icons:Y(e.icons),disabled:e.disabled}),this.tools[e.id]=e})}remove(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_REMOVE",{id:e}),delete this.tools[e]})}activateTool(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_ACTIVATE",{id:e})})}getMetadata(e){return R(this,void 0,void 0,function*(){const{metadata:t}=yield this.messageBus.sendAsync("OBR_TOOL_GET_METADATA",{id:e});return t})}setMetadata(e,t){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_SET_METADATA",{toolId:e,update:t})})}createAction(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_ACTION_CREATE",{id:e.id,shortcut:e.shortcut,icons:Y(e.icons),disabled:e.disabled}),this.toolActions[e.id]=e})}removeAction(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_ACTION_REMOVE",{id:e}),delete this.tools[e]})}createMode(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_MODE_CREATE",{id:e.id,shortcut:e.shortcut,icons:Y(e.icons),preventDrag:e.preventDrag,disabled:e.disabled,cursors:e.cursors}),this.toolModes[e.id]=e})}removeMode(e){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_MODE_REMOVE",{id:e}),delete this.tools[e]})}activateMode(e,t){return R(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_TOOL_MODE_ACTIVATE",{toolId:e,modeId:t})})}}var V=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Ht{constructor(e){this.messageBus=e}open(e){return V(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_OPEN",Object.assign({},Re(e)))})}close(e){return V(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_CLOSE",{id:e})})}getWidth(e){return V(this,void 0,void 0,function*(){const{width:t}=yield this.messageBus.sendAsync("OBR_POPOVER_GET_WIDTH",{id:e});return t})}setWidth(e,t){return V(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_SET_WIDTH",{id:e,width:t})})}getHeight(e){return V(this,void 0,void 0,function*(){const{height:t}=yield this.messageBus.sendAsync("OBR_POPOVER_GET_HEIGHT",{id:e});return t})}setHeight(e,t){return V(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_POPOVER_SET_HEIGHT",{id:e,height:t})})}}var je=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Ft{constructor(e){this.messageBus=e}open(e){return je(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_MODAL_OPEN",Object.assign({},Re(e)))})}close(e){return je(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_MODAL_CLOSE",{id:e})})}}var w=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class jt{constructor(e){this.messageBus=e}getWidth(){return w(this,void 0,void 0,function*(){const{width:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_WIDTH",{});return e})}setWidth(e){return w(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_WIDTH",{width:e})})}getHeight(){return w(this,void 0,void 0,function*(){const{height:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_HEIGHT",{});return e})}setHeight(e){return w(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_HEIGHT",{height:e})})}getBadgeText(){return w(this,void 0,void 0,function*(){const{badgeText:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_TEXT",{});return e})}setBadgeText(e){return w(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_TEXT",{badgeText:e})})}getBadgeBackgroundColor(){return w(this,void 0,void 0,function*(){const{badgeBackgroundColor:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_BACKGROUND_COLOR",{});return e})}setBadgeBackgroundColor(e){return w(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_BACKGROUND_COLOR",{badgeBackgroundColor:e})})}getIcon(){return w(this,void 0,void 0,function*(){const{icon:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_ICON",{});return e})}setIcon(e){return w(this,void 0,void 0,function*(){const t=Y([{icon:e}]);yield this.messageBus.sendAsync("OBR_ACTION_SET_ICON",{icon:t[0].icon})})}getTitle(){return w(this,void 0,void 0,function*(){const{title:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_TITLE",{});return e})}setTitle(e){return w(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_SET_TITLE",{title:e})})}isOpen(){return w(this,void 0,void 0,function*(){const{isOpen:e}=yield this.messageBus.sendAsync("OBR_ACTION_GET_IS_OPEN",{});return e})}open(){return w(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_OPEN",{})})}close(){return w(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ACTION_CLOSE",{})})}onOpenChange(e){const t=o=>{e(o.isOpen)};return this.messageBus.send("OBR_ACTION_IS_OPEN_SUBSCRIBE",{}),this.messageBus.on("OBR_ACTION_IS_OPEN_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_IS_OPEN_ACTION_UNSUBSCRIBE",{}),this.messageBus.off("OBR_ACTION_IS_OPEN_EVENT_CHANGE",t)}}}var Yt=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};Oe();class $t{constructor(e){this.messageBus=e}startItemInteraction(e,t=!0){return Yt(this,void 0,void 0,function*(){const{id:o}=yield this.messageBus.sendAsync("OBR_INTERACTION_START_ITEM_INTERACTION",{baseState:e,updateAttachments:t});let s=e;return[c=>{const[u,l]=Se(s,c);return s=u,this.messageBus.send("OBR_INTERACTION_UPDATE_ITEM_INTERACTION",{id:o,patches:l}),u},()=>{this.messageBus.send("OBR_INTERACTION_STOP_ITEM_INTERACTION",{id:o})}]})}}var zt=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Kt{constructor(e){this.messageBus=e}getPlayers(){return zt(this,void 0,void 0,function*(){const{players:e}=yield this.messageBus.sendAsync("OBR_PARTY_GET_PLAYERS",{});return e})}onChange(e){const t=o=>{e(o.players)};return this.messageBus.send("OBR_PARTY_SUBSCRIBE",{}),this.messageBus.on("OBR_PARTY_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_PARTY_UNSUBSCRIBE",{}),this.messageBus.off("OBR_PARTY_EVENT_CHANGE",t)}}}var fe=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class qt{constructor(e){this.messageBus=e}get id(){return this.messageBus.roomId}getPermissions(){return fe(this,void 0,void 0,function*(){const{permissions:e}=yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS",{});return e})}getMetadata(){return fe(this,void 0,void 0,function*(){const{metadata:e}=yield this.messageBus.sendAsync("OBR_ROOM_GET_METADATA",{});return e})}setMetadata(e){return fe(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ROOM_SET_METADATA",{update:e})})}onMetadataChange(e){const t=o=>{e(o.metadata)};return this.messageBus.send("OBR_ROOM_METADATA_SUBSCRIBE",{}),this.messageBus.on("OBR_ROOM_METADATA_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_METADATA_ROOM_UNSUBSCRIBE",{}),this.messageBus.off("OBR_ROOM_METADATA_EVENT_CHANGE",t)}}onPermissionsChange(e){const t=o=>{e(o.permissions)};return this.messageBus.send("OBR_ROOM_PERMISSIONS_SUBSCRIBE",{}),this.messageBus.on("OBR_ROOM_PERMISSIONS_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_PERMISSIONS_ROOM_UNSUBSCRIBE",{}),this.messageBus.off("OBR_ROOM_PERMISSIONS_EVENT_CHANGE",t)}}}var Zt=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Xt{constructor(e){this.messageBus=e}getTheme(){return Zt(this,void 0,void 0,function*(){const{theme:e}=yield this.messageBus.sendAsync("OBR_THEME_GET_THEME",{});return e})}onChange(e){const t=o=>{e(o.theme)};return this.messageBus.send("OBR_THEME_SUBSCRIBE",{}),this.messageBus.on("OBR_THEME_EVENT_CHANGE",t),()=>{this.messageBus.send("OBR_THEME_UNSUBSCRIBE",{}),this.messageBus.off("OBR_THEME_EVENT_CHANGE",t)}}}var X=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class Qt{constructor(e){this.messageBus=e}uploadImages(e,t){return X(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ASSETS_UPLOAD_IMAGES",{images:e,typeHint:t})})}uploadScenes(e,t){return X(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_ASSETS_UPLOAD_SCENES",{scenes:e,disableShowScenes:t})})}downloadImages(e,t,o){return X(this,void 0,void 0,function*(){const{images:s}=yield this.messageBus.sendAsync("OBR_ASSETS_DOWNLOAD_IMAGES",{multiple:e,defaultSearch:t,typeHint:o},-1);return s})}downloadScenes(e,t){return X(this,void 0,void 0,function*(){const{scenes:o}=yield this.messageBus.sendAsync("OBR_ASSETS_DOWNLOAD_SCENES",{multiple:e,defaultSearch:t},-1);return o})}}var Jt=globalThis&&globalThis.__awaiter||function(i,e,t,o){function s(n){return n instanceof t?n:new t(function(r){r(n)})}return new(t||(t=Promise))(function(n,r){function c(a){try{l(o.next(a))}catch(h){r(h)}}function u(a){try{l(o.throw(a))}catch(h){r(h)}}function l(a){a.done?n(a.value):s(a.value).then(c,u)}l((o=o.apply(i,e||[])).next())})};class ei{constructor(e){this.messageBus=e}sendMessage(e,t,o){return Jt(this,void 0,void 0,function*(){yield this.messageBus.sendAsync("OBR_BROADCAST_SEND_MESSAGE",{channel:e,data:t,options:o})})}onMessage(e,t){return this.messageBus.send("OBR_BROADCAST_SUBSCRIBE",{channel:e}),this.messageBus.on(`OBR_BROADCAST_MESSAGE_${e}`,t),()=>{this.messageBus.send("OBR_BROADCAST_UNSUBSCRIBE",{channel:e}),this.messageBus.off(`OBR_BROADCAST_MESSAGE_${e}`,t)}}}class re{constructor(e){this._item={createdUserId:e.id,id:it(),name:"Item",zIndex:Date.now(),lastModified:new Date().toISOString(),lastModifiedUserId:e.id,locked:!1,metadata:{},position:{x:0,y:0},rotation:0,scale:{x:1,y:1},type:"ITEM",visible:!0,layer:"POPOVER"}}createdUserId(e){return this._item.createdUserId=e,this.self()}id(e){return this._item.id=e,this.self()}name(e){return this._item.name=e,this.self()}description(e){return this._item.description=e,this.self()}lastModified(e){return this._item.lastModified=e,this.self()}zIndex(e){return this._item.zIndex=e,this.self()}lastModifiedUserId(e){return this._item.lastModifiedUserId=e,this.self()}locked(e){return this._item.locked=e,this.self()}metadata(e){return this._item.metadata=e,this.self()}position(e){return this._item.position=e,this.self()}rotation(e){return this._item.rotation=e,this.self()}scale(e){return this._item.scale=e,this.self()}visible(e){return this._item.visible=e,this.self()}attachedTo(e){return this._item.attachedTo=e,this.self()}layer(e){return this._item.layer=e,this.self()}disableHit(e){return this._item.disableHit=e,this.self()}disableAutoZIndex(e){return this._item.disableAutoZIndex=e,this.self()}disableAttachmentBehavior(e){return this._item.disableAttachmentBehavior=e,this.self()}self(){return this}}class ti extends re{constructor(e){super(e),this._points=[],this._style={fillColor:"black",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:5,strokeDash:[],tension:.5},this._item.name="Curve",this._item.layer="DRAWING"}points(e){return this._points=e,this.self()}style(e){return this._style=e,this.self()}fillColor(e){return this._style.fillColor=e,this.self()}fillOpacity(e){return this._style.fillOpacity=e,this.self()}strokeColor(e){return this._style.strokeColor=e,this.self()}strokeOpacity(e){return this._style.strokeOpacity=e,this.self()}strokeWidth(e){return this._style.strokeWidth=e,this.self()}strokeDash(e){return this._style.strokeDash=e,this.self()}tension(e){return this._style.tension=e,this.self()}closed(e){return this._style.closed=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"CURVE",points:this._points,style:this._style})}}class ii extends re{constructor(e,t,o){super(e),this._image=t,this._grid=o,this._item.name="Image",this._text={richText:[{type:"paragraph",children:[{text:""}]}],plainText:"",style:{padding:8,fontFamily:"Roboto",fontSize:24,fontWeight:400,textAlign:"CENTER",textAlignVertical:"BOTTOM",fillColor:"white",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:0,lineHeight:1.5},type:"PLAIN",width:"AUTO",height:"AUTO"},this._textItemType="LABEL"}text(e){return this._text=e,this.self()}textItemType(e){return this._textItemType=e,this.self()}textWidth(e){return this._text.width=e,this.self()}textHeight(e){return this._text.height=e,this.self()}richText(e){return this._text.richText=e,this.self()}plainText(e){return this._text.plainText=e,this.self()}textType(e){return this._text.type=e,this.self()}textPadding(e){return this._text.style.padding=e,this.self()}fontFamily(e){return this._text.style.fontFamily=e,this.self()}fontSize(e){return this._text.style.fontSize=e,this.self()}fontWeight(e){return this._text.style.fontWeight=e,this.self()}textAlign(e){return this._text.style.textAlign=e,this.self()}textAlignVertical(e){return this._text.style.textAlignVertical=e,this.self()}textFillColor(e){return this._text.style.fillColor=e,this.self()}textFillOpacity(e){return this._text.style.fillOpacity=e,this.self()}textStrokeColor(e){return this._text.style.strokeColor=e,this.self()}textStrokeOpacity(e){return this._text.style.strokeOpacity=e,this.self()}textStrokeWidth(e){return this._text.style.strokeWidth=e,this.self()}textLineHeight(e){return this._text.style.lineHeight=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"IMAGE",image:this._image,grid:this._grid,text:this._text,textItemType:this._textItemType})}}class oi extends re{constructor(e){super(e),this._width=0,this._height=0,this._shapeType="RECTANGLE",this._style={fillColor:"black",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:5,strokeDash:[]},this._item.layer="DRAWING",this._item.name="Shape"}width(e){return this._width=e,this.self()}height(e){return this._height=e,this.self()}shapeType(e){return this._shapeType=e,this.self()}style(e){return this._style=e,this.self()}fillColor(e){return this._style.fillColor=e,this.self()}fillOpacity(e){return this._style.fillOpacity=e,this.self()}strokeColor(e){return this._style.strokeColor=e,this.self()}strokeOpacity(e){return this._style.strokeOpacity=e,this.self()}strokeWidth(e){return this._style.strokeWidth=e,this.self()}strokeDash(e){return this._style.strokeDash=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"SHAPE",width:this._width,height:this._height,shapeType:this._shapeType,style:this._style})}}class si extends re{constructor(e){super(e),this._commands=[],this._fillRule="nonzero",this._style={fillColor:"black",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:5,strokeDash:[]},this._item.name="Path",this._item.layer="DRAWING"}commands(e){return this._commands=e,this.self()}fillRule(e){return this._fillRule=e,this.self()}style(e){return this._style=e,this.self()}fillColor(e){return this._style.fillColor=e,this.self()}fillOpacity(e){return this._style.fillOpacity=e,this.self()}strokeColor(e){return this._style.strokeColor=e,this.self()}strokeOpacity(e){return this._style.strokeOpacity=e,this.self()}strokeWidth(e){return this._style.strokeWidth=e,this.self()}strokeDash(e){return this._style.strokeDash=e,this.self()}build(){return Object.assign(Object.assign({},this._item),{type:"PATH",commands:this._commands,fillRule:this._fillRule,style:this._style})}}class ni{constructor(e){this._upload={file:e,grid:{dpi:150,offset:{x:0,y:0}},name:"",rotation:0,scale:{x:1,y:1},text:{richText:[{type:"paragraph",children:[{text:""}]}],plainText:"",style:{padding:8,fontFamily:"Roboto",fontSize:24,fontWeight:400,textAlign:"CENTER",textAlignVertical:"BOTTOM",fillColor:"white",fillOpacity:1,strokeColor:"white",strokeOpacity:1,strokeWidth:0,lineHeight:1.5},type:"PLAIN",width:"AUTO",height:"AUTO"},locked:!1,textItemType:"LABEL",visible:!0}}grid(e){return this._upload.grid=e,this}dpi(e){return this._upload.grid.dpi=e,this}offset(e){return this._upload.grid.offset=e,this}name(e){return this._upload.name=e,this}description(e){return this._upload.description=e,this}rotation(e){return this._upload.rotation=e,this}scale(e){return this._upload.scale=e,this}locked(e){return this._upload.locked=e,this}visible(e){return this._upload.visible=e,this}text(e){return this._upload.text=e,this}textItemType(e){return this._upload.textItemType=e,this}textWidth(e){return this._upload.text.width=e,this}textHeight(e){return this._upload.text.height=e,this}richText(e){return this._upload.text.richText=e,this}plainText(e){return this._upload.text.plainText=e,this}textType(e){return this._upload.text.type=e,this}textPadding(e){return this._upload.text.style.padding=e,this}fontFamily(e){return this._upload.text.style.fontFamily=e,this}fontSize(e){return this._upload.text.style.fontSize=e,this}fontWeight(e){return this._upload.text.style.fontWeight=e,this}textAlign(e){return this._upload.text.style.textAlign=e,this}textAlignVertical(e){return this._upload.text.style.textAlignVertical=e,this}textFillColor(e){return this._upload.text.style.fillColor=e,this}textFillOpacity(e){return this._upload.text.style.fillOpacity=e,this}textStrokeColor(e){return this._upload.text.style.strokeColor=e,this}textStrokeOpacity(e){return this._upload.text.style.strokeOpacity=e,this}textStrokeWidth(e){return this._upload.text.style.strokeWidth=e,this}textLineHeight(e){return this._upload.text.style.lineHeight=e,this}build(){return this._upload}}class ai{constructor(){this._upload={name:"New Scene",fog:{filled:!1,style:{color:"#222222",strokeWidth:5}},grid:{dpi:150,scale:"5ft",style:{lineColor:"LIGHT",lineOpacity:.4,lineType:"DASHED"},measurement:"CHEBYSHEV",type:"SQUARE"},items:[]}}name(e){return this._upload.name=e,this}fogFilled(e){return this._upload.fog.filled=e,this}fogColor(e){return this._upload.fog.style.color=e,this}fogStrokeWidth(e){return this._upload.fog.style.strokeWidth=e,this}gridScale(e){return this._upload.grid.scale=e,this}gridColor(e){return this._upload.grid.style.lineColor=e,this}gridOpacity(e){return this._upload.grid.style.lineOpacity=e,this}gridLineType(e){return this._upload.grid.style.lineType=e,this}gridMeasurement(e){return this._upload.grid.measurement=e,this}gridType(e){return this._upload.grid.type=e,this}items(e){return this._upload.items=e,this}baseMap(e){return this._upload.baseMap=e,this}thumbnail(e){return this._upload.thumbnail=e,this}build(){return this._upload}}const ri=typeof atob=="function",Ce=typeof Buffer=="function",Ye=typeof TextDecoder=="function"?new TextDecoder:void 0;typeof TextEncoder=="function"&&new TextEncoder;const li="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",hi=Array.prototype.slice.call(li),Q=(i=>{let e={};return i.forEach((t,o)=>e[t]=o),e})(hi),ci=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/,L=String.fromCharCode.bind(String),$e=typeof Uint8Array.from=="function"?Uint8Array.from.bind(Uint8Array):i=>new Uint8Array(Array.prototype.slice.call(i,0)),nt=i=>i.replace(/[^A-Za-z0-9\+\/]/g,""),ui=/[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g,di=i=>{switch(i.length){case 4:var e=(7&i.charCodeAt(0))<<18|(63&i.charCodeAt(1))<<12|(63&i.charCodeAt(2))<<6|63&i.charCodeAt(3),t=e-65536;return L((t>>>10)+55296)+L((t&1023)+56320);case 3:return L((15&i.charCodeAt(0))<<12|(63&i.charCodeAt(1))<<6|63&i.charCodeAt(2));default:return L((31&i.charCodeAt(0))<<6|63&i.charCodeAt(1))}},fi=i=>i.replace(ui,di),pi=i=>{if(i=i.replace(/\s+/g,""),!ci.test(i))throw new TypeError("malformed base64.");i+="==".slice(2-(i.length&3));let e,t="",o,s;for(let n=0;n<i.length;)e=Q[i.charAt(n++)]<<18|Q[i.charAt(n++)]<<12|(o=Q[i.charAt(n++)])<<6|(s=Q[i.charAt(n++)]),t+=o===64?L(e>>16&255):s===64?L(e>>16&255,e>>8&255):L(e>>16&255,e>>8&255,e&255);return t},at=ri?i=>atob(nt(i)):Ce?i=>Buffer.from(i,"base64").toString("binary"):pi,yi=Ce?i=>$e(Buffer.from(i,"base64")):i=>$e(at(i).split("").map(e=>e.charCodeAt(0))),mi=Ce?i=>Buffer.from(i,"base64").toString("utf8"):Ye?i=>Ye.decode(yi(i)):i=>fi(at(i)),gi=i=>nt(i.replace(/[-_]/g,e=>e=="-"?"+":"/")),_i=i=>mi(gi(i));function vi(){const e=new URLSearchParams(window.location.search).get("obrref");let t="",o="";if(e){const n=_i(e).split(" ");n.length===2&&(t=n[0],o=n[1])}return{origin:t,roomId:o}}var ze;(function(i){i[i.MOVE=0]="MOVE",i[i.LINE=1]="LINE",i[i.QUAD=2]="QUAD",i[i.CONIC=3]="CONIC",i[i.CUBIC=4]="CUBIC",i[i.CLOSE=5]="CLOSE"})(ze||(ze={}));function Li(i){return i.type==="PATH"}const ve=vi(),g=new wt(ve.origin,ve.roomId),Ei=new ht(g),K=new lt(g),bi=new Kt(g),wi=new Tt(g),Ti=new Gt(g),Oi=new Vt(g),Ai=new Wt(g),ki=new Ht(g),Bi=new Ft(g),Si=new jt(g),Ri=new $t(g),Ci=new qt(g),Ii=new Xt(g),xi=new Qt(g),Ni=new ei(g),Mi={onReady:i=>{g.ready?i():g.once("OBR_READY",()=>i())},get isReady(){return g.ready},viewport:Ei,player:K,party:bi,notification:wi,scene:Ti,contextMenu:Oi,tool:Ai,popover:ki,modal:Bi,action:Si,interaction:Ri,room:Ci,theme:Ii,assets:xi,broadcast:Ni,isAvailable:!!ve.origin};function Di(){return new ti(K)}function Pi(i,e){return new ii(K,i,e)}function Ui(){return new oi(K)}function Gi(){return new si(K)}function Vi(i){return new ni(i)}function Wi(){return new ai}class Hi{static EXTENSIONID="com.battle-system.smoke";static RESETID="com.battle-system.smoke-reset";static SPECTREID="com.battle-system.spectre";static EXTENSIONWHATSNEW="com.battle-system.smoke-whatsnew";static LINETOOLID="com.battle-system.linetool";static POLYTOOLID="com.battle-system.polytool";static ELEVATIONTOOLID="com.battle-system.elevationtool";static BRUSHTOOLID="com.battle-system.brushtool";static PROCESSEDID="com.battle-system.processing";static ARMINDOID="com.armindoflores.fogofwar";static VISIONDEFAULT="30";static LABELSID="com.battle-system.labels";static DICENOTATION=/(\d+)[dD](\d+)(.*)$/i;static DICEMODIFIER=/([+-])(\d+)/;static PARENTHESESMATCH=/\((\d*d\d+\s*([+-]\s*\d+)?)\)/g;static PLUSMATCH=/\s(\+\d+)\s/g;static GRIDID="d9953ba1-f417-431c-8a39-3c3376e3caf0";static SPECTREBROADCASTID="SPECTREBROADCAST";static DOOROPEN=[[0,-65.35400390625,-250],[1,-65.35400390625,-228.27999877929688],[1,-150.29598999023438,-228.27999877929688],[1,-150.29598999023438,205.0780029296875],[1,-118.89300537109375,205.0780029296875],[1,-118.89300537109375,-196.8769989013672],[1,-65.35400390625,-196.8769989013672],[1,-65.35400390625,242.5],[1,142.79598999023438,205.0780029296875],[1,142.79598999023438,143.84298706054688],[1,142.79598999023438,-212.5],[5],[0,-27.06201171875,13.128997802734375],[4,-34.05900573730469,13.128997802734375,-39.73200988769531,5.7480010986328125,-39.73200988769531,-3.35699462890625],[4,-39.73200988769531,-12.46099853515625,-34.05900573730469,-19.841995239257812,-27.06201171875,-19.841995239257812],[4,-20.065017700195312,-19.841995239257812,-14.392013549804688,-12.46099853515625,-14.392013549804688,-3.35699462890625],[4,-14.392013549804688,5.7480010986328125,-20.065017700195312,13.128997802734375,-27.06201171875,13.128997802734375],[5]];static DOORCLOSED=[[0,-178.44699096679688,-250],[1,-178.44699096679688,228.08499145507812],[1,157.114013671875,228.66598510742188],[1,157.114013671875,-250],[5],[0,-146.8909912109375,196.5830078125],[1,-146.8909912109375,-218.44200134277344],[1,125.55398559570312,-218.44200134277344],[1,125.55398559570312,-161.62899780273438],[1,114.77301025390625,-161.62899780273438],[1,114.77301025390625,-207.91400146484375],[1,-136.10699462890625,-207.91400146484375],[1,-136.10699462890625,186.55398559570312],[1,114.77398681640625,186.55398559570312],[1,114.77398681640625,140.26998901367188],[1,125.55499267578125,140.26998901367188],[1,125.55499267578125,197.05499267578125],[5],[0,114.77301025390625,-112.54100036621094],[1,125.55401611328125,-112.54100036621094],[1,125.55401611328125,91.17999267578125],[1,114.77301025390625,91.17999267578125],[5],[0,-84.21299743652344,-10.67999267578125],[4,-84.21299743652344,-1.5319976806640625,-91.63099670410156,5.8860015869140625,-100.781005859375,5.8860015869140625],[4,-109.93099975585938,5.8860015869140625,-117.3489990234375,-1.5319976806640625,-117.3489990234375,-10.67999267578125],[4,-117.3489990234375,-19.829986572265625,-109.93099975585938,-27.24798583984375,-100.781005859375,-27.24798583984375],[4,-91.63101196289062,-27.24798583984375,-84.2130126953125,-19.829986572265625,-84.2130126953125,-10.67999267578125],[5]];static SMOKEHTML=`
    <div id="contextMenu" class="context-menu" style="display: none">
        Assign Owner:
        <ul id="playerListing"></ul>
    </div>
    <div class="visionTitle grid-3">Tokens with Vision Enabled<div class="note" title='Note: GM-owned tokens give universal vision.'>📝</div></div>
    <div id="main-ui" class="grid-main">
        <div id="token_list_div" class="grid-3" padding-bottom: 8px;">
            <table class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 25%;">
                    <col style="width: 35%;">
                </colgroup>
                <tbody id="token_list"></tbody>
            </table>
            <table class="smoke_unit_table" style="padding: 0;">
                <colgroup>
                    <col style="width: 40%;">
                    <col style="width: 25%;">
                    <col style="width: 35%;">
                </colgroup>
                <tbody id="hidden_list" style="display:none;">~ <input type="button" value="Out-of-Sight List: Click to Show" class="settingsButton" style="width: 60% !important;" id="hideListToggle"> ~</tbody>
            </table>
        </div>
    </div>
    `;static SPECTREHTML=`
    <div class="visionTitle grid-3">Tokens with Spectre Enabled
        <div class="note" title='Spectre tokens are only visible to specific players. Enable vision here after it has been Spectred.'>📝</div>
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
                    <col style="width: 40%;">
                    <col style="width: 10%;">
                    <col style="width: 40%;">
                    <col style="width: 10%;">
                </colgroup>
                <tbody>
                    <tr>
                        <td><label for="autodetect_checkbox" title="Automatically detect fog areas based on the current scene's maps">Autodetect Maps</label></td>
                        <td><input type="checkbox" id="autodetect_checkbox" checked></td>
                        <td><div style="display:flex;"><label for="persistence_checkbox" title="Enabling fog persistence will retain the previously viewed areas of the map">Persistence</label><input type="button" id="persistence_reset" value="Reset"></div></td>
                        <td><input type="checkbox" id="persistence_checkbox"></td>
                    </tr>
                    <tr>
                        <td><label for="toggle_ownerlines" title="Show colored rings around to indicate token's vision owner">Owner Highlight</label></td>
                        <td><input type="checkbox" id="toggle_ownerlines" checked></td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <div id="boundry_options" class="grid-3" style="display:none;">
                                <span id="map_size">Boundary Size: 
                                    <input type="number" id="mapWidth" name="Width" min="10" max="500"/> x 
                                    <input type="number" id="mapHeight" name="Height" min="10" max="500"/>
                                    <input type="button" id="mapSubmit" value="Update"/>
                                    &nbsp;&nbsp;&nbsp;
                                </span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><label for="snap_checkbox">Grid Snap</label></td>
                        <td><input type="checkbox" id="snap_checkbox"></td>
                        <td><label for="snap_checkbox">Player-Visible Doors</label></td>
                        <td><input type="checkbox" id="door_checkbox"></td>
                    </tr>
                    <tr>
                        <td colspan="4"><div id="opacityHolder">
                            <label for="fow_checkbox" title="Trailing fog shows an opaque layer for previously viewed areas that players cannot currently view">Trailing Fog + Autohide</label>
                           - <input type="checkbox" id="fow_checkbox"> -
                            <input type="text" style="width: 90px;" maxlength="9" id="fow_color">
                        </div></td>
                    </tr>
                    <tr>
                        <td colspan="2"><input class="settingsButton" type="button" id="convert_button" value="Convert from Dynamic Fog"></td>
                        <td colspan="2"><input class="settingsButton" type="button" id="background_button" value="Unlock Fog Backgrounds"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><input class="settingsButton" type="button" id="unlock_button" value="Unlock Lines" title="Unlock all Obstruction Lines on the Scene"></td>
                        <td colspan="2"><input class="settingsButton" type="button" id="lock_button" value="Lock Lines" title="Lock all Obstruction Lines on the Scene"></td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align:center;">Default Elevation Mapping Layer (0 - 6): <input id="default_mel_depth" type="number" value="0" style="width: 40px;" min="0" max="6" maxlength="1"></td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: center; font-weight: bold;">Tool Options</td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <div id="toolOptions">
                                Width: <input id="tool_width" type="number" value="8" style="width: 40px;" maxlength="2">
                                 - Color: <input id="tool_color" type="text" style="width: 74px;" maxlength="7">
                                 - Style: <select id="tool_style">
                                    <option value="solid" selected>Solid</option>
                                    <option value="dotted">Dotted</option>
                                </select>
                            </div>
                        </td>
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
                        <td colspan="4">Import JSON files with fog data from<br><a href="https://www.dungeonalchemist.com/" target="_blank">Dungeon Alchemist</a> and other tools.</td>
                    </tr>
                    <tr>
                        <td colspan="2" >Format</br><select id="import_format"><option value="scene">UVTT Scene</option><option value="foundry">Foundry</option><option value="uvtt">Universal VTT</option></select></td>
                        <td colspan="2">Alignment</br><select id="map_align" style="width: 120px;"><option selected>Loading..</option></select></td>
                    </tr>
                    <tr>
                        <td colspan="2"><label for="dpi_autodetect" title="Whether or not to automatically detect the DPI of imported data based">DPI Autodetect</label></td>
                        <td><input type="checkbox" id="dpi_autodetect" checked></td>
                        <td><input id="import_dpi" disabled type="text" value="150" style="width: 32px;" maxlength="4"></td>
                    </tr>
                    <tr>
                        <td colspan="2"><input id="import_file" style="width: 190px;" type="file"></td>
                        <td colspan="2"><input style="padding: 6px" type="button" id="import_button" value="Import" disabled></td>
                    </tr>
                </tbody>
                <div id="import_errors" class="grid-3"></div>
            </table>
        </div>`;static DEBUGHTML=`
    <div class="visionTitle" style="display: block; padding-top:8px;">Fog Backgrounds</div>
        <div id="fog_backgrounds" class="grid-3">
    <div id="fog_background_list" class="grid-main" style="border-bottom: 1px solid white; padding-bottom: 8px;"></div>
    </div>
    <div id="debug_div" class="grid-debug">
        <div class="visionTitle grid-2" style="text-align: center; margin-top: 16px">Performance Info</div>
        <div>Stage 1: Fog Shapes</div><div id="stage1">N/A</div>
        <div>Stage 2: Player Vision</div><div id="stage2">N/A</div>
        <div>Stage 3: Vision Ranges</div><div id="stage3">N/A</div>
        <div>Stage 4: Persistence+Trailing</div><div id="stage4">N/A</div>
        <div>Stage 5: OBR Scene</div><div id="stage5">N/A</div>
        <div>Stage 6: Autohide</div><div id="stage6">N/A</div>
        <div>Cache hits/misses</div><div><span id="cache_hits">?</span>/<span id=cache_misses>?</span></div>
    </div>`;static MARKDOWNHELP=`
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
        <li><a href="#ui-info">Info Panel</a></li>
        <li><a href="#ui-issue">Issue Indicator</a></li>
        <li><a href="#ui-switch">Processing Switch</a></li>
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
      </ul></li>
      <li><a href="#smoke-advanced">Smoke: Advanced Features</a>
      <ul>
        <li><a href="#smoke-light">Using Light Sources</a></li>
        <li><a href="#smoke-doors"> Using Doors</a></li>
        <li><a href="#smoke-autohide"> Using Auto-Hide</a></li>
        <li><a href="#smoke-customfog"> Using Custom Fog Backgrounds</a></li>
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
1. Add an IMAGE to the MAP layer, and in settings make sure Autodetect Maps is enabled OR leave Autodetect Maps off, and only draw within the pink-dashed boundary.
2. Click the 'Glasses' icon in the toolbar, and select the Line tool.  Draw to your heart's content.
3. Add a token to the scene. On that token, through the context-menu, 'Enable Vision'.
4. (Optional: Assign ownership of that token to a specific player, so they can only see through that token.)
5. Click the checkbox at the top of Smoke&Spectre to turn on processing.
6. Done!

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
The options next to a token's name are;
1. Viewing Range: Set the desired radius for a token's vision range.
2. Infinite Vision: Give a token 'infinite' viewing range.
3. Light Source: Designate a token to be a Light Source, which will extend a character's vision range (more in the Light Sources section).
4. Blind Vision: So a token no longer has vision.
5. Filter Away: Move a token to the 'Out of Sight List'. (This is just an 'out of the way' area, if you happen to have a lot of tokens in the list that do not really require your attention - like 50 torches)

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
1. Auto-Detect Maps: When enabled, Smoke will looks for images on the Map layer of your scene and determine the bounds for calculations based on the images position.  If you have multiple maps, it will make a box around all of them and base the calculations on that.  When disabled, Smoke will add a Boundary Box to the scene and constrain it's calculations to that.  You can stretch the box using the OBR tools or set the dimensions in the Height/Width boxes that appear when the setting is disabled.
2. Persistence: When enabled, Smoke will leave area 'unfogged' that your tokens have passed through.
3. Persistence Reset: This will clear all of the fog shapes in the area your token has walked through.
4. Trailing Fog: When used with Persistence, Smoke will 'semi-fog' the area that your token's have passed through but are not within active viewing range.
5. Trailing Fog: Auto-Hide: When this setting is enabled, a token that has 'Auto-hide' turned on will disappear when inside the semi-fogged areas of Trailing Fog.
6. Trailing Fog: Color: This allows you to select the color and opacity of the trailing fog on your map.
7. Grid Snap: When enabled, the Smoke's drawing tools will snap to the grid points when drawing. (Note: You can hold CTRL while drawing to temporarily disable this.)
8. Player-Visible Doors: When enabled, players will be able to see any doors you have enabled on the map. When disabled, players cannot see any door icons.
9. Convert from Dynamic Fog: If you were using the basic Dynamic Fog extension before I took over, this would convert your scene items over.
10. Unlock Fog Backgrounds: If you have Converted a Custom Fog Background in the scene, this will unlock that image so that you can manipulate it again.
11. Unlock/Lock Lines: By default, when you draw an obstruction it will be auto-locked to make sure they are not moved on accident.  Use these buttons to lock/unlock all lines so that they can be manipulated again. 
12. Default Elevation Mapping: This will determine the 'base level' a token/wall is at when using Elevation Mapping.  Leave this setting at 0 if you are not using Elevation Mapping.
13. Tool Options: This is for customizing the style of the lines that are created when drawing with the Obstruction Tools.
14. Import: Smoke is able to accept the UVTT format for building a scene for you. Select the map and Import, and the map image, obstructions, doors and light sources will be created in a new scene.

#### <a id="ui-info"></a>4. Info Panel
As Owlbear Rodeo runs in your browser, as does Smoke. All calculations are made on your device.  This window will output performance times to give you an idea of how processing is going.
Maps with a massive amount of obstructions (1000+) can take a little longer to process on a slower machine, but with recent updates the time difference should be negligible.
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-info.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-issue"></a>5. Issue Indicator
This little light is an early-warning if someone is having problems processing on the scene.
This could be from something as simple as not having a token that they can see through, or the extension having issues running on their machine.  You can click this indicator to see which player is having issues to narrow it down.
Green means things are good.
Yellow means nothing is started/enabled, but no reason to worry.
Red means something went wrong.
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-switch"></a>6. Processing Switch
This checkbox turns on/off the Fog processing for the extension. When turned off, you don't need to worry about any vision calculations or fog fills.
Though be sure to turn it on when you are ready to start using Dynamic Fog.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-tools"></a>7. Drawing Tools
Added to the OBR Toolbar are Smoke's drawing tools.
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)

1. Obstruction Polygon: This tool is slightly different, in that it will create a closed shape - but the inside will be visible.  This is useful for items like 'Large Boulders' on a map, where the player can see that it's a boulder, but they cannot see past it.
2. Obstruction Line: This is your default tool for making an obstruction. Just click in your scene to create points for the line, and select Finish (or push Enter) when you're done.
3. Obstruction Paintbrush: This tool creates obstructions by the grid. Click and drag to fill in the desired area, and when you let go walls will be created around the shape you have painted. This is useful for maps that are blocky and/or very square with angular hallways.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>8. Drawing Conversions
If you prefer to use the base Owlbear Rodeo drawing tools, you can.  All shapes created via the default tools can be converted into an Obstruction.  Just right-click the shape and select 'Convert to Obstruction'.
This will remove the shape/line/drawing as it was, and recreate it as an Obstruction object.
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-convert.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="ui-convert"></a>9. Elevation Tools
Also on the Smoke Toolbar are the Elevation Mapping tools;
![gmview view](https://battle-system.com/owlbear/smoke-docs/ui-tools.webp)
1. Elevation Layers: Elevation Mapping Layers 1-5 let you draw a shape at that elevation level, and all points (from obstructions or tokens) when processed will be drawn with that depth in mind.  A quick example, if you draw an obstruction around a house on your map - and then draw around the house with Elevation 1 - you won't be able to see around/above the house when on the ground, but if you put the token on the house it will be able to see everywhere.
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
<i> Note: You are able to change how the default vision works for a line by going to the context-menu for a line and changing between Two-Sided, One-Sided Left and One-sided Right.  The icon that is CURRENTLY being shown is the state the line is currently in. Refer to the icon for a simple idea of how it works - where the X is in relation to the line, is where you cannot see through it if the token is in that spot.</i>

You can also toggle an Obstruction Line's ability to block vision by clicking 'Disable/Enable Vision Line' in the context menu.
In addition to that, you can also toggle a line into a 'Door'.  Which works similar to the Vision toggle, but adds a door icon. More on this in the Doors section.

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
That said, there are pros and cons.
Pro: All contiguous parallel lines will be joined together, reducing the overall amount of obstruction lines in the scene. (So less processing!)
Con: Since all lines are joined, it can be more difficult to create a door in a long wall - because the wall will be one slid piece.
For this specific issue, adding a Door, it might be beneficial to 'bump out' a square where the door will be, so the line will be separate there.
<i>Note: Alternatively, there are other extensions out there that allow more advanced line manipulation (cutting, joining, segmenting) that you could use to alter the lines.  Feel free to use those to edit your scene, too.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Using Tokens <a id="smoke-tokens" name="smoke-tokens">

#### <a id="smoke-vision"></a>1. Changing a token's vision range
In the Smoke Panel, once a token has had it's Vision Enabled, the token will appear on the list with some options. The default radius is 30, but you can change this to whatever suits your needs.![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-vision.webp)
If you select the 'Infinite' toggle, it will over-ride the radius.
If you select the 'Blind' toggle, it will disable vision for the token.
<i>Note: The Light Source toggle should not be used for character tokens. You'll just confuse yourself for using it on a character if you are unsure.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-vision"></a>2. Who can see this token's view?
When a token is added to the scene, the OWNER of that token is the person who added it to the scene. Normally this is the GM.
When vision is enabled on a token (and it's owner is the GM) every player is able to see the vision for this token.  This is useful if you do not want everyone in your game to have their own personalized vision based on their token.
If you do want people to only see from the viewpoint of their token, you want to make sure they are the owner of that token.

To speed up the flow of assigning ownership, you have two options:
1. Let players drag in their own tokens. If they brought it in, they're the owner! Then just enable vision on it.
2. Right-click a token's name in the Smoke Panel, and you are able to assign an owner to a token from a list of **players currently in the room**.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-player.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>
  
## Smoke: Advanced Features <a id="smoke-advanced" name="smoke-advanced">

#### <a id="smoke-light"></a>1. Using Light Sources
When you turn a token into a 'Light Source', it will largely look the same unless something is obstructing the full view of that light source.
What a light source does, is stop a token from giving general vision in it's area - and instead only give vision based on what a token WITH vision can see of it.

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light.webp)
This is easiest to see with narrow hallways.  If you add a light source to a small room, and then have a narrow hallway between it and a character token with vision, you will see that the vision the torch gives is constricted.

If you're looking to have your characters explore a dark area where they have to hold torches, it's a simple task.   Create torch tokens, enable vision, set them as a light source and then attach them to the characters.  Your other players will then be able to see each other when the light of the torch is not behind something obstructing it.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-light2.webp)
<i>Given that light sources are not needed to be manipulated often, it's often better to move them to the 'Out-of-Sight' list, to clean up the clutter in the Smoke panel.</i>

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-doors"></a>2. Using Doors
In the context-menu for an Obstruction Line, there is an option for 'Enable Door'.
Enabling a door will draw a 'Door' icon on top of that line, which can be toggled to turn on/off the obstruction properties for that line (thus opening the door, allowing people to see through).
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-door.webp)
You can 'disable' a door and remove the door icon through the same process, selecting 'Disable Door'.
You can toggle the opening of a door in two ways;
1. Double click the door icon.
2. Select 'Open Door' on the context menu

By default, only a GM can see doors on a map.  If you would like your players to be able to see doors, select the option in the Settings panel.
If your players are a little click-happy, you can 'Lock Door' to stop players from being able to toggle them open.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-autohide"></a>3. Using Auto-hide
If you have 'Trailing Fog + Autohide' enabled, there will be an extra option in the context menu for tokens. Auto-Hide.
Turning this on will make token's 'disappear' when they are outside of viewable range for a token and inside the trailing fog area.
Trailing fog can be useful for areas that were explored and you want your player's to have some recollection of, but sometimes you don't want them to actively see everything that's happening in a room they are not currently in.
This option is for that scenario.

<p align="right">(<a href="#smoke">back to top</a>)</p>

#### <a id="smoke-customfog"></a>4. Using Custom Fog
Sometimes flat-colored fog isn't exactly what you're going for.  If you want things to get a little fancy, Custom Fog is a great feature to spruce things up.  It does require a little more process to get going though. Which is setting up a separate fog image to overlay on your map.
![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog1.webp)
The basic steps are;
1. Make sure your Custom Fog image is on the Map layer.
2. Overlay the Custom Fog image on top of your regular map.
3. On the context-menu for the Custom Fog image, select 'Convert to Fog Background'.
4. Done!

![gmview view](https://battle-system.com/owlbear/smoke-docs/smoke-customfog2.webp)
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Smoke: Elevation Mapping <a id="smoke-elevation" name="smoke-elevation">
Elevation Mapping allows you to add some depth to your 2D Scene, by assigning 'areas' to the map where certain points/tokens are higher than others.

#### <a id="smoke-elevation-map"></a>1. How it works
When setting up elevation, you have a few layers to play with. (I've limited this to six to keep things simple, but technically it can be expanded.)
The default layer - 0 - has the special property of ignoring elevation. When you are using Smoke & Spectre without any elevation mappings, it's using layer 0.  *Any obstructions on layer 0 cannot be seen past, no matter what layer the token is on!*
With layers 1-6, this is where the calculations become different. If you have a token and an obstruction both within a Layer 1 mapping, the token can see PAST the obstruction!
But if you have a token with a Layer 1 mapping, and an obstruction within a Layer 2 Mapping, the player CANNOT see past the obstruction. Because the obstruction is at a higher depth.

Now for an active example;
Here is a token on an island map. Their vision is not obstructed at all. I have toggled on the Elevation Mapping View so I can use the tools.  I have used Elevation Mapping Layer-1 tool to surround the area I'm going to be working in. (This is to make sure no obstructions I draw within here end up on Elevation Mapping Layer-0, and thus always block vision.)
![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-1.webp)

Next, I draw obstruction lines around the items I want to block vision. (This screenshot has the Elevation Mapping View toggled off, so that you can see easier.)
Notice how the obstruction lines don't block a single thing.  This is because the token AND the obstructions all exist within the Elevation Mapping Layer-1 area.  So they are all at the same depth.
![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-2.webp)

With the base work done, I want to make sure my rocks are higher up - so that I can't see past them when I'm on the ground, and if I stood upon them - I can see the top of them and everything below.  So I'm going to use the Elevation Mapping Layer-1 Tool and draw an area around my rocks.
I draw my mappings AROUND the obstructions, fairly closely. This is because if a player is standing CLOSE to the object, I do not want them to accidentally be within that mapping.
<i>Note: You can layer mappings, and the highest layer will always take priority.</i>

Notice that while on the beach area, I can no longer see past the rocks.![example elevation view](https://battle-system.com/owlbear/smoke-docs/smoke-elevation-3.webp)
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

#### <a id="spectre-limits"></a>3. How many things can be Spectred?
Fourteen items per scene.  14. That's it.
<p align="right">(<a href="#smoke">back to top</a>)</p>

## Support

If you have questions, please join the [Owlbear Rodeo Discord](https://discord.gg/UY8AXjhzhe).

Or you can reach out to me at manuel@battle-system.com.
You can also support these projects at the [Battle-System Patreon](https://www.patreon.com/battlesystem).
<p align="right">(<a href="#smoke">back to top</a>)</p>`}export{Hi as C,Mi as O,Gi as a,Ui as b,Pi as c,Vi as d,Wi as e,Di as f,ze as g,Li as i};
