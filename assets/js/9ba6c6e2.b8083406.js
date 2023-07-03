"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[34496],{3905:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>g});var i=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function l(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,i,a=function(e,n){if(null==e)return{};var t,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=i.createContext({}),p=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):l(l({},n),e)),t},u=function(e){var n=p(e.components);return i.createElement(s.Provider,{value:n},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},d=i.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=p(t),d=a,g=c["".concat(s,".").concat(d)]||c[d]||m[d]||r;return t?i.createElement(g,l(l({ref:n},u),{},{components:t})):i.createElement(g,l({ref:n},u))}));function g(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,l=new Array(r);l[0]=d;var o={};for(var s in n)hasOwnProperty.call(n,s)&&(o[s]=n[s]);o.originalType=e,o[c]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<r;p++)l[p]=t[p];return i.createElement.apply(null,l)}return i.createElement.apply(null,t)}d.displayName="MDXCreateElement"},73738:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>l,default:()=>m,frontMatter:()=>r,metadata:()=>o,toc:()=>p});var i=t(87462),a=(t(67294),t(3905));const r={sidebar_label:"Plugin Basics",sidebar_position:5},l="G3000 Plugin Basics",o={unversionedId:"g3000/plugin-basics",id:"g3000/plugin-basics",title:"G3000 Plugin Basics",description:"Introduction",source:"@site/docs/g3000/plugin-basics.md",sourceDirName:"g3000",slug:"/g3000/plugin-basics",permalink:"/msfs-avionics-mirror/docs/g3000/plugin-basics",draft:!1,tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_label:"Plugin Basics",sidebar_position:5},sidebar:"sidebar",previous:{title:"panel.xml Tag Documentation",permalink:"/msfs-avionics-mirror/docs/g3000/panel-xml-tag-documentation"},next:{title:"PFD Plugins",permalink:"/msfs-avionics-mirror/docs/g3000/pfd-plugins"}},s={},p=[{value:"Introduction",id:"introduction",level:2},{value:"Loading Plugin Scripts",id:"loading-plugin-scripts",level:2},{value:"Plugin Interface",id:"plugin-interface",level:2}],u={toc:p},c="wrapper";function m(e){let{components:n,...t}=e;return(0,a.kt)(c,(0,i.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"g3000-plugin-basics"},"G3000 Plugin Basics"),(0,a.kt)("h2",{id:"introduction"},"Introduction"),(0,a.kt)("p",null,"The G3000 package uses the ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/plugins/overview"},"Plugin API")," to allow developers to inject their own custom Typescript code into the avionics system in order to implement aircraft-specific features."),(0,a.kt)("h2",{id:"loading-plugin-scripts"},"Loading Plugin Scripts"),(0,a.kt)("p",null,"Global plugin scripts are loaded via XML files in the ",(0,a.kt)("inlineCode",{parentName:"p"},"html_ui/Plugins")," directory. The declared target of the plugin determines which instrument type the global plugin applies to:"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:null},"Instrument Type"),(0,a.kt)("th",{parentName:"tr",align:null},"Plugin Target"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"PFD"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"WTG3000_PFD"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"MFD"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"WTG3000_MFD"))),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:null},"GTC"),(0,a.kt)("td",{parentName:"tr",align:null},(0,a.kt)("inlineCode",{parentName:"td"},"WTG3000_GTC"))))),(0,a.kt)("p",null,"Airplane plugin scripts are loaded on a per-instrument basis via ",(0,a.kt)("inlineCode",{parentName:"p"},"panel.xml"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-xml"},"<PlaneHTMLConfig>\n\n  <Instrument>\n    <Name>WTG3000_PFD_1</Name>\n\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/G3000/Plugins/PfdPlugin.js</Plugin>\n  </Instrument>\n\n  <Instrument>\n    <Name>WTG3000_PFD_2</Name>\n\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/G3000/Plugins/PfdPlugin.js</Plugin>\n  </Instrument>\n\n  <Instrument>\n    <Name>WTG3000_MFD</Name>\n\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/G3000/Plugins/MfdPlugin.js</Plugin>\n  </Instrument>\n\n</PlaneHTMLConfig>\n")),(0,a.kt)("admonition",{type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"It is best practice to store aircraft-specific G3000 plugin script files (",(0,a.kt)("inlineCode",{parentName:"p"},".js"),") in the aircraft's ",(0,a.kt)("inlineCode",{parentName:"p"},"panel/Instruments/G3000/Plugins/")," subdirectory. This greatly reduces the risk of file conflicts within the sim's virtual file system, because the plugin files are contained in an aircraft-specific subdirectory.")),(0,a.kt)("p",null,"For more detailed information on how plugins are defined and loaded, please refer to the ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/plugins/overview"},"Plugin API documentation"),"."),(0,a.kt)("h2",{id:"plugin-interface"},"Plugin Interface"),(0,a.kt)("p",null,"G3000 plugins conform to the standard SDK plugin interface. In addition, all G3000 plugins support the ",(0,a.kt)("inlineCode",{parentName:"p"},"onInit()")," lifecycle callback method. This callback is called after ",(0,a.kt)("inlineCode",{parentName:"p"},"onInstalled()")," has been called for ",(0,a.kt)("em",{parentName:"p"},"all")," plugins on the same instrument. It is also guaranteed to be called at the beginning of the instrument's initialization process. It is recommended that any plugin initialization tasks that require interaction with core parts of the G3000 avionics and/or other plugins be performed in ",(0,a.kt)("inlineCode",{parentName:"p"},"onInit()"),"."),(0,a.kt)("p",null,"All G3000 plugins are passed the following references via ",(0,a.kt)("inlineCode",{parentName:"p"},"binder"),":"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"The local event bus."),(0,a.kt)("li",{parentName:"ul"},"The instrument backplane."),(0,a.kt)("li",{parentName:"ul"},"The avionics configuration object (contains global options parsed from ",(0,a.kt)("inlineCode",{parentName:"li"},"panel.xml"),")."),(0,a.kt)("li",{parentName:"ul"},"An instance of ",(0,a.kt)("inlineCode",{parentName:"li"},"FacilityLoader"),"."),(0,a.kt)("li",{parentName:"ul"},"The flight plan lateral path calculator."),(0,a.kt)("li",{parentName:"ul"},"The local flight management system (FMS) instance."),(0,a.kt)("li",{parentName:"ul"},"The local IAU user setting manager."),(0,a.kt)("li",{parentName:"ul"},"The local V-speed user setting manager."),(0,a.kt)("li",{parentName:"ul"},"The local FMS speed user setting manager (only if FMS speed is supported).")))}m.isMDXComponent=!0}}]);