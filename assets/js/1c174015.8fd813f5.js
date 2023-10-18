"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[15036],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>h});var o=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},i=Object.keys(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(o=0;o<i.length;o++)n=i[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var a=o.createContext({}),l=function(e){var t=o.useContext(a),n=t;return e&&(n="function"==typeof e?e(t):u(u({},t),e)),n},d=function(e){var t=l(e.components);return o.createElement(a.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},p=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,a=e.parentName,d=s(e,["components","mdxType","originalType","parentName"]),c=l(n),p=r,h=c["".concat(a,".").concat(p)]||c[p]||m[p]||i;return n?o.createElement(h,u(u({ref:t},d),{},{components:n})):o.createElement(h,u({ref:t},d))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,u=new Array(i);u[0]=p;var s={};for(var a in t)hasOwnProperty.call(t,a)&&(s[a]=t[a]);s.originalType=e,s[c]="string"==typeof e?e:r,u[1]=s;for(var l=2;l<i;l++)u[l]=n[l];return o.createElement.apply(null,u)}return o.createElement.apply(null,n)}p.displayName="MDXCreateElement"},43436:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>a,contentTitle:()=>u,default:()=>m,frontMatter:()=>i,metadata:()=>s,toc:()=>l});var o=n(87462),r=(n(67294),n(3905));const i={id:"TouchButtonOnTouchedAction",title:"Enumeration: TouchButtonOnTouchedAction",sidebar_label:"TouchButtonOnTouchedAction",sidebar_position:0,custom_edit_url:null},u=void 0,s={unversionedId:"garminsdk/enums/TouchButtonOnTouchedAction",id:"garminsdk/enums/TouchButtonOnTouchedAction",title:"Enumeration: TouchButtonOnTouchedAction",description:"Actions that TouchButton can take in response to being touched.",source:"@site/docs/garminsdk/enums/TouchButtonOnTouchedAction.md",sourceDirName:"garminsdk/enums",slug:"/garminsdk/enums/TouchButtonOnTouchedAction",permalink:"/msfs-avionics-mirror/docs/garminsdk/enums/TouchButtonOnTouchedAction",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TouchButtonOnTouchedAction",title:"Enumeration: TouchButtonOnTouchedAction",sidebar_label:"TouchButtonOnTouchedAction",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TouchButtonHoldEndReason",permalink:"/msfs-avionics-mirror/docs/garminsdk/enums/TouchButtonHoldEndReason"},next:{title:"TrafficAltitudeModeSetting",permalink:"/msfs-avionics-mirror/docs/garminsdk/enums/TrafficAltitudeModeSetting"}},a={},l=[{value:"Enumeration Members",id:"enumeration-members",level:2},{value:"Hold",id:"hold",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"Ignore",id:"ignore",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Press",id:"press",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"Prime",id:"prime",level:3},{value:"Defined in",id:"defined-in-3",level:4}],d={toc:l},c="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(c,(0,o.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Actions that ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/TouchButton"},"TouchButton")," can take in response to being touched."),(0,r.kt)("h2",{id:"enumeration-members"},"Enumeration Members"),(0,r.kt)("h3",{id:"hold"},"Hold"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Hold")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Hold"')),(0,r.kt)("p",null,"The button becomes held. The button will remain held until the mouse button is released, the mouse leaves the\nbutton, mouse events are inhibited by dragging, or the button becomes disabled."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/touchbutton/TouchButton.tsx:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"ignore"},"Ignore"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Ignore")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Ignore"')),(0,r.kt)("p",null,"The button takes no action as if it were disabled."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/touchbutton/TouchButton.tsx:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"press"},"Press"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Press")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Press"')),(0,r.kt)("p",null,"The button is immediately pressed once. The button does not enter the primed state. Holding down the mouse button\nwill not trigger additional presses."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/touchbutton/TouchButton.tsx:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"prime"},"Prime"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"Prime")," = ",(0,r.kt)("inlineCode",{parentName:"p"},'"Prime"')),(0,r.kt)("p",null,"The button becomes primed. A primed button will be pressed if and when the mouse button is released. If the mouse\nleaves the button before the mouse button is released, the button becomes un-primed and is not pressed."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"garminsdk/components/touchbutton/TouchButton.tsx:13"))}m.isMDXComponent=!0}}]);