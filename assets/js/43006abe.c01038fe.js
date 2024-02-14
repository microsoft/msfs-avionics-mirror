"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[25476],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var r=n(67294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var d=r.createContext({}),p=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},u=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),m=p(n),u=a,k=m["".concat(d,".").concat(u)]||m[u]||c[u]||i;return n?r.createElement(k,l(l({ref:t},s),{},{components:n})):r.createElement(k,l({ref:t},s))}));function k(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=u;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:a,l[1]=o;for(var p=2;p<i;p++)l[p]=n[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}u.displayName="MDXCreateElement"},51041:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>o,toc:()=>p});var r=n(87462),a=(n(67294),n(3905));const i={id:"TurnToJoinGreatCircleAtPointBuilder",title:"Class: TurnToJoinGreatCircleAtPointBuilder",sidebar_label:"TurnToJoinGreatCircleAtPointBuilder",sidebar_position:0,custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/TurnToJoinGreatCircleAtPointBuilder",id:"framework/classes/TurnToJoinGreatCircleAtPointBuilder",title:"Class: TurnToJoinGreatCircleAtPointBuilder",description:"Builds paths connecting initial great circle paths to final great circle paths via a turn starting at the start",source:"@site/docs/framework/classes/TurnToJoinGreatCircleAtPointBuilder.md",sourceDirName:"framework/classes",slug:"/framework/classes/TurnToJoinGreatCircleAtPointBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/TurnToJoinGreatCircleAtPointBuilder",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TurnToJoinGreatCircleAtPointBuilder",title:"Class: TurnToJoinGreatCircleAtPointBuilder",sidebar_label:"TurnToJoinGreatCircleAtPointBuilder",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"TurnToFixLegCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/TurnToFixLegCalculator"},next:{title:"TurnToJoinGreatCircleBuilder",permalink:"/msfs-avionics-mirror/docs/framework/classes/TurnToJoinGreatCircleBuilder"}},d={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"build",id:"build",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4}],s={toc:p},m="wrapper";function c(e){let{components:t,...n}=e;return(0,a.kt)(m,(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Builds paths connecting initial great circle paths to final great circle paths via a turn starting at the start\npoint and a turn ending at the end point, connected by a great-circle path."),(0,a.kt)("h2",{id:"constructors"},"Constructors"),(0,a.kt)("h3",{id:"constructor"},"constructor"),(0,a.kt)("p",null,"\u2022 ",(0,a.kt)("strong",{parentName:"p"},"new TurnToJoinGreatCircleAtPointBuilder"),"(): ",(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/TurnToJoinGreatCircleAtPointBuilder"},(0,a.kt)("inlineCode",{parentName:"a"},"TurnToJoinGreatCircleAtPointBuilder"))),(0,a.kt)("h4",{id:"returns"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/TurnToJoinGreatCircleAtPointBuilder"},(0,a.kt)("inlineCode",{parentName:"a"},"TurnToJoinGreatCircleAtPointBuilder"))),(0,a.kt)("h2",{id:"methods"},"Methods"),(0,a.kt)("h3",{id:"build"},"build"),(0,a.kt)("p",null,"\u25b8 ",(0,a.kt)("strong",{parentName:"p"},"build"),"(",(0,a.kt)("inlineCode",{parentName:"p"},"vectors"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"index"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"start"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"startPath"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"startTurnRadius"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"startTurnDirection"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"end"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"endPath"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"endTurnRadius"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"endTurnDirection"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"startTurnVectorFlags?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"endTurnVectorFlags?"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"connectVectorFlags?"),"): ",(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"Builds a sequence of vectors representing a path from a defined start point and initial course which turns and\nconnects with another turn via a great-circle path to terminate at a defined end point and final course."),(0,a.kt)("h4",{id:"parameters"},"Parameters"),(0,a.kt)("table",null,(0,a.kt)("thead",{parentName:"table"},(0,a.kt)("tr",{parentName:"thead"},(0,a.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Default value"),(0,a.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,a.kt)("tbody",{parentName:"table"},(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"vectors")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/CircleVector"},(0,a.kt)("inlineCode",{parentName:"a"},"CircleVector")),"[]"),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flight path vector sequence to which to add the vectors.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"index")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The index in the sequence at which to add the vectors.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"start")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The start point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"startPath")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoCircle"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircle"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The great-circle path defining the initial course.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"startTurnRadius")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The radius of the initial turn, in meters.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"startTurnDirection")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#vectorturndirection"},(0,a.kt)("inlineCode",{parentName:"a"},"VectorTurnDirection"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The direction of the initial turn.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"end")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,a.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,a.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,a.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"," ","|"," ",(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/LatLonInterface"},(0,a.kt)("inlineCode",{parentName:"a"},"LatLonInterface"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The end point.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"endPath")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/classes/GeoCircle"},(0,a.kt)("inlineCode",{parentName:"a"},"GeoCircle"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The great-circle path defining the final course.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"endTurnRadius")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The radius of the final turn, in meters.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"endTurnDirection")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#vectorturndirection"},(0,a.kt)("inlineCode",{parentName:"a"},"VectorTurnDirection"))),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"undefined")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The direction of the final turn.")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"startTurnVectorFlags")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"0")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flags to set on the initial turn vector. Defaults to none (0).")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"endTurnVectorFlags")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"0")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flags to set on the final turn vector. Defaults to none (0).")),(0,a.kt)("tr",{parentName:"tbody"},(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"connectVectorFlags")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"number")),(0,a.kt)("td",{parentName:"tr",align:"left"},(0,a.kt)("inlineCode",{parentName:"td"},"0")),(0,a.kt)("td",{parentName:"tr",align:"left"},"The flags to set on the vector along the great-circle path connecting the turns. Defaults to none (0).")))),(0,a.kt)("h4",{id:"returns-1"},"Returns"),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"number")),(0,a.kt)("p",null,"The number of vectors added to the sequence."),(0,a.kt)("h4",{id:"defined-in"},"Defined in"),(0,a.kt)("p",null,"src/sdk/flightplan/FlightPathVectorBuilder.ts:812"))}c.isMDXComponent=!0}}]);