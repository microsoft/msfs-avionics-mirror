"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[4693],{3905:(e,t,n)=>{n.d(t,{Zo:()=>o,kt:()=>c});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var p=a.createContext({}),s=function(e){var t=a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},o=function(e){var t=s(e.components);return a.createElement(p.Provider,{value:t},e.children)},k="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,p=e.parentName,o=d(e,["components","mdxType","originalType","parentName"]),k=s(n),m=r,c=k["".concat(p,".").concat(m)]||k[m]||u[m]||i;return n?a.createElement(c,l(l({ref:t},o),{},{components:n})):a.createElement(c,l({ref:t},o))}));function c(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,l=new Array(i);l[0]=m;var d={};for(var p in t)hasOwnProperty.call(t,p)&&(d[p]=t[p]);d.originalType=e,d[k]="string"==typeof e?e:r,l[1]=d;for(var s=2;s<i;s++)l[s]=n[s];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},58131:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>u,frontMatter:()=>i,metadata:()=>d,toc:()=>s});var a=n(87462),r=(n(67294),n(3905));const i={id:"index.SoundServer",title:"Class: SoundServer",sidebar_label:"SoundServer",custom_edit_url:null},l=void 0,d={unversionedId:"framework/classes/index.SoundServer",id:"framework/classes/index.SoundServer",title:"Class: SoundServer",description:"index.SoundServer",source:"@site/docs/framework/classes/index.SoundServer.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.SoundServer",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.SoundServer",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.SoundServer",title:"Class: SoundServer",sidebar_label:"SoundServer",custom_edit_url:null},sidebar:"sidebar",previous:{title:"SoundPublisher",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.SoundPublisher"},next:{title:"SoundServerController",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.SoundServerController"}},p={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"active",id:"active",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"controlSub",id:"controlsub",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"isAwake",id:"isawake",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"publisher",id:"publisher",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"queued",id:"queued",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"DEFAULT_TIMEOUT",id:"default_timeout",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"advancePacket",id:"advancepacket",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"cleanupPacket",id:"cleanuppacket",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"init",id:"init",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"interruptPacket",id:"interruptpacket",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"killAllPackets",id:"killallpackets",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"killPacket",id:"killpacket",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"onSoundEnd",id:"onsoundend",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"playPacket",id:"playpacket",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"playSound",id:"playsound",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"queuePacket",id:"queuepacket",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"sleep",id:"sleep",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"startPacket",id:"startpacket",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-19",level:4},{value:"startSound",id:"startsound",level:3},{value:"Parameters",id:"parameters-10",level:4},{value:"Returns",id:"returns-12",level:4},{value:"Defined in",id:"defined-in-20",level:4},{value:"stopAllPackets",id:"stopallpackets",level:3},{value:"Returns",id:"returns-13",level:4},{value:"Defined in",id:"defined-in-21",level:4},{value:"stopPacket",id:"stoppacket",level:3},{value:"Parameters",id:"parameters-11",level:4},{value:"Returns",id:"returns-14",level:4},{value:"Defined in",id:"defined-in-22",level:4},{value:"wake",id:"wake",level:3},{value:"Returns",id:"returns-15",level:4},{value:"Defined in",id:"defined-in-23",level:4},{value:"getSoundSequence",id:"getsoundsequence",level:3},{value:"Parameters",id:"parameters-12",level:4},{value:"Returns",id:"returns-16",level:4},{value:"Defined in",id:"defined-in-24",level:4}],o={toc:s},k="wrapper";function u(e){let{components:t,...n}=e;return(0,r.kt)(k,(0,a.Z)({},o,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".SoundServer"),(0,r.kt)("p",null,"A server which plays and manages sounds. Commands to start or stop playing sounds can be sent to the server via the\nevent bus."),(0,r.kt)("p",null,"The server plays sounds as ",(0,r.kt)("em",{parentName:"p"},"packets"),". Each sound packet consists of a string key and zero or more ",(0,r.kt)("em",{parentName:"p"},"sound atoms")," that\nare played in sequence. Each sound atom represents a single playable sound file from within the sim. Sound packets\ncan be played as a one-shot or be looped continuously. Only one packet with a given key can be played at a time.\nQueueing of packets with the same key is supported."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new SoundServer"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"bus"),")"),(0,r.kt)("p",null,"Creates a new instance of SoundServer. The server is initially awake after being created."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"bus")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,r.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The event bus.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:178"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"active"},"active"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"active"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"SoundPacketEntry"),">"),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:168"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventBus"},(0,r.kt)("inlineCode",{parentName:"a"},"EventBus"))),(0,r.kt)("p",null,"The event bus."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:178"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"controlsub"},"controlSub"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"controlSub"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.EventSubscriber"},(0,r.kt)("inlineCode",{parentName:"a"},"EventSubscriber")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.SoundServerControlEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"SoundServerControlEvents")),">"),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:165"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"isawake"},"isAwake"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"isAwake"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")," = ",(0,r.kt)("inlineCode",{parentName:"p"},"true")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:172"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"publisher"},"publisher"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"publisher"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Publisher"},(0,r.kt)("inlineCode",{parentName:"a"},"Publisher")),"<",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.SoundServerEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"SoundServerEvents")),">"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:166"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"queued"},"queued"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"queued"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Map"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"string"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"SoundPacketEntry"),"[]",">"),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:170"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"default_timeout"},"DEFAULT","_","TIMEOUT"),(0,r.kt)("p",null,"\u25aa ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"DEFAULT","_","TIMEOUT"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"10000")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:163"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"advancepacket"},"advancePacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"advancePacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"entry"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Attempts to advance a packet to the next sound atom in its sequence. If the end of the sequence is reached, the\npacket will loop to the beginning if it is continuous. Otherwise it will finish playing."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"entry")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"SoundPacketEntry")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The entry of the packet to advance.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:437"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cleanuppacket"},"cleanupPacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"cleanupPacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"entry"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Finishes playing a packet and automatically starts playing the packet queued behind the finished packet, if one\nexists."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"entry")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"SoundPacketEntry")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The entry of the packet to finish.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:466"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"init"},"init"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"init"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,r.kt)("p",null,"Waits until the sim has entered the in-game state and initializes this server. Once initialized, this server will\nrespond to commands over the event bus."),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Promise"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"void"),">"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:188"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"interruptpacket"},"interruptPacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"interruptPacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"packet"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Plays a sound packet at the earliest opportunity. If there is no currently playing packet with the same key, it\nwill begin playing immediately. Otherwise, all queued packets with the same key are cleared, the existing packet\nwill be stopped the next time one of its sound atoms finishes playing, and the new packet will begin playing at\nthat time."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"packet")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#soundpacket"},(0,r.kt)("inlineCode",{parentName:"a"},"SoundPacket")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The packet to play.")))),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:280"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"killallpackets"},"killAllPackets"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"killAllPackets"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Stops all packets from playing the next time one of their sound atoms finishes playing and clears all queued\npackets."),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:385"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"killpacket"},"killPacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"killPacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Stops a packet from playing the next time one of its sound atoms finishes playing and clears any packets queued\nbehind it."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"key")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The key of the packet to kill.")))),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:352"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"onsoundend"},"onSoundEnd"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"onSoundEnd"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"id"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"A callback method that responds to when the sim notifies the JS instrument that a sound file has stopped playing.\nThis method needs to be manually called for ",(0,r.kt)("inlineCode",{parentName:"p"},"SoundServer")," to function properly."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"id")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Name_Z")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The ID of the sound file that stopped playing.")))),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:215"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"playpacket"},"playPacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"playPacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"packet"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Plays a sound packet if and only if there is no currently playing packet with the same key."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"packet")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#soundpacket"},(0,r.kt)("inlineCode",{parentName:"a"},"SoundPacket")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The packet to play.")))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:263"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"playsound"},"playSound"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"playSound"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"id"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Plays a non-continuous sound packet consisting of a single sound atom and whose key matches the ID of the sound\natom."),(0,r.kt)("h4",{id:"parameters-7"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"id")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The ID of the sound atom to play.")))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:402"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"queuepacket"},"queuePacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"queuePacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"packet"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Queues a sound packet. The queued packet will immediately start playing if there is no currently playing packet\nwith the same key. Otherwise it will be queued to play once all currently playing and previously queued packets\nwith the same key have finished playing."),(0,r.kt)("h4",{id:"parameters-8"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"packet")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#soundpacket"},(0,r.kt)("inlineCode",{parentName:"a"},"SoundPacket")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The packet to queue.")))),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:300"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"sleep"},"sleep"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"sleep"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Puts this server to sleep. This will stop all currently playing sound packets at the earliest opportunity and\nclears all queued packets. While asleep, this server will not respond to any commands."),(0,r.kt)("h4",{id:"returns-10"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:247"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"startpacket"},"startPacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"startPacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"entry"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Starts playing a packet from the beginning of its sequence."),(0,r.kt)("h4",{id:"parameters-9"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"entry")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"SoundPacketEntry")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The entry of the packet to start playing.")))),(0,r.kt)("h4",{id:"returns-11"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:418"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"startsound"},"startSound"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"startSound"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"id"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Plays a continuous sound packet consisting of a single sound atom and whose key matches the ID of the sound atom."),(0,r.kt)("h4",{id:"parameters-10"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"id")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The ID of the sound atom to play.")))),(0,r.kt)("h4",{id:"returns-12"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:410"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"stopallpackets"},"stopAllPackets"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"stopAllPackets"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Stops all currently playing continuous packets from looping the next time their sequences finish and clears all\nqueued packets."),(0,r.kt)("h4",{id:"returns-13"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:369"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"stoppacket"},"stopPacket"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"stopPacket"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"key"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Stops a continuous packet from looping the next time its sequence finishes and clears any packets queued behind\nit."),(0,r.kt)("h4",{id:"parameters-11"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"key")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"string")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The key of the packet to stop.")))),(0,r.kt)("h4",{id:"returns-14"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:334"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"wake"},"wake"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"wake"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Wakes this server. Once awake, this server will respond to commands."),(0,r.kt)("h4",{id:"returns-15"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:233"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getsoundsequence"},"getSoundSequence"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"getSoundSequence"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"packet"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Name_Z"),"[]"),(0,r.kt)("p",null,"Gets a sound atom sequence as an array of ",(0,r.kt)("inlineCode",{parentName:"p"},"Name_Z")," objects from a sound packet."),(0,r.kt)("h4",{id:"parameters-12"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"packet")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#soundpacket"},(0,r.kt)("inlineCode",{parentName:"a"},"SoundPacket")),">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The packet defining the sound atom sequence.")))),(0,r.kt)("h4",{id:"returns-16"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Name_Z"),"[]"),(0,r.kt)("p",null,"The sound atom sequence defined by a packet, as an array of ",(0,r.kt)("inlineCode",{parentName:"p"},"Name_Z")," objects."),(0,r.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,r.kt)("p",null,"src/sdk/utils/sound/SoundServer.ts:495"))}u.isMDXComponent=!0}}]);