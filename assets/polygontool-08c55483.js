import{O as a,C as d}from"./bsConstants-0c7edbdf.js";/* empty css              */a.onReady(async()=>{const s=document.getElementById("buttonContainer");s.style.placeContent="space-evenly",s.style.display="flex",s.style.width="100%";const t=document.createElement("input");t.id="endLine",t.classList.add("end-line"),t.classList.add("mysteryButton"),t.style.paddingLeft="6px",t.style.paddingRight="6px",t.value="Finish Polygon",t.type="button",t.onclick=async()=>{await a.broadcast.sendMessage(`${d.EXTENSIONID}/POLYGONEVENT`,"FINISH",{destination:"LOCAL"})};const n=document.createElement("input");n.id="endLine",n.classList.add("end-line"),n.classList.add("mysteryButton"),n.style.paddingLeft="6px",n.style.paddingRight="6px",n.value="Cancel Polygon",n.type="button",n.onclick=async()=>{await a.broadcast.sendMessage(`${d.EXTENSIONID}/POLYGONEVENT`,"FINISH",{destination:"LOCAL"})};const e=document.createElement("input");e.id="undoLine",e.classList.add("end-line"),e.classList.add("mysteryButton"),e.style.paddingLeft="6px",e.style.paddingRight="6px",e.value="Undo Point",e.type="button",e.onclick=async()=>{await a.broadcast.sendMessage(`${d.EXTENSIONID}/POLYGONEVENT`,"UNDO",{destination:"LOCAL"})},s.appendChild(t),s.appendChild(n),s.appendChild(e)});
