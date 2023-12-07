"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[79617],{3905:(e,n,t)=>{t.d(n,{Zo:()=>p,kt:()=>m});var i=t(67294);function l(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function d(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?r(Object(t),!0).forEach((function(n){l(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function a(e,n){if(null==e)return{};var t,i,l=function(e,n){if(null==e)return{};var t,i,l={},r=Object.keys(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||(l[t]=e[t]);return l}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)t=r[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(l[t]=e[t])}return l}var s=i.createContext({}),u=function(e){var n=i.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):d(d({},n),e)),t},p=function(e){var n=u(e.components);return i.createElement(s.Provider,{value:n},e.children)},k="mdxType",o={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},c=i.forwardRef((function(e,n){var t=e.components,l=e.mdxType,r=e.originalType,s=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),k=u(t),c=l,m=k["".concat(s,".").concat(c)]||k[c]||o[c]||r;return t?i.createElement(m,d(d({ref:n},p),{},{components:t})):i.createElement(m,d({ref:n},p))}));function m(e,n){var t=arguments,l=n&&n.mdxType;if("string"==typeof e||l){var r=t.length,d=new Array(r);d[0]=c;var a={};for(var s in n)hasOwnProperty.call(n,s)&&(a[s]=n[s]);a.originalType=e,a[k]="string"==typeof e?e:l,d[1]=a;for(var u=2;u<r;u++)d[u]=t[u];return i.createElement.apply(null,d)}return i.createElement.apply(null,t)}c.displayName="MDXCreateElement"},99304:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>s,contentTitle:()=>d,default:()=>o,frontMatter:()=>r,metadata:()=>a,toc:()=>u});var i=t(87462),l=(t(67294),t(3905));const r={id:"GPSEphemeris",title:"Interface: GPSEphemeris",sidebar_label:"GPSEphemeris",sidebar_position:0,custom_edit_url:null},d=void 0,a={unversionedId:"framework/interfaces/GPSEphemeris",id:"framework/interfaces/GPSEphemeris",title:"Interface: GPSEphemeris",description:"A GPS ephemeris data record.",source:"@site/docs/framework/interfaces/GPSEphemeris.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/GPSEphemeris",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/GPSEphemeris",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"GPSEphemeris",title:"Interface: GPSEphemeris",sidebar_label:"GPSEphemeris",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"GNSSEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/GNSSEvents"},next:{title:"GPSEphemerisRecords",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/GPSEphemerisRecords"}},s={},u=[{value:"Properties",id:"properties",level:2},{value:"cic",id:"cic",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"cis",id:"cis",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"codesOnL2Channel",id:"codesonl2channel",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"crc",id:"crc",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"crs",id:"crs",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"cuc",id:"cuc",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"cus",id:"cus",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"deltaN",id:"deltan",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"eEccentricity",id:"eeccentricity",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"epoch",id:"epoch",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"gpsWeekNumber",id:"gpsweeknumber",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"i0",id:"i0",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"idot",id:"idot",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"iodeIssueClock",id:"iodeissueclock",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"iodeIssueEphemeris",id:"iodeissueephemeris",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"l2PDataFlag",id:"l2pdataflag",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"m0",id:"m0",level:3},{value:"Defined in",id:"defined-in-16",level:4},{value:"omegaL",id:"omegal",level:3},{value:"Defined in",id:"defined-in-17",level:4},{value:"omegaLDot",id:"omegaldot",level:3},{value:"Defined in",id:"defined-in-18",level:4},{value:"omegaS",id:"omegas",level:3},{value:"Defined in",id:"defined-in-19",level:4},{value:"sqrtA",id:"sqrta",level:3},{value:"Defined in",id:"defined-in-20",level:4},{value:"svAccuracy",id:"svaccuracy",level:3},{value:"Defined in",id:"defined-in-21",level:4},{value:"svClock",id:"svclock",level:3},{value:"Defined in",id:"defined-in-22",level:4},{value:"svHealth",id:"svhealth",level:3},{value:"Defined in",id:"defined-in-23",level:4},{value:"tgd",id:"tgd",level:3},{value:"Defined in",id:"defined-in-24",level:4},{value:"toeTimeEphemeris",id:"toetimeephemeris",level:3},{value:"Defined in",id:"defined-in-25",level:4},{value:"transmissionTimeOfMessage",id:"transmissiontimeofmessage",level:3},{value:"Defined in",id:"defined-in-26",level:4}],p={toc:u},k="wrapper";function o(e){let{components:n,...t}=e;return(0,l.kt)(k,(0,i.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"A GPS ephemeris data record."),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"cic"},"cic"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"cic"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Cic"),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1762"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"cis"},"cis"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"cis"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Cis"),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1768"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"codesonl2channel"},"codesOnL2Channel"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"codesOnL2Channel"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Codes on the GPS L2 channel"),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1786"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"crc"},"crc"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"crc"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Crc"),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1774"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"crs"},"crs"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"crs"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Crs"),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1738"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"cuc"},"cuc"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"cuc"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Cuc"),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1747"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"cus"},"cus"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"cus"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Cus"),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1753"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"deltan"},"deltaN"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"deltaN"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Delta N"),(0,l.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1741"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"eeccentricity"},"eEccentricity"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"eEccentricity"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"e"),(0,l.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1750"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"epoch"},"epoch"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"epoch"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/GPSEpoch"},(0,l.kt)("inlineCode",{parentName:"a"},"GPSEpoch"))),(0,l.kt)("p",null,"The GPS epoch for this ephemeris record."),(0,l.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1729"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"gpsweeknumber"},"gpsWeekNumber"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"gpsWeekNumber"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The GPS week number"),(0,l.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1789"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"i0"},"i0"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"i0"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"i0"),(0,l.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1771"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"idot"},"idot"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"idot"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"IDOT"),(0,l.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1783"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"iodeissueclock"},"iodeIssueClock"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"iodeIssueClock"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"IODE Issue of Data, Clock"),(0,l.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1804"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"iodeissueephemeris"},"iodeIssueEphemeris"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"iodeIssueEphemeris"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"IODE Issue of Data, Ephemeris"),(0,l.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1735"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"l2pdataflag"},"l2PDataFlag"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"l2PDataFlag"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"LP2 Data flag"),(0,l.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1792"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"m0"},"m0"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"m0"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"M0"),(0,l.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1744"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"omegal"},"omegaL"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"omegaL"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"OMEGA"),(0,l.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1765"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"omegaldot"},"omegaLDot"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"omegaLDot"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"OMEGA dot"),(0,l.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1780"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"omegas"},"omegaS"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"omegaS"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"omega"),(0,l.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1777"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"sqrta"},"sqrtA"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"sqrtA"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Square root of A"),(0,l.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1756"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"svaccuracy"},"svAccuracy"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"svAccuracy"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Accuracy metadata"),(0,l.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1795"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"svclock"},"svClock"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"svClock"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/GPSSVClock"},(0,l.kt)("inlineCode",{parentName:"a"},"GPSSVClock"))),(0,l.kt)("p",null,"The GPS satellite clock metadata at the time of the record."),(0,l.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1732"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"svhealth"},"svHealth"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"svHealth"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Health metadata"),(0,l.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1798"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"tgd"},"tgd"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"tgd"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"tgd"),(0,l.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1801"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"toetimeephemeris"},"toeTimeEphemeris"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"toeTimeEphemeris"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"toe"),(0,l.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1759"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"transmissiontimeofmessage"},"transmissionTimeOfMessage"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"transmissionTimeOfMessage"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"Transmission time of the ephemeris message"),(0,l.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,l.kt)("p",null,"src/sdk/instruments/GPSSat.ts:1807"))}o.isMDXComponent=!0}}]);