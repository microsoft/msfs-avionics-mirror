"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[31788],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>u});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var d=r.createContext({}),s=function(e){var t=r.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(d.Provider,{value:t},e.children)},m="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,d=e.parentName,p=o(e,["components","mdxType","originalType","parentName"]),m=s(n),c=i,u=m["".concat(d,".").concat(c)]||m[c]||k[c]||a;return n?r.createElement(u,l(l({ref:t},p),{},{components:n})):r.createElement(u,l({ref:t},p))}));function u(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,l=new Array(a);l[0]=c;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o[m]="string"==typeof e?e:i,l[1]=o;for(var s=2;s<a;s++)l[s]=n[s];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},48196:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>k,frontMatter:()=>a,metadata:()=>o,toc:()=>s});var r=n(87462),i=(n(67294),n(3905));const a={id:"index.DigitScroller",title:"Class: DigitScroller",sidebar_label:"DigitScroller",custom_edit_url:null},l=void 0,o={unversionedId:"framework/classes/index.DigitScroller",id:"framework/classes/index.DigitScroller",title:"Class: DigitScroller",description:"index.DigitScroller",source:"@site/docs/framework/classes/index.DigitScroller.md",sourceDirName:"framework/classes",slug:"/framework/classes/index.DigitScroller",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.DigitScroller",draft:!1,editUrl:null,tags:[],version:"current",frontMatter:{id:"index.DigitScroller",title:"Class: DigitScroller",sidebar_label:"DigitScroller",custom_edit_url:null},sidebar:"sidebar",previous:{title:"DeltaPacer",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.DeltaPacer"},next:{title:"DirectToFixLegCalculator",permalink:"/msfs-avionics-mirror/docs/framework/classes/index.DirectToFixLegCalculator"}},d={},s=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"context",id:"context",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"contextType",id:"contexttype",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"cssClassSub",id:"cssclasssub",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"digitCount",id:"digitcount",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"digitPlaceFactor",id:"digitplacefactor",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"nanTextStyle",id:"nantextstyle",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"props",id:"props",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"scrollThreshold",id:"scrollthreshold",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"tapeStyle",id:"tapestyle",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"translateY",id:"translatey",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"translationPerDigit",id:"translationperdigit",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"valueSub",id:"valuesub",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy",id:"destroy",level:3},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-13",level:4},{value:"getContext",id:"getcontext",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-14",level:4},{value:"onAfterRender",id:"onafterrender",level:3},{value:"Returns",id:"returns-2",level:4},{value:"Overrides",id:"overrides-2",level:4},{value:"Defined in",id:"defined-in-15",level:4},{value:"onBeforeRender",id:"onbeforerender",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-16",level:4},{value:"render",id:"render",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Overrides",id:"overrides-3",level:4},{value:"Defined in",id:"defined-in-17",level:4},{value:"renderDigits",id:"renderdigits",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-18",level:4},{value:"update",id:"update",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-19",level:4}],p={toc:s},m="wrapper";function k(e){let{components:t,...n}=e;return(0,i.kt)(m,(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules/"},"index"),".DigitScroller"),(0,i.kt)("p",null,"A scrolling digit display. The display supports number bases greater than or equal to 3. The display renders a\none digit for each of the following values:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"-(base + 2), -(base + 1), -(base), ... , -1, 0, 1, ... , base, base + 1, base + 2` \n")),(0,i.kt)("p",null,"The total number of rendered digits equals ",(0,i.kt)("inlineCode",{parentName:"p"},"(base + 2) * 2 + 1"),". The display will scroll between the rendered\ndigits based on a bound value."),(0,i.kt)("p",null,"When styling the scroller with CSS, select the ",(0,i.kt)("inlineCode",{parentName:"p"},"digit-scroller-digit")," class to style all rendered digits. Each\nindividual digit can also be selected with the ",(0,i.kt)("inlineCode",{parentName:"p"},"digit-scroller-digit-[index]")," classes, where ",(0,i.kt)("inlineCode",{parentName:"p"},"[index]")," is replaced\nwith ",(0,i.kt)("inlineCode",{parentName:"p"},"0, 1, 2, ..."),", starting with the lowest-valued digit. Select the ",(0,i.kt)("inlineCode",{parentName:"p"},"digit-scroller-nan")," class to style the text\nrendered for ",(0,i.kt)("inlineCode",{parentName:"p"},"NaN")," values. The ",(0,i.kt)("inlineCode",{parentName:"p"},"--digit-scroller-line-height")," variable is used to control the vertical spacing\nbetween each digit (defaults to ",(0,i.kt)("inlineCode",{parentName:"p"},"1em"),"). The ",(0,i.kt)("inlineCode",{parentName:"p"},"--digit-scroller-line-offset-y")," variable is used to control the\nvertical offset of each digit (defaults to ",(0,i.kt)("inlineCode",{parentName:"p"},"0px"),")."),(0,i.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},(0,i.kt)("inlineCode",{parentName:"a"},"DisplayComponent")),"<",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.DigitScrollerProps"},(0,i.kt)("inlineCode",{parentName:"a"},"DigitScrollerProps")),">"),(0,i.kt)("p",{parentName:"li"},"\u21b3 ",(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"DigitScroller"))))),(0,i.kt)("h2",{id:"constructors"},"Constructors"),(0,i.kt)("h3",{id:"constructor"},"constructor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"new DigitScroller"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"props"),")"),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Inherit Doc"))),(0,i.kt)("h4",{id:"parameters"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"props")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.DigitScrollerProps"},(0,i.kt)("inlineCode",{parentName:"a"},"DigitScrollerProps")))))),(0,i.kt)("h4",{id:"overrides"},"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#constructor"},"constructor")),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:93"),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"context"},"context"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"context"),": [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The context on this component, if any."),(0,i.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#context"},"context")),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:64"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"contexttype"},"contextType"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"contextType"),": readonly [] = ",(0,i.kt)("inlineCode",{parentName:"p"},"undefined")),(0,i.kt)("p",null,"The type of context for this component, if any."),(0,i.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#contexttype"},"contextType")),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:67"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"cssclasssub"},"cssClassSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"cssClassSub"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:90"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"digitcount"},"digitCount"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"digitCount"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:62"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"digitplacefactor"},"digitPlaceFactor"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"digitPlaceFactor"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:84"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"nantextstyle"},"nanTextStyle"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"nanTextStyle"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.ObjectSubject"},(0,i.kt)("inlineCode",{parentName:"a"},"ObjectSubject")),"<{ ",(0,i.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = 'none'; ",(0,i.kt)("inlineCode",{parentName:"p"},"left"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = '0%'; ",(0,i.kt)("inlineCode",{parentName:"p"},"position"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = 'absolute'; ",(0,i.kt)("inlineCode",{parentName:"p"},"top"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = '50%'; ",(0,i.kt)("inlineCode",{parentName:"p"},"transform"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = 'translateY(-50%)'; ",(0,i.kt)("inlineCode",{parentName:"p"},"width"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = '100%' }",">"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:75"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"props"},"props"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"props"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.DigitScrollerProps"},(0,i.kt)("inlineCode",{parentName:"a"},"DigitScrollerProps"))," & ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.ComponentProps"},(0,i.kt)("inlineCode",{parentName:"a"},"ComponentProps"))),(0,i.kt)("p",null,"The properties of the component."),(0,i.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#props"},"props")),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:61"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"scrollthreshold"},"scrollThreshold"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"scrollThreshold"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:85"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"tapestyle"},"tapeStyle"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"tapeStyle"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.ObjectSubject"},(0,i.kt)("inlineCode",{parentName:"a"},"ObjectSubject")),"<{ ",(0,i.kt)("inlineCode",{parentName:"p"},"display"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = ''; ",(0,i.kt)("inlineCode",{parentName:"p"},"height"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ; ",(0,i.kt)("inlineCode",{parentName:"p"},"left"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = '0'; ",(0,i.kt)("inlineCode",{parentName:"p"},"position"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = 'absolute'; ",(0,i.kt)("inlineCode",{parentName:"p"},"top"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," ; ",(0,i.kt)("inlineCode",{parentName:"p"},"transform"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = 'translate3d(0, 0, 0)'; ",(0,i.kt)("inlineCode",{parentName:"p"},"width"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"string")," = '100%' }",">"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:65"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"translatey"},"translateY"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"translateY"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.Subject"},(0,i.kt)("inlineCode",{parentName:"a"},"Subject")),"<",(0,i.kt)("inlineCode",{parentName:"p"},"number"),">"),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:87"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"translationperdigit"},"translationPerDigit"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Readonly")," ",(0,i.kt)("strong",{parentName:"p"},"translationPerDigit"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:63"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"valuesub"},"valueSub"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("inlineCode",{parentName:"p"},"Optional")," ",(0,i.kt)("strong",{parentName:"p"},"valueSub"),": ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:89"),(0,i.kt)("h2",{id:"methods"},"Methods"),(0,i.kt)("h3",{id:"destroy"},"destroy"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Destroys this component."),(0,i.kt)("h4",{id:"returns"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides-1"},"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#destroy"},"destroy")),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:200"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"getcontext"},"getContext"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Protected")," ",(0,i.kt)("strong",{parentName:"p"},"getContext"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"context"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"Gets a context data subscription from the context collection."),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},(0,i.kt)("inlineCode",{parentName:"strong"},"Throws"))),(0,i.kt)("p",null,"An error if no data for the specified context type could be found."),(0,i.kt)("h4",{id:"parameters-1"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"context")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"never")),(0,i.kt)("td",{parentName:"tr",align:"left"},"The context to get the subscription for.")))),(0,i.kt)("h4",{id:"returns-1"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"never")),(0,i.kt)("p",null,"The requested context."),(0,i.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#getcontext"},"getContext")),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:106"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onafterrender"},"onAfterRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onAfterRender"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback that is called after the component is rendered."),(0,i.kt)("h4",{id:"returns-2"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"overrides-2"},"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#onafterrender"},"onAfterRender")),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:105"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"onbeforerender"},"onBeforeRender"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"onBeforeRender"),"(): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"A callback that is called before the component is rendered."),(0,i.kt)("h4",{id:"returns-3"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#onbeforerender"},"onBeforeRender")),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/FSComponent.ts:80"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"render"},"render"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("strong",{parentName:"p"},"render"),"(): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.VNode"},(0,i.kt)("inlineCode",{parentName:"a"},"VNode"))),(0,i.kt)("p",null,"Renders the component."),(0,i.kt)("h4",{id:"returns-4"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.VNode"},(0,i.kt)("inlineCode",{parentName:"a"},"VNode"))),(0,i.kt)("p",null,"A JSX element to be rendered."),(0,i.kt)("h4",{id:"overrides-3"},"Overrides"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent"},"DisplayComponent"),".",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/index.DisplayComponent#render"},"render")),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:157"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"renderdigits"},"renderDigits"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"renderDigits"),"(): ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.VNode"},(0,i.kt)("inlineCode",{parentName:"a"},"VNode")),"[]"),(0,i.kt)("p",null,"Renders text for each of this display's individual digits."),(0,i.kt)("h4",{id:"returns-5"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/index.VNode"},(0,i.kt)("inlineCode",{parentName:"a"},"VNode")),"[]"),(0,i.kt)("p",null,"This display's individual digit text, as an array of VNodes."),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:181"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"update"},"update"),(0,i.kt)("p",null,"\u25b8 ",(0,i.kt)("inlineCode",{parentName:"p"},"Private")," ",(0,i.kt)("strong",{parentName:"p"},"update"),"(",(0,i.kt)("inlineCode",{parentName:"p"},"value"),"): ",(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("p",null,"Updates this display."),(0,i.kt)("h4",{id:"parameters-2"},"Parameters"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,i.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"value")),(0,i.kt)("td",{parentName:"tr",align:"left"},(0,i.kt)("inlineCode",{parentName:"td"},"number")),(0,i.kt)("td",{parentName:"tr",align:"left"},"This display's value.")))),(0,i.kt)("h4",{id:"returns-6"},"Returns"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"void")),(0,i.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,i.kt)("p",null,"src/sdk/components/common/DigitScroller.tsx:117"))}k.isMDXComponent=!0}}]);