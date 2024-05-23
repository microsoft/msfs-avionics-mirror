"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[49181],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>g});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=p(n),d=i,g=c["".concat(s,".").concat(d)]||c[d]||m[d]||a;return n?r.createElement(g,l(l({ref:t},u),{},{components:n})):r.createElement(g,l({ref:t},u))}));function g(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=d;var o={};for(var s in t)hasOwnProperty.call(t,s)&&(o[s]=t[s]);o.originalType=e,o[c]="string"==typeof e?e:i,l[1]=o;for(var p=2;p<a;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},62500:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>m,frontMatter:()=>a,metadata:()=>o,toc:()=>p});var r=n(87462),i=(n(67294),n(3905));const a={sidebar_label:"Plugin Basics",sidebar_position:4},l="WT21 Plugin Basics",o={unversionedId:"wt21/plugin-basics",id:"wt21/plugin-basics",title:"WT21 Plugin Basics",description:"Introduction",source:"@site/docs/wt21/plugin-basics.md",sourceDirName:"wt21",slug:"/wt21/plugin-basics",permalink:"/msfs-avionics-mirror/docs/wt21/plugin-basics",draft:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_label:"Plugin Basics",sidebar_position:4},sidebar:"sidebar",previous:{title:"panel.xml Tag Documentation",permalink:"/msfs-avionics-mirror/docs/wt21/panel-xml-tag-documentation"},next:{title:"PFD Plugins",permalink:"/msfs-avionics-mirror/docs/wt21/pfd-plugins"}},s={},p=[{value:"Introduction",id:"introduction",level:2},{value:"Loading Plugin Scripts",id:"loading-plugin-scripts",level:2},{value:"Plugin Interface",id:"plugin-interface",level:2}],u={toc:p},c="wrapper";function m(e){let{components:t,...n}=e;return(0,i.kt)(c,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"wt21-plugin-basics"},"WT21 Plugin Basics"),(0,i.kt)("h2",{id:"introduction"},"Introduction"),(0,i.kt)("p",null,"The WT21 package uses the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/plugins/overview"},"Plugin API")," to allow developers to inject their own custom Typescript code into the avionics system in order to implement aircraft-specific features."),(0,i.kt)("h2",{id:"loading-plugin-scripts"},"Loading Plugin Scripts"),(0,i.kt)("p",null,"Global plugin scripts are loaded via XML files in the ",(0,i.kt)("inlineCode",{parentName:"p"},"html_ui/Plugins")," directory. The declared target of the plugin determines which instrument type the global plugin applies to:"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Instrument Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Plugin Target"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"PFD"),(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"WT21_PFD"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"MFD"),(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"WT21_MFD"))),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"FMC"),(0,i.kt)("td",{parentName:"tr",align:null},(0,i.kt)("inlineCode",{parentName:"td"},"WT21_FMC"))))),(0,i.kt)("p",null,"Airplane plugin scripts are loaded on a per-instrument basis via ",(0,i.kt)("inlineCode",{parentName:"p"},"panel.xml"),":"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-xml"},"<PlaneHTMLConfig>\n\n  <Instrument>\n    <Name>WT21_PFD_1</Name>\n\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/WT21/Plugins/PfdPlugin.js</Plugin>\n  </Instrument>\n\n  <Instrument>\n    <Name>WT21_PFD_2</Name>\n\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/WT21/Plugins/PfdPlugin.js</Plugin>\n  </Instrument>\n\n  <Instrument>\n    <Name>WT21_MFD</Name>\n\n    <Plugin>coui://SimObjects/Airplanes/MyAirplane/panel/Instruments/WT21/Plugins/MfdPlugin.js</Plugin>\n  </Instrument>\n\n</PlaneHTMLConfig>\n")),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"It is best practice to store aircraft-specific WT21 plugin script files (",(0,i.kt)("inlineCode",{parentName:"p"},".js"),") in the aircraft's ",(0,i.kt)("inlineCode",{parentName:"p"},"panel/Instruments/WT21/Plugins/")," subdirectory. This greatly reduces the risk of file conflicts within the sim's virtual file system, because the plugin files are contained in an aircraft-specific subdirectory.")),(0,i.kt)("p",null,"For more detailed information on how plugins are defined and loaded, please refer to the ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/plugins/overview"},"Plugin API documentation"),"."),(0,i.kt)("h2",{id:"plugin-interface"},"Plugin Interface"),(0,i.kt)("p",null,"WT21 plugins conform to the standard SDK plugin interface."),(0,i.kt)("p",null,"All WT21 plugins are passed the following references via ",(0,i.kt)("inlineCode",{parentName:"p"},"binder"),":"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"The local event bus."),(0,i.kt)("li",{parentName:"ul"},"The instrument backplane."),(0,i.kt)("li",{parentName:"ul"},"The flight plan lateral path calculator."),(0,i.kt)("li",{parentName:"ul"},"If the instrument is the primary instrument.")))}m.isMDXComponent=!0}}]);