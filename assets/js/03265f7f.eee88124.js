"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[1907],{3905:function(e,n,t){t.d(n,{Zo:function(){return c},kt:function(){return p}});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function a(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?a(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):a(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function d(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)t=a[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var l=r.createContext({}),s=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},c=function(e){var n=s(e.components);return r.createElement(l.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,a=e.originalType,l=e.parentName,c=d(e,["components","mdxType","originalType","parentName"]),f=s(t),p=i,m=f["".concat(l,".").concat(p)]||f[p]||u[p]||a;return t?r.createElement(m,o(o({ref:n},c),{},{components:t})):r.createElement(m,o({ref:n},c))}));function p(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=t.length,o=new Array(a);o[0]=f;var d={};for(var l in n)hasOwnProperty.call(n,l)&&(d[l]=n[l]);d.originalType=e,d.mdxType="string"==typeof e?e:i,o[1]=d;for(var s=2;s<a;s++)o[s]=t[s];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},5751:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return d},contentTitle:function(){return l},metadata:function(){return s},toc:function(){return c},default:function(){return f}});var r=t(7462),i=t(3366),a=(t(7294),t(3905)),o=["components"],d={id:"RadioEvents",title:"Interface: RadioEvents",sidebar_label:"RadioEvents",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"framework/interfaces/RadioEvents",id:"framework/interfaces/RadioEvents",isDocsHomePage:!1,title:"Interface: RadioEvents",description:"Events relating to changes in a radio's state.",source:"@site/docs/framework/interfaces/RadioEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/RadioEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/RadioEvents",editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"RadioEvents",title:"Interface: RadioEvents",sidebar_label:"RadioEvents",sidebar_position:0,custom_edit_url:null},sidebar:"docsSidebar",previous:{title:"PublishPacer",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/PublishPacer"},next:{title:"RunwayFacility",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/RunwayFacility"}},c=[{value:"Properties",id:"properties",children:[{value:"adf1ActiveFreq",id:"adf1activefreq",children:[{value:"Defined in",id:"defined-in",children:[],level:4}],level:3},{value:"adf1StandbyFreq",id:"adf1standbyfreq",children:[{value:"Defined in",id:"defined-in-1",children:[],level:4}],level:3},{value:"setFrequency",id:"setfrequency",children:[{value:"Defined in",id:"defined-in-2",children:[],level:4}],level:3},{value:"setIdent",id:"setident",children:[{value:"Defined in",id:"defined-in-3",children:[],level:4}],level:3},{value:"setRadioState",id:"setradiostate",children:[{value:"Defined in",id:"defined-in-4",children:[],level:4}],level:3}],level:2}],u={toc:c};function f(e){var n=e.components,t=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Events relating to changes in a radio's state."),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"adf1activefreq"},"adf1ActiveFreq"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"adf1ActiveFreq"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"ADF1 Active Frequency"),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/RadioCommon.ts:44"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"adf1standbyfreq"},"adf1StandbyFreq"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"adf1StandbyFreq"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"ADF1 Standby Frequency"),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/RadioCommon.ts:42"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setfrequency"},"setFrequency"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"setFrequency"),": ",(0,a.kt)("a",{parentName:"p",href:"../modules#frequencychangeevent"},(0,a.kt)("inlineCode",{parentName:"a"},"FrequencyChangeEvent"))),(0,a.kt)("p",null,"Change the stanby frequency in a radio."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/RadioCommon.ts:38"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setident"},"setIdent"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"setIdent"),": ",(0,a.kt)("a",{parentName:"p",href:"../modules#identchangeevent"},(0,a.kt)("inlineCode",{parentName:"a"},"IdentChangeEvent"))),(0,a.kt)("p",null,"Publish the ident of a tuned station."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/RadioCommon.ts:40"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"setradiostate"},"setRadioState"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"setRadioState"),": ",(0,a.kt)("a",{parentName:"p",href:"../modules#radio"},(0,a.kt)("inlineCode",{parentName:"a"},"Radio"))),(0,a.kt)("p",null,"Set the state of a radio."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/instruments/RadioCommon.ts:36"))}f.isMDXComponent=!0}}]);