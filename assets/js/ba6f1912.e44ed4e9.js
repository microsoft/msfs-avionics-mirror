"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[38695],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>k});var r=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=r.createContext({}),p=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},d=function(e){var n=p(e.components);return r.createElement(s.Provider,{value:n},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},u=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),m=p(t),u=a,k=m["".concat(s,".").concat(u)]||m[u]||c[u]||i;return t?r.createElement(k,o(o({ref:n},d),{},{components:t})):r.createElement(k,o({ref:n},d))}));function k(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=u;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l[m]="string"==typeof e?e:a,o[1]=l;for(var p=2;p<i;p++)o[p]=t[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}u.displayName="MDXCreateElement"},75421:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var r=t(87462),a=(t(67294),t(3905));const i={id:"MapUtils",title:"Class: MapUtils",sidebar_label:"MapUtils",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"garminsdk/classes/MapUtils",id:"garminsdk/classes/MapUtils",title:"Class: MapUtils",description:"Provides utility functions for working with Garmin maps.",source:"@site/docs/garminsdk/classes/MapUtils.md",sourceDirName:"garminsdk/classes",slug:"/garminsdk/classes/MapUtils",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUtils",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"MapUtils",title:"Class: MapUtils",sidebar_label:"MapUtils",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MapUserSettingsUtils",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUserSettingsUtils"},next:{title:"MapWaypointDisplayBuilderClass",permalink:"/msfs-avionics-mirror/docs/garminsdk/classes/MapWaypointDisplayBuilderClass"}},s={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"absoluteTerrainEarthColors",id:"absoluteterrainearthcolors",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"connextPrecipRadarColors",id:"connextprecipradarcolors",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"groundTerrainEarthColors",id:"groundterrainearthcolors",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"nextGenMapRanges",id:"nextgenmapranges",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"nextGenTrafficMapRanges",id:"nextgentrafficmapranges",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"noTerrainEarthColors",id:"noterrainearthcolors",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"relativeTerrainEarthColors",id:"relativeterrainearthcolors",level:3},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-6",level:4}],d={toc:p},m="wrapper";function c(e){let{components:n,...t}=e;return(0,a.kt)(m,(0,r.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Provides utility functions for working with Garmin maps."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new MapUtils"),"(): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUtils"},(0,a.kt)("inlineCode",{parentName:"a"},"MapUtils"))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/classes/MapUtils"},(0,a.kt)("inlineCode",{parentName:"a"},"MapUtils"))),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"absoluteterrainearthcolors"},"absoluteTerrainEarthColors"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"absoluteTerrainEarthColors"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"Gets the earth colors definition for absolute terrain colors."),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"The earth colors definition for absolute terrain colors."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/MapUtils.ts:810"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"connextprecipradarcolors"},"connextPrecipRadarColors"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"connextPrecipRadarColors"),"(): readonly readonly ","[",(0,a.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),"][]"),(0,a.kt)("p",null,"Gets the weather color array for the Connext precipitation radar overlay."),(0,a.kt)("h4",{id:"returns-2"},"Returns"),(0,a.kt)("p",null,"readonly readonly ","[",(0,a.kt)("inlineCode",{parentName:"p"},"number"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"number"),"][]"),(0,a.kt)("p",null,"The weather color array for the Connext precipitation radar overlay."),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/MapUtils.ts:845"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"groundterrainearthcolors"},"groundTerrainEarthColors"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"groundTerrainEarthColors"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"Gets the earth colors definition for on ground relative terrain colors."),(0,a.kt)("h4",{id:"returns-3"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"The earth colors definition for on ground relative terrain colors."),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/MapUtils.ts:826"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"nextgenmapranges"},"nextGenMapRanges"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"nextGenMapRanges"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"units"),"): readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"NumberUnitReadOnly"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">","[]"),(0,a.kt)("p",null,"Gets the standard map range array for next-generation (NXi, G3000, etc) avionics units."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"units")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/garminsdk/enums/UnitsDistanceSettingMode"},(0,a.kt)("inlineCode",{parentName:"a"},"UnitsDistanceSettingMode"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The distance units mode for which to get the array.")))),(0,a.kt)("h4",{id:"returns-4"},"Returns"),(0,a.kt)("p",null,"readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"NumberUnitReadOnly"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">","[]"),(0,a.kt)("p",null,"The standard map range array for next-generation (NXi, G3000, etc) avionics units."),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/MapUtils.ts:122"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"nextgentrafficmapranges"},"nextGenTrafficMapRanges"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"nextGenTrafficMapRanges"),"(): readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"NumberUnitReadOnly"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">","[]"),(0,a.kt)("p",null,"Gets the standard traffic map range array for next-generation (NXi, G3000, etc) avionics units."),(0,a.kt)("h4",{id:"returns-5"},"Returns"),(0,a.kt)("p",null,"readonly ",(0,a.kt)("inlineCode",{parentName:"p"},"NumberUnitReadOnly"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"Unit"),"<",(0,a.kt)("inlineCode",{parentName:"p"},"Distance"),">",">","[]"),(0,a.kt)("p",null,"The standard traffic map range array for next-generation (NXi, G3000, etc) avionics units."),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/MapUtils.ts:130"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"noterrainearthcolors"},"noTerrainEarthColors"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"noTerrainEarthColors"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"Gets the earth colors definition for no terrain colors."),(0,a.kt)("h4",{id:"returns-6"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"The earth colors definition for no terrain colors."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/MapUtils.ts:802"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"relativeterrainearthcolors"},"relativeTerrainEarthColors"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"relativeTerrainEarthColors"),"(): ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"Gets the earth colors definition for relative terrain colors."),(0,a.kt)("h4",{id:"returns-7"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/garminsdk/modules#mapterraincolorsdefinition"},(0,a.kt)("inlineCode",{parentName:"a"},"MapTerrainColorsDefinition")),">"),(0,a.kt)("p",null,"The earth colors definition for relative terrain colors."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/garminsdk/components/map/MapUtils.ts:818"))}c.isMDXComponent=!0}}]);