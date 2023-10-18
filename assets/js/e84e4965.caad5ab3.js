"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[8736],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>h});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=i.createContext({}),c=function(e){var t=i.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=c(e.components);return i.createElement(s.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},d=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=c(n),d=r,h=u["".concat(s,".").concat(d)]||u[d]||m[d]||a;return n?i.createElement(h,o(o({ref:t},p),{},{components:n})):i.createElement(h,o({ref:t},p))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[u]="string"==typeof e?e:r,o[1]=l;for(var c=2;c<a;c++)o[c]=n[c];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}d.displayName="MDXCreateElement"},48613:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>m,frontMatter:()=>a,metadata:()=>l,toc:()=>c});var i=n(87462),r=(n(67294),n(3905));const a={sidebar_label:"Overview",sidebar_position:1},o="G1000 Overview",l={unversionedId:"g1000/overview",id:"g1000/overview",title:"G1000 Overview",description:"Introduction",source:"@site/docs/g1000/overview.md",sourceDirName:"g1000",slug:"/g1000/overview",permalink:"/msfs-avionics-mirror/docs/g1000/overview",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_label:"Overview",sidebar_position:1},sidebar:"sidebar",previous:{title:"Defining CAS Alerts Using panel.xml",permalink:"/msfs-avionics-mirror/docs/cas/defining-cas-alerts-using-panel-xml"},next:{title:"Readme",permalink:"/msfs-avionics-mirror/docs/g1000common/"}},s={},c=[{value:"Introduction",id:"introduction",level:2},{value:"Instrument Options",id:"instrument-options",level:2},{value:"Plugins",id:"plugins",level:2}],p={toc:c},u="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"g1000-overview"},"G1000 Overview"),(0,r.kt)("h2",{id:"introduction"},"Introduction"),(0,r.kt)("p",null,"The G1000 package was written to reproduce the Garmin G1000 NXi avionics systems in MSFS to a high degree of accuracy.  It was designd to be drop-in compatible with the original MSFS G1000, so configuration is largely similar, in that the bulk of the configuration is done via ",(0,r.kt)("inlineCode",{parentName:"p"},"panel.xml"),".  For a useful introduction to that file, see ",(0,r.kt)("a",{parentName:"p",href:"https://docs.flightsimulator.com/html/Content_Configuration/SimObjects/Aircraft_SimO/Instruments/panel_xml.htm"},"the main MSFS developer documentation"),"."),(0,r.kt)("h2",{id:"instrument-options"},"Instrument Options"),(0,r.kt)("p",null,"Just like the original G1000, the NXi has several configuration options that can be set in the instrument's ",(0,r.kt)("inlineCode",{parentName:"p"},"<Instrument>")," tag in ",(0,r.kt)("inlineCode",{parentName:"p"},"panel.xml"),".  These are as follows:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"<WeatherRadar>"),":  If this is set to 'Off' or 'None' in the MFD, the plane will not have weather radar.  If omitted or set to any other value it will."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"<RadarAltitude>"),": If thes is set to 'True' in the PFD the radar altimeter will be enabled.  If omitted or set to any other value it will not be active.")),(0,r.kt)("p",null,"Note that unlike the original G1000 there is no ",(0,r.kt)("inlineCode",{parentName:"p"},"<SyntheticVision>")," tag -- synthetic vision is always an option on an NXi installation."),(0,r.kt)("h2",{id:"plugins"},"Plugins"),(0,r.kt)("p",null,"The NXi can also be configured by use of our ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/plugins/overview"},"plugin API"),".  See that documentation for an introduction and details on how to create and load plugins in your plane."),(0,r.kt)("p",null,"All G1000 plugins have access to several resources via the ",(0,r.kt)("a",{parentName:"p",href:"../g1000common/interfaces/G1000PluginBinder"},(0,r.kt)("inlineCode",{parentName:"a"},"G1000PluginBinder")),":"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"menuSystem")," is an instance of the ",(0,r.kt)("a",{parentName:"li",href:"../g1000common/classes/SoftKeyMenuSystem"},(0,r.kt)("inlineCode",{parentName:"a"},"SoftKeyMenuSystem"))," that lets you examine and modify the softkey menus."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"viewService")," is an instance of the ",(0,r.kt)("a",{parentName:"li",href:"../g1000common/classes/ViewService"},(0,r.kt)("inlineCode",{parentName:"a"},"ViewService"))," which lets you interact with all the various UI views of the NXi."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"pageSelectMenuSystem")," is an optional instance of the ",(0,r.kt)("a",{parentName:"li",href:"../g1000common/classes/PageSelectMenuSystem"},(0,r.kt)("inlineCode",{parentName:"a"},"PageSelectMenuSystem")),", present only in the MFD, which allows you to examine and modify the MFD's rotary knob menu system.")),(0,r.kt)("p",null,"Every NXi plugin needs to implement three callbacks, which are the primary way for the instrument to interact with your plugin code."),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"onMenuSystemInitialized()")," is called when the softkey menu system is initialized."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"onViewServiceInitialized()")," is called when the view service is initialized."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"onPageSelectMenuSystemInitialized()")," is called when the page select menu system is initialized.")),(0,r.kt)("p",null,"G1000 plugins also support the standard ",(0,r.kt)("inlineCode",{parentName:"p"},"onComponentCreating()"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"onComponentCreated()"),", and ",(0,r.kt)("inlineCode",{parentName:"p"},"onComponentRendered()")," callbacks from ",(0,r.kt)("a",{parentName:"p",href:"../framework/classes/index.AvionicsPlugin"},(0,r.kt)("inlineCode",{parentName:"a"},"AvionicsPlugin")),", which can be implemented to control the rendering of any arbitrary display component.  See the overall plugin documentation for more on the use of these methods."))}m.isMDXComponent=!0}}]);