"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[77118],{3905:(e,n,i)=>{i.d(n,{Zo:()=>o,kt:()=>v});var t=i(67294);function l(e,n,i){return n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i,e}function a(e,n){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),i.push.apply(i,t)}return i}function r(e){for(var n=1;n<arguments.length;n++){var i=null!=arguments[n]?arguments[n]:{};n%2?a(Object(i),!0).forEach((function(n){l(e,n,i[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):a(Object(i)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(i,n))}))}return e}function d(e,n){if(null==e)return{};var i,t,l=function(e,n){if(null==e)return{};var i,t,l={},a=Object.keys(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||(l[i]=e[i]);return l}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)i=a[t],n.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(l[i]=e[i])}return l}var p=t.createContext({}),s=function(e){var n=t.useContext(p),i=n;return e&&(i="function"==typeof e?e(n):r(r({},n),e)),i},o=function(e){var n=s(e.components);return t.createElement(p.Provider,{value:n},e.children)},k="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},m=t.forwardRef((function(e,n){var i=e.components,l=e.mdxType,a=e.originalType,p=e.parentName,o=d(e,["components","mdxType","originalType","parentName"]),k=s(i),m=l,v=k["".concat(p,".").concat(m)]||k[m]||u[m]||a;return i?t.createElement(v,r(r({ref:n},o),{},{components:i})):t.createElement(v,r({ref:n},o))}));function v(e,n){var i=arguments,l=n&&n.mdxType;if("string"==typeof e||l){var a=i.length,r=new Array(a);r[0]=m;var d={};for(var p in n)hasOwnProperty.call(n,p)&&(d[p]=n[p]);d.originalType=e,d[k]="string"==typeof e?e:l,r[1]=d;for(var s=2;s<a;s++)r[s]=i[s];return t.createElement.apply(null,r)}return t.createElement.apply(null,i)}m.displayName="MDXCreateElement"},5120:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>p,contentTitle:()=>r,default:()=>u,frontMatter:()=>a,metadata:()=>d,toc:()=>s});var t=i(87462),l=(i(67294),i(3905));const a={id:"Metar",title:"Interface: Metar",sidebar_label:"Metar",sidebar_position:0,custom_edit_url:null},r=void 0,d={unversionedId:"framework/interfaces/Metar",id:"framework/interfaces/Metar",title:"Interface: Metar",description:"A METAR.",source:"@site/docs/framework/interfaces/Metar.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/Metar",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Metar",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"Metar",title:"Interface: Metar",sidebar_label:"Metar",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"MarkerBeaconTuneEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MarkerBeaconTuneEvents"},next:{title:"MetarCloudLayer",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/MetarCloudLayer"}},p={},s=[{value:"Properties",id:"properties",level:2},{value:"altimeterA",id:"altimetera",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"altimeterQ",id:"altimeterq",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"cavok",id:"cavok",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"day",id:"day",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"dew",id:"dew",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"gust",id:"gust",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"hour",id:"hour",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"icao",id:"icao",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"layers",id:"layers",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"metarString",id:"metarstring",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"min",id:"min",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"phenomena",id:"phenomena",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"rmk",id:"rmk",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"slp",id:"slp",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"temp",id:"temp",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"vertVis",id:"vertvis",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"vis",id:"vis",level:3},{value:"Defined in",id:"defined-in-16",level:4},{value:"visLt",id:"vislt",level:3},{value:"Defined in",id:"defined-in-17",level:4},{value:"visUnits",id:"visunits",level:3},{value:"Defined in",id:"defined-in-18",level:4},{value:"vrb",id:"vrb",level:3},{value:"Defined in",id:"defined-in-19",level:4},{value:"windDir",id:"winddir",level:3},{value:"Defined in",id:"defined-in-20",level:4},{value:"windSpeed",id:"windspeed",level:3},{value:"Defined in",id:"defined-in-21",level:4},{value:"windSpeedUnits",id:"windspeedunits",level:3},{value:"Defined in",id:"defined-in-22",level:4}],o={toc:s},k="wrapper";function u(e){let{components:n,...i}=e;return(0,l.kt)(k,(0,t.Z)({},o,i,{components:n,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"A METAR."),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"altimetera"},"altimeterA"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"altimeterA"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The altimeter setting, in inHg."),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1108"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"altimeterq"},"altimeterQ"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"altimeterQ"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The altimeter setting, in hPa."),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1111"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"cavok"},"cavok"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"cavok"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether ceiling and visibility are OK."),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1084"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"day"},"day"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"day"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The day of observation, in UTC time."),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1060"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"dew"},"dew"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"dew"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The dew point, in degrees Celsius."),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1105"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"gust"},"gust"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"gust"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The wind gust, expressed in units defined by ",(0,l.kt)("inlineCode",{parentName:"p"},"windSpeedUnits"),"."),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1075"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"hour"},"hour"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"hour"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The hour of observation, in UTC time."),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1063"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"icao"},"icao"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"icao"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"The ident of this METAR's airport."),(0,l.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1057"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"layers"},"layers"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"layers"),": readonly ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MetarCloudLayer"},(0,l.kt)("inlineCode",{parentName:"a"},"MetarCloudLayer")),"[]"),(0,l.kt)("p",null,"Cloud layers."),(0,l.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1096"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"metarstring"},"metarString"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"metarString"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"string")),(0,l.kt)("p",null,"A formatted string representation of this METAR."),(0,l.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1123"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"min"},"min"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"min"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The minute of observation, in UTC time."),(0,l.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1066"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"phenomena"},"phenomena"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"phenomena"),": readonly ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/MetarPhenomenon"},(0,l.kt)("inlineCode",{parentName:"a"},"MetarPhenomenon")),"[]"),(0,l.kt)("p",null,"Significant weather phenomena."),(0,l.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1117"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"rmk"},"rmk"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"rmk"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether this METAR contains remarks."),(0,l.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1120"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"slp"},"slp"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"slp"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The estimated sea-level pressure, in hPa."),(0,l.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1114"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"temp"},"temp"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"temp"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The temperature, in degrees Celsius."),(0,l.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1102"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"vertvis"},"vertVis"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"vertVis"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The vertical visibility, in hundreds of feet."),(0,l.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1099"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"vis"},"vis"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"vis"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The visibility, expressed in units defined by ",(0,l.kt)("inlineCode",{parentName:"p"},"visUnits"),"."),(0,l.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1087"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"vislt"},"visLt"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"visLt"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether the observed visibility is less than the reported visibility."),(0,l.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1093"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"visunits"},"visUnits"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"visUnits"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/MetarVisibilityUnits"},(0,l.kt)("inlineCode",{parentName:"a"},"MetarVisibilityUnits"))),(0,l.kt)("p",null,"The units in which this METAR's visibility is reported."),(0,l.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1090"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"vrb"},"vrb"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"vrb"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"boolean")),(0,l.kt)("p",null,"Whether winds are variable."),(0,l.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1081"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"winddir"},"windDir"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"windDir"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The wind direction, in degrees relative to true north."),(0,l.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1069"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"windspeed"},"windSpeed"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"windSpeed"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The wind speed, expressed in units defined by ",(0,l.kt)("inlineCode",{parentName:"p"},"windSpeedUnits"),"."),(0,l.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1072"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"windspeedunits"},"windSpeedUnits"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,l.kt)("strong",{parentName:"p"},"windSpeedUnits"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/MetarWindSpeedUnits"},(0,l.kt)("inlineCode",{parentName:"a"},"MetarWindSpeedUnits"))),(0,l.kt)("p",null,"The units in which this METAR's wind speeds are reported."),(0,l.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,l.kt)("p",null,"src/sdk/navigation/Facilities.ts:1078"))}u.isMDXComponent=!0}}]);