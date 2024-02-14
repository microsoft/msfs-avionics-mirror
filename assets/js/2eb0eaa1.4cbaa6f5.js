"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[83061],{3905:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>m});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)t=a[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var o=i.createContext({}),d=function(e){var n=i.useContext(o),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},u=function(e){var n=d(e.components);return i.createElement(o.Provider,{value:n},e.children)},p="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},g=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),p=d(t),g=r,m=p["".concat(o,".").concat(g)]||p[g]||c[g]||a;return t?i.createElement(m,l(l({ref:n},u),{},{components:t})):i.createElement(m,l({ref:n},u))}));function m(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var a=t.length,l=new Array(a);l[0]=g;var s={};for(var o in n)hasOwnProperty.call(n,o)&&(s[o]=n[o]);s.originalType=e,s[p]="string"==typeof e?e:r,l[1]=s;for(var d=2;d<a;d++)l[d]=t[d];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}g.displayName="MDXCreateElement"},14473:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>c,frontMatter:()=>a,metadata:()=>s,toc:()=>d});var i=t(87462),r=(t(67294),t(3905));const a={id:"G3000PluginBinder",title:"Interface: G3000PluginBinder",sidebar_label:"G3000PluginBinder",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"g3000common/interfaces/G3000PluginBinder",id:"g3000common/interfaces/G3000PluginBinder",title:"Interface: G3000PluginBinder",description:"A plugin binder for G3000 plugins.",source:"@site/docs/g3000common/interfaces/G3000PluginBinder.md",sourceDirName:"g3000common/interfaces",slug:"/g3000common/interfaces/G3000PluginBinder",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/G3000PluginBinder",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"G3000PluginBinder",title:"Interface: G3000PluginBinder",sidebar_label:"G3000PluginBinder",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"G3000Plugin",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/G3000Plugin"},next:{title:"GpsStatusPaneProps",permalink:"/msfs-avionics-mirror/docs/g3000common/interfaces/GpsStatusPaneProps"}},o={},d=[{value:"Properties",id:"properties",level:2},{value:"backplane",id:"backplane",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"bus",id:"bus",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"config",id:"config",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"facLoader",id:"facloader",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"flightPathCalculator",id:"flightpathcalculator",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"fms",id:"fms",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"fmsSpeedsSettingManager",id:"fmsspeedssettingmanager",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"iauSettingManager",id:"iausettingmanager",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"vSpeedSettingManager",id:"vspeedsettingmanager",level:3},{value:"Defined in",id:"defined-in-8",level:4}],u={toc:d},p="wrapper";function c(e){let{components:n,...t}=e;return(0,r.kt)(p,(0,i.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A plugin binder for G3000 plugins."),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"backplane"},"backplane"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"backplane"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"InstrumentBackplane")),(0,r.kt)("p",null,"The backplane instance."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:19"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"bus"},"bus"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"bus"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"EventBus")),(0,r.kt)("p",null,"The event bus."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:16"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"config"},"config"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"config"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/AvionicsConfig"},(0,r.kt)("inlineCode",{parentName:"a"},"AvionicsConfig"))),(0,r.kt)("p",null,"The avionics configuration."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"facloader"},"facLoader"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"facLoader"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"FacilityLoader")),(0,r.kt)("p",null,"The facility loader."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:25"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"flightpathcalculator"},"flightPathCalculator"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"flightPathCalculator"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"FlightPathCalculator")),(0,r.kt)("p",null,"The lateral flight plan path calculator."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fms"},"fms"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"fms"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"Fms"),"<",(0,r.kt)("inlineCode",{parentName:"p"},'""'),">"),(0,r.kt)("p",null,"The FMS instance."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:31"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"fmsspeedssettingmanager"},"fmsSpeedsSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,r.kt)("strong",{parentName:"p"},"fmsSpeedsSettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/FmsSpeedUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"FmsSpeedUserSettingManager"))),(0,r.kt)("p",null,"A manager for FMS speed user settings."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:40"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"iausettingmanager"},"iauSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"iauSettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/IauUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"IauUserSettingManager"))),(0,r.kt)("p",null,"A manager for IAU user settings."),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:34"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"vspeedsettingmanager"},"vSpeedSettingManager"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"vSpeedSettingManager"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/g3000common/classes/VSpeedUserSettingManager"},(0,r.kt)("inlineCode",{parentName:"a"},"VSpeedUserSettingManager"))),(0,r.kt)("p",null,"A manager for reference V-speed user settings."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/workingtitle-instruments-g3000/html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Shared/G3000Plugin.ts:37"))}c.isMDXComponent=!0}}]);