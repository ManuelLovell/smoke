import{O as o,C as p}from"./constants-0bc65094.js";/* empty css                  */import{s as n,a as h}from"./itemFilters-6ab6030f.js";o.onReady(async()=>{const i=document.getElementById("list"),r=await o.party.getPlayers(),a=n.items.filter(e=>h(e));for(const e of r){const c=a.filter(m=>m.createdUserId===n.userId),s=document.createElement("li"),t=e.metadata[`${p.EXTENSIONID}/processed`]===!0,l="is fine.",d=c.length>0?"has an Error or is still processing.":"has no Tokens with vision enabled.";s.innerHTML=`<b>${e.name}</b> ${t?l:d}`,s.style.color=t?"":"red",i.appendChild(s)}});
