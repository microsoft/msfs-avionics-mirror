"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[66034],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>f});var i=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=i.createContext({}),s=function(e){var t=i.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=s(e.components);return i.createElement(d.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.createElement(i.Fragment,{},t)}},c=i.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,d=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=s(n),c=r,f=u["".concat(d,".").concat(c)]||u[c]||m[c]||a;return n?i.createElement(f,o(o({ref:t},p),{},{components:n})):i.createElement(f,o({ref:t},p))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=c;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[u]="string"==typeof e?e:r,o[1]=l;for(var s=2;s<a;s++)o[s]=n[s];return i.createElement.apply(null,o)}return i.createElement.apply(null,n)}c.displayName="MDXCreateElement"},65486:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>m,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var i=n(87462),r=(n(67294),n(3905));const a={id:"GtcConfig",title:"Class: GtcConfig",sidebar_label:"GtcConfig",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"g3000gtc/classes/GtcConfig",id:"g3000gtc/classes/GtcConfig",title:"Class: GtcConfig",description:"A configuration object which defines options for the G3000 GTC.",source:"@site/docs/g3000gtc/classes/GtcConfig.md",sourceDirName:"g3000gtc/classes",slug:"/g3000gtc/classes/GtcConfig",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcConfig",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GtcConfig",title:"Class: GtcConfig",sidebar_label:"GtcConfig",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GtcBearingArrow",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcBearingArrow"},next:{title:"GtcConnextWeatherSettingsPage",permalink:"/msfs-avionics-mirror/docs/g3000gtc/classes/GtcConnextWeatherSettingsPage"}},d={},s=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"controlSetup",id:"controlsetup",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"defaultControlMode",id:"defaultcontrolmode",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"factory",id:"factory",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"iauIndex",id:"iauindex",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"orientation",id:"orientation",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"paneControlIndex",id:"panecontrolindex",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"pfdControlIndex",id:"pfdcontrolindex",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"Methods",id:"methods",level:2},{value:"parseGeneralOptions",id:"parsegeneraloptions",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"parseIauIndex",id:"parseiauindex",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-9",level:4}],p={toc:s},u="wrapper";function m(e){let{components:t,...n}=e;return(0,r.kt)(u,(0,i.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A configuration object which defines options for the G3000 GTC."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new GtcConfig"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"xmlConfig"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"instrumentConfig"),")"),(0,r.kt)("p",null,"Creates a GtcConfig from an XML configuration document."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"xmlConfig")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Document")),(0,r.kt)("td",{parentName:"tr",align:"left"},"An XML configuration document.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"instrumentConfig")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The root element of the configuration document's section pertaining to the config's instrument.")))),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:34"),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"controlsetup"},"controlSetup"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"controlSetup"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"GtcControlSetup")),(0,r.kt)("p",null,"The control setup defining which control modes the GTC supports."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:14"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"defaultcontrolmode"},"defaultControlMode"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"defaultControlMode"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtccontrolmode"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcControlMode"))),(0,r.kt)("p",null,"The default control mode of the GTC."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:17"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"factory"},"factory"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"factory"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DefaultConfigFactory")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:8"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"iauindex"},"iauIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"iauIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the IAU used by the GTC."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:26"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"orientation"},"orientation"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"orientation"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"GtcOrientation")),(0,r.kt)("p",null,"The orientation (horizontal or vertical) of the GTC."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:11"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"panecontrolindex"},"paneControlIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"paneControlIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayPaneControlGtcIndex")),(0,r.kt)("p",null,"The display pane controlling index of the GTC."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:23"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"pfdcontrolindex"},"pfdControlIndex"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,r.kt)("strong",{parentName:"p"},"pfdControlIndex"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"PfdIndex")),(0,r.kt)("p",null,"The index of the PFD controlled by the GTC."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:20"),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"parsegeneraloptions"},"parseGeneralOptions"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseGeneralOptions"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"instrumentConfig"),"): [",(0,r.kt)("inlineCode",{parentName:"p"},"GtcOrientation"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"GtcControlSetup"),", ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtccontrolmode"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcControlMode")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"PfdIndex"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayPaneControlGtcIndex"),"]"),(0,r.kt)("p",null,"Parses general configuration options from a configuration document."),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,r.kt)("p",null,"Error if ",(0,r.kt)("inlineCode",{parentName:"p"},"instrumentConfig")," is undefined or if any configuration options are missing or malformed."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"instrumentConfig")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The root element of the configuration document's section pertaining to this config's instrument.")))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,"[",(0,r.kt)("inlineCode",{parentName:"p"},"GtcOrientation"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"GtcControlSetup"),", ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000gtc/modules#gtccontrolmode"},(0,r.kt)("inlineCode",{parentName:"a"},"GtcControlMode")),", ",(0,r.kt)("inlineCode",{parentName:"p"},"PfdIndex"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"DisplayPaneControlGtcIndex"),"]"),(0,r.kt)("p",null,"General configuration options, as defined by the configuration document for this config's instrument, as\n",(0,r.kt)("inlineCode",{parentName:"p"},"[orientation, control_setup, default_control_mode, pfd_control_index, display_pane_control_index]"),"."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"parseiauindex"},"parseIauIndex"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,r.kt)("strong",{parentName:"p"},"parseIauIndex"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"instrumentConfig"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Parses an IAU index from a configuration document."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"instrumentConfig")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"undefined")," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},"Element")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The root element of the configuration document's section pertaining to this config's instrument.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The IAU index defined by the configuration document for this config's instrument."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/GTC/Config/GtcConfig.ts:195"))}m.isMDXComponent=!0}}]);