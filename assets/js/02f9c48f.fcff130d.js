"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[94095],{3905:(e,n,t)=>{t.d(n,{Zo:()=>d,kt:()=>f});var a=t(67294);function l(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function r(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){l(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function o(e,n){if(null==e)return{};var t,a,l=function(e,n){if(null==e)return{};var t,a,l={},i=Object.keys(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||(l[t]=e[t]);return l}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)t=i[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(l[t]=e[t])}return l}var p=a.createContext({}),s=function(e){var n=a.useContext(p),t=n;return e&&(t="function"==typeof e?e(n):r(r({},n),e)),t},d=function(e){var n=s(e.components);return a.createElement(p.Provider,{value:n},e.children)},u="mdxType",k={inlineCode:"code",wrapper:function(e){var n=e.children;return a.createElement(a.Fragment,{},n)}},c=a.forwardRef((function(e,n){var t=e.components,l=e.mdxType,i=e.originalType,p=e.parentName,d=o(e,["components","mdxType","originalType","parentName"]),u=s(t),c=l,f=u["".concat(p,".").concat(c)]||u[c]||k[c]||i;return t?a.createElement(f,r(r({ref:n},d),{},{components:t})):a.createElement(f,r({ref:n},d))}));function f(e,n){var t=arguments,l=n&&n.mdxType;if("string"==typeof e||l){var i=t.length,r=new Array(i);r[0]=c;var o={};for(var p in n)hasOwnProperty.call(n,p)&&(o[p]=n[p]);o.originalType=e,o[u]="string"==typeof e?e:l,r[1]=o;for(var s=2;s<i;s++)r[s]=t[s];return a.createElement.apply(null,r)}return a.createElement.apply(null,t)}c.displayName="MDXCreateElement"},11146:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>p,contentTitle:()=>r,default:()=>k,frontMatter:()=>i,metadata:()=>o,toc:()=>s});var a=t(87462),l=(t(67294),t(3905));const i={id:"FlightPathCalculatorOptions",title:"Interface: FlightPathCalculatorOptions",sidebar_label:"FlightPathCalculatorOptions",sidebar_position:0,custom_edit_url:null},r=void 0,o={unversionedId:"framework/interfaces/FlightPathCalculatorOptions",id:"framework/interfaces/FlightPathCalculatorOptions",title:"Interface: FlightPathCalculatorOptions",description:"Options for the flight path calculator.",source:"@site/docs/framework/interfaces/FlightPathCalculatorOptions.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/FlightPathCalculatorOptions",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPathCalculatorOptions",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"FlightPathCalculatorOptions",title:"Interface: FlightPathCalculatorOptions",sidebar_label:"FlightPathCalculatorOptions",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"FlightPathCalculatorControlEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPathCalculatorControlEvents"},next:{title:"FlightPathLegCalculator",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/FlightPathLegCalculator"}},p={},s=[{value:"Properties",id:"properties",level:2},{value:"airplaneSpeedMode",id:"airplanespeedmode",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"bankAngle",id:"bankangle",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"courseReversalBankAngle",id:"coursereversalbankangle",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"defaultClimbRate",id:"defaultclimbrate",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"defaultSpeed",id:"defaultspeed",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"holdBankAngle",id:"holdbankangle",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"maxBankAngle",id:"maxbankangle",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"turnAnticipationBankAngle",id:"turnanticipationbankangle",level:3},{value:"Defined in",id:"defined-in-7",level:4}],d={toc:s},u="wrapper";function k(e){let{components:n,...t}=e;return(0,l.kt)(u,(0,a.Z)({},d,t,{components:n,mdxType:"MDXLayout"}),(0,l.kt)("p",null,"Options for the flight path calculator."),(0,l.kt)("h2",{id:"properties"},"Properties"),(0,l.kt)("h3",{id:"airplanespeedmode"},"airplaneSpeedMode"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"airplaneSpeedMode"),": ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/FlightPathAirplaneSpeedMode"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathAirplaneSpeedMode"))),(0,l.kt)("p",null,"The mode to use to calculate airplane speed."),(0,l.kt)("h4",{id:"defined-in"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:88"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"bankangle"},"bankAngle"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"bankAngle"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#flightpathbankanglebreakpoints"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathBankAngleBreakpoints"))),(0,l.kt)("p",null,"The bank angle, in degrees, with which to calculate general turns, or breakpoints defining a linearly-interpolated\nlookup table for bank angle versus airplane speed, in knots."),(0,l.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:61"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"coursereversalbankangle"},"courseReversalBankAngle"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"courseReversalBankAngle"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#flightpathbankanglebreakpoints"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathBankAngleBreakpoints"))),(0,l.kt)("p",null,"The bank angle, in degrees, with which to calculate turns in course reversals (incl. procedure turns), or\nbreakpoints defining a linearly-interpolated lookup table for bank angle versus airplane speed, in knots. If\n",(0,l.kt)("inlineCode",{parentName:"p"},"null"),", the general turn bank angle will be used for course reversals."),(0,l.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:75"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"defaultclimbrate"},"defaultClimbRate"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"defaultClimbRate"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The default climb rate, in feet per minute, if the plane is not yet at flying speed."),(0,l.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:49"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"defaultspeed"},"defaultSpeed"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"defaultSpeed"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The default airplane speed, in knots. This speed is used if the airplane speed mode is ",(0,l.kt)("inlineCode",{parentName:"p"},"Default")," or if the\nairplane speed calculated through other means is slower than this speed."),(0,l.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:55"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"holdbankangle"},"holdBankAngle"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"holdBankAngle"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#flightpathbankanglebreakpoints"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathBankAngleBreakpoints"))),(0,l.kt)("p",null,"The bank angle, in degrees, with which to calculate turns in holds, or breakpoints defining a\nlinearly-interpolated lookup table for bank angle versus airplane speed, in knots. If ",(0,l.kt)("inlineCode",{parentName:"p"},"null"),", the general turn\nbank angle will be used for holds."),(0,l.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:68"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"maxbankangle"},"maxBankAngle"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"maxBankAngle"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"number")),(0,l.kt)("p",null,"The maximum bank angle, in degrees, to use to calculate all turns."),(0,l.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:85"),(0,l.kt)("hr",null),(0,l.kt)("h3",{id:"turnanticipationbankangle"},"turnAnticipationBankAngle"),(0,l.kt)("p",null,"\u2022 ",(0,l.kt)("strong",{parentName:"p"},"turnAnticipationBankAngle"),": ",(0,l.kt)("inlineCode",{parentName:"p"},"null")," ","|"," ",(0,l.kt)("inlineCode",{parentName:"p"},"number")," ","|"," ",(0,l.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#flightpathbankanglebreakpoints"},(0,l.kt)("inlineCode",{parentName:"a"},"FlightPathBankAngleBreakpoints"))),(0,l.kt)("p",null,"The bank angle, in degrees, with which to calculate turn anticipation, or breakpoints defining a\nlinearly-interpolated lookup table for bank angle versus airplane speed, in knots. If ",(0,l.kt)("inlineCode",{parentName:"p"},"null"),", the general turn\nbank angle will be used for turn anticipation."),(0,l.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,l.kt)("p",null,"src/sdk/flightplan/FlightPathCalculator.ts:82"))}k.isMDXComponent=!0}}]);