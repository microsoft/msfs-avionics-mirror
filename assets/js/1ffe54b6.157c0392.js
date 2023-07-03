"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[21841],{3905:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>u});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function d(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=r.createContext({}),p=function(e){var t=r.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},m=function(e){var t=p(e.components);return r.createElement(o.Provider,{value:t},e.children)},s="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,m=d(e,["components","mdxType","originalType","parentName"]),s=p(n),k=a,u=s["".concat(o,".").concat(k)]||s[k]||c[k]||i;return n?r.createElement(u,l(l({ref:t},m),{},{components:n})):r.createElement(u,l({ref:t},m))}));function u(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=k;var d={};for(var o in t)hasOwnProperty.call(t,o)&&(d[o]=t[o]);d.originalType=e,d[s]="string"==typeof e?e:a,l[1]=d;for(var p=2;p<i;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}k.displayName="MDXCreateElement"},6624:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>d,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={id:"index.DirectToPointBuilder",title:"Class: DirectToPointBuilder",sidebar_label:"DirectToPointBuilder",custom_edit_url:null},l=void 0,d={unversionedId:"framework/classes/index.DirectToPointBuilder",id:"framework/classes/index.DirectToPointBuilder",title:"Class: DirectToPointBuilder",description:"index.DirectToPointBuilder",source:"@site/docs/framework/classes/index.DirectToPointBuilder.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.DirectToPointBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.DirectToPointBuilder",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.DirectToPointBuilder",title:"Class: DirectToPointBuilder",sidebar_label:"DirectToPointBuilder",custom_edit_url:null},sidebar:"sidebar",previous:{title:"DirectToFixLegCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.DirectToFixLegCalculator"},next:{title:"DisplayComponent",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"}},o={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Properties",id:"properties",level:2},{value:"circleVectorBuilder",id:"circlevectorbuilder",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"greatCircleBuilder",id:"greatcirclebuilder",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"geoCircleCache",id:"geocirclecache",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"geoPointCache",id:"geopointcache",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"vec3Cache",id:"vec3cache",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"Methods",id:"methods",level:2},{value:"build",id:"build",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-6",level:4}],m={toc:p},s="wrapper";function c(e){let{components:t,...n}=e;return(0,a.kt)(s,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".DirectToPointBuilder"),(0,a.kt)("p",null,"Builds paths directly connecting a defined initial point and course and a defined end point."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new DirectToPointBuilder"),"()"),(0,a.kt)("h2",{id:"properties"},"Properties"),(0,a.kt)("h3",{id:"circlevectorbuilder"},"circleVectorBuilder"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"circleVectorBuilder"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.CircleVectorBuilder"},(0,a.kt)("inlineCode",{parentName:"a"},"CircleVectorBuilder"))),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:1762"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"greatcirclebuilder"},"greatCircleBuilder"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"greatCircleBuilder"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GreatCircleBuilder"},(0,a.kt)("inlineCode",{parentName:"a"},"GreatCircleBuilder"))),(0,a.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:1763"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"geocirclecache"},"geoCircleCache"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"geoCircleCache"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoCircle"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircle")),"[]"),(0,a.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:1760"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"geopointcache"},"geoPointCache"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"geoPointCache"),": ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoPoint"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoPoint")),"[]"),(0,a.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:1759"),(0,a.kt)("hr",null),(0,a.kt)("h3",{id:"vec3cache"},"vec3Cache"),(0,a.kt)("p",null,"\u25aa ",(0,a.kt)("inlineCode",{parentName:"p"},"Static")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,a.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,a.kt)("strong",{parentName:"p"},"vec3Cache"),": ",(0,a.kt)("inlineCode",{parentName:"p"},"Float64Array"),"[]"),(0,a.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:1758"),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"build"},"build"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"build"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"vectors"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"start"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"startCourse"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"end"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"desiredTurnRadius"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"desiredTurnDirection?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"flags?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"includeTurnToCourseFlag?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"includeDirectFlag?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Builds a sequence of vectors representing a path which consists of an optional turn from an initial point and\ncourse toward an end point followed by an optional great-circle path terminating at the end point."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vectors")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.CircleVector"},(0,a.kt)("inlineCode",{parentName:"a"},"CircleVector")),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight path vector sequence to which to add the vectors.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index in the sequence at which to add the vectors.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"start")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The start point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"startCourse")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The initial course.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"end")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The end point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"desiredTurnRadius")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The desired turn radius, in meters.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"desiredTurnDirection?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#vectorturndirection"},(0,a.kt)("inlineCode",{parentName:"a"},"VectorTurnDirection"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The desired turn direction. If undefined, a turn direction will be chosen such that the initial turn is always toward the end point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"flags?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flags to set on the vectors. Defaults to none (0).")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"includeTurnToCourseFlag?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether to include the ",(0,a.kt)("inlineCode",{parentName:"td"},"TurnToCourse")," flag on the turn vectors. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"true"),".")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"includeDirectFlag?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether to include the ",(0,a.kt)("inlineCode",{parentName:"td"},"Direct")," flag on the vectors. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"true"),".")))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The number of vectors added to the sequence."),(0,a.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:1781"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"build"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"vectors"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"start"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"startPath"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"end"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"desiredTurnRadius"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"desiredTurnDirection?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"flags?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"includeTurnToCourseFlag?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"includeDirectFlag?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Builds a sequence of vectors representing a path which consists of an optional turn from an initial point and\ncourse toward an end point followed by an optional great-circle path terminating at the end point."),(0,a.kt)("h4",{id:"parameters-1"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vectors")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.CircleVector"},(0,a.kt)("inlineCode",{parentName:"a"},"CircleVector")),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight path vector sequence to which to add the vectors.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index in the sequence at which to add the vectors.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"start")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The start point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"startPath")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/index.GeoCircle"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircle"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The great-circle path defining the initial course.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"end")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The end point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"desiredTurnRadius")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The desired turn radius, in meters.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"desiredTurnDirection?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules/#vectorturndirection"},(0,a.kt)("inlineCode",{parentName:"a"},"VectorTurnDirection"))),(0,a.kt)("td",{parentName:"tr",align:"left"},"The desired turn direction. If undefined, a turn direction will be chosen such that the initial turn is always toward the end point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"flags?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flags to set on the vectors. Defaults to none (0).")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"includeTurnToCourseFlag?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether to include the ",(0,a.kt)("inlineCode",{parentName:"td"},"TurnToCourse")," flag on the turn vectors. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"true"),".")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"includeDirectFlag?")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"boolean")),(0,a.kt)("td",{parentName:"tr",align:"left"},"Whether to include the ",(0,a.kt)("inlineCode",{parentName:"td"},"Direct")," flag on the vectors. Defaults to ",(0,a.kt)("inlineCode",{parentName:"td"},"true"),".")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The number of vectors added to the sequence."),(0,a.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:1809"))}c.isMDXComponent=!0}}]);