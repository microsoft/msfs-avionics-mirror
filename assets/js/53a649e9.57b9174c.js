"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[37376],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>f});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},m=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),u=p(n),d=a,f=u["".concat(s,".").concat(d)]||u[d]||c[d]||i;return n?r.createElement(f,o(o({ref:t},m),{},{components:n})):r.createElement(f,o({ref:t},m))}));function f(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},34452:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={sidebar_label:"Instrument Setup",sidebar_position:2},o="G3000 Instrument Setup",l={unversionedId:"g3000/instrument-setup",id:"g3000/instrument-setup",title:"G3000 Instrument Setup",description:"Choosing Screens",source:"@site/docs/g3000/instrument-setup.md",sourceDirName:"g3000",slug:"/g3000/instrument-setup",permalink:"/msfs-avionics-mirror/docs/g3000/instrument-setup",draft:!1,tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_label:"Instrument Setup",sidebar_position:2},sidebar:"sidebar",previous:{title:"Overview",permalink:"/msfs-avionics-mirror/docs/g3000/overview"},next:{title:"panel.xml Basics",permalink:"/msfs-avionics-mirror/docs/g3000/panel-xml-basics"}},s={},p=[{value:"Choosing Screens",id:"choosing-screens",level:2},{value:"<code>panel.cfg</code>",id:"panelcfg",level:2}],m={toc:p},u="wrapper";function c(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"g3000-instrument-setup"},"G3000 Instrument Setup"),(0,a.kt)("h2",{id:"choosing-screens"},"Choosing Screens"),(0,a.kt)("p",null,"The G3000 has three types of display screens: PFD, MFD, and GTC. Each screen is implemented as a separate JS/HTML instrument. For the system to function properly, at least one PFD and exactly one MFD must be included in an airplane. GTCs are not strictly required, but without them users will have no way of interacting with many of the features of the G3000."),(0,a.kt)("p",null,"Up to two PFDs, one MFD, and an arbitrary number of GTCs are supported."),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"Each additional instrument above the minimum complement carries extra performance and memory requirements. Keep this in mind when choosing which display screens to implement in your airplane.")),(0,a.kt)("h2",{id:"panelcfg"},(0,a.kt)("inlineCode",{parentName:"h2"},"panel.cfg")),(0,a.kt)("p",null,"To set up your aircraft's ",(0,a.kt)("inlineCode",{parentName:"p"},"panel.cfg")," for the G3000, add one VCockpit entry for each GDU (PFD or MFD) and GTC. Load the following HTML files for each type of instrument:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"PFD: ",(0,a.kt)("inlineCode",{parentName:"li"},"NavSystems/WTG3000/PFD/WTG3000_PFD.html")),(0,a.kt)("li",{parentName:"ul"},"MFD: ",(0,a.kt)("inlineCode",{parentName:"li"},"NavSystems/WTG3000/MFD/WTG3000_MFD.html")),(0,a.kt)("li",{parentName:"ul"},"GTC: ",(0,a.kt)("inlineCode",{parentName:"li"},"NavSystems/WTG3000/GTC/WTG3000_GTC.html"))),(0,a.kt)("p",null,"Each PFD and GTC instrument ",(0,a.kt)("em",{parentName:"p"},"must")," be indexed (even if there is only one such instrument in your aircraft). PFD instruments can have an index of 1 or 2. GTC instruments can have indexes 1, 2, 3, ... etc. The MFD instrument should not be indexed."),(0,a.kt)("p",null,"Each instrument should also be defined with a specific window size:"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Instrument"),(0,a.kt)("th",{parentName:"tr",align:null},"Width (px)"),(0,a.kt)("th",{parentName:"tr",align:null},"Height (px)"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"PFD"),(0,a.kt)("td",{parentName:"tr",align:null},"1280"),(0,a.kt)("td",{parentName:"tr",align:null},"800")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"MFD"),(0,a.kt)("td",{parentName:"tr",align:null},"1280"),(0,a.kt)("td",{parentName:"tr",align:null},"800")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"GTC (horizontal)"),(0,a.kt)("td",{parentName:"tr",align:null},"1280"),(0,a.kt)("td",{parentName:"tr",align:null},"768")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"GTC (vertical)"),(0,a.kt)("td",{parentName:"tr",align:null},"480"),(0,a.kt)("td",{parentName:"tr",align:null},"640")))),(0,a.kt)("p",null,"Here is an example of a full set of G3000 VCockpit entries, with two PFDs, one MFD, and two horizontal GTCs (note that the texture names are arbitrary; you are free to use names that are different from the ones in this example):"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"[VCockpit01]\nsize_mm=1280,800\npixel_size=1280,800\ntexture=PFD_L\nbackground_color=42,42,40\nhtmlgauge00=NavSystems/WTG3000/PFD/WTG3000_PFD.html?Index=1, 0,0,1280,800\n\n[VCockpit02]\nsize_mm=1280,800\npixel_size=1280,800\ntexture=PFD_R\nbackground_color=42,42,40\nhtmlgauge00=NavSystems/WTG3000/PFD/WTG3000_PFD.html?Index=2, 0,0,1280,800\n\n[VCockpit03]\nsize_mm=1280,800\npixel_size=1280,800\ntexture=MFD\nbackground_color=42,42,40\nhtmlgauge00=NavSystems/WTG3000/MFD/WTG3000_MFD.html, 0,0,1280,800\n\n[VCockpit04]\nsize_mm=1280,768\npixel_size=1280,768\ntexture=GTC_L\nbackground_color=42,42,40\nhtmlgauge00=NavSystems/WTG3000/GTC/WTG3000_GTC.html?Index=1, 0,0,1280,768\n\n[VCockpit05]\nsize_mm=1280,768\npixel_size=1280,768\ntexture=GTC_R\nbackground_color=42,42,40\nhtmlgauge00=NavSystems/WTG3000/GTC/WTG3000_GTC.html?Index=2, 0,0,1280,768\n")))}c.isMDXComponent=!0}}]);