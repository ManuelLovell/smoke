import{C as i}from"./constants-0bc65094.js";class s{userId;userName;userColor;role;items;ghosts;players;metadata;gridDpi;gridScale;gridSnap;fog;ready;snap;initialized;torchActive;lastReset;constructor(){this.userId="",this.userName="",this.userColor="",this.role="PLAYER",this.items=[],this.players=[],this.ghosts=[],this.metadata={},this.gridDpi=0,this.gridScale=0,this.gridSnap=10,this.fog={filled:!1,style:{color:"white",strokeWidth:0}},this.ready=!1,this.snap=!0,this.initialized=!1,this.torchActive=!1,this.lastReset=""}}const t=new s;function r(a){return a.layer=="MAP"&&(a.metadata[`${i.EXTENSIONID}/isBackgroundImage`]||a.metadata[`${i.ARMINDOID}/isBackgroundImage`])}function o(a){return a.metadata[`${i.EXTENSIONID}/isVisionFog`]||a.metadata[`${i.ARMINDOID}/isVisionFog`]}function I(a){return a.metadata[`${i.EXTENSIONID}/isIndicatorRing`]||a.metadata[`${i.ARMINDOID}/isIndicatorRing`]}function d(a){return a.metadata[`${i.EXTENSIONID}/isVisionLine`]||a.metadata[`${i.ARMINDOID}/isVisionLine`]}function N(a){return a.metadata[`${i.EXTENSIONID}/isVisionLine`]&&!a.metadata[`${i.EXTENSIONID}/disabled`]||a.metadata[`${i.ARMINDOID}/isVisionLine`]&&!a.metadata[`${i.ARMINDOID}/disabled`]}function n(a){return(a.layer=="CHARACTER"||a.layer=="ATTACHMENT")&&(a.metadata[`${i.EXTENSIONID}/hasVision`]||a.metadata[`${i.ARMINDOID}/hasVision`])}function u(a){return(a.layer=="CHARACTER"||a.layer=="ATTACHMENT")&&(a.metadata[`${i.EXTENSIONID}/hasVision`]||a.metadata[`${i.ARMINDOID}/hasVision`])&&!a.metadata[`${i.EXTENSIONID}/visionBlind`]}function E(a){return(a.layer=="CHARACTER"||a.layer=="ATTACHMENT")&&a.createdUserId==t.userId&&(a.metadata[`${i.EXTENSIONID}/hasVision`]||a.metadata[`${i.ARMINDOID}/hasVision`])&&!a.metadata[`${i.EXTENSIONID}/visionBlind`]}function c(a){return a.layer=="DRAWING"&&(a.metadata[`${i.EXTENSIONID}/isBackgroundImage`]||a.metadata[`${i.ARMINDOID}/isBackgroundImage`])}function D(a){return a.metadata[`${i.EXTENSIONID}/isTrailingFog`]}function h(a){return a.metadata[`${i.EXTENSIONID}/isTrailingFog`]||a.metadata[`${i.EXTENSIONID}/isVisionFog`]||a.metadata[`${i.ARMINDOID}/isVisionFog`]||a.metadata[`${i.EXTENSIONID}/isIndicatorRing`]}function T(a){return a.metadata[`${i.EXTENSIONID}/isBrushSquare`]}function g(a){return a.metadata[`${i.EXTENSIONID}/visionTorch`]}function l(a){return a.layer=="CHARACTER"&&!n(a)&&a.metadata[`${i.EXTENSIONID}/hasAutohide`]===!0}export{u as a,E as b,N as c,l as d,c as e,h as f,I as g,o as h,g as i,D as j,r as k,d as l,T as m,n,t as s};
