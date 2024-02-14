"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[38270],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>c});var n=a(67294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var s=n.createContext({}),p=function(e){var t=n.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},m=function(e){var t=p(e.components);return n.createElement(s.Provider,{value:t},e.children)},d="mdxType",k={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,s=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),d=p(a),f=r,c=d["".concat(s,".").concat(f)]||d[f]||k[f]||i;return a?n.createElement(c,o(o({ref:t},m),{},{components:a})):n.createElement(c,o({ref:t},m))}));function c(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,o=new Array(i);o[0]=f;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[d]="string"==typeof e?e:r,o[1]=l;for(var p=2;p<i;p++)o[p]=a[p];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}f.displayName="MDXCreateElement"},12346:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>s,contentTitle:()=>o,default:()=>k,frontMatter:()=>i,metadata:()=>l,toc:()=>p});var n=a(87462),r=(a(67294),a(3905));const i={id:"TransformPerspective",title:"Class: TransformPerspective",sidebar_label:"TransformPerspective",sidebar_position:0,custom_edit_url:null},o=void 0,l={unversionedId:"framework/classes/TransformPerspective",id:"framework/classes/TransformPerspective",title:"Class: TransformPerspective",description:"A perspective transformation.",source:"@site/docs/framework/classes/TransformPerspective.md",sourceDirName:"framework/classes",slug:"/framework/classes/TransformPerspective",permalink:"/msfs-avionics-mirror/docs/framework/classes/TransformPerspective",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"TransformPerspective",title:"Class: TransformPerspective",sidebar_label:"TransformPerspective",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"Transform3D",permalink:"/msfs-avionics-mirror/docs/framework/classes/Transform3D"},next:{title:"TransformingPathStreamStack",permalink:"/msfs-avionics-mirror/docs/framework/classes/TransformingPathStreamStack"}},s={},p=[{value:"Constructors",id:"constructors",level:2},{value:"constructor",id:"constructor",level:3},{value:"Returns",id:"returns",level:4},{value:"Methods",id:"methods",level:2},{value:"_setCameraRotation",id:"_setcamerarotation",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"apply",id:"apply",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"copy",id:"copy",level:3},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"getCameraPosition",id:"getcameraposition",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getCameraRotation",id:"getcamerarotation",level:3},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"getSurfacePosition",id:"getsurfaceposition",level:3},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"set",id:"set",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"setCameraPosition",id:"setcameraposition",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"setCameraRotation",id:"setcamerarotation",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"setSurfacePosition",id:"setsurfaceposition",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-11",level:4},{value:"Defined in",id:"defined-in-10",level:4}],m={toc:p},d="wrapper";function k(e){let{components:t,...a}=e;return(0,r.kt)(d,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"A perspective transformation."),(0,r.kt)("h2",{id:"constructors"},"Constructors"),(0,r.kt)("h3",{id:"constructor"},"constructor"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"new TransformPerspective"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/TransformPerspective"},(0,r.kt)("inlineCode",{parentName:"a"},"TransformPerspective"))),(0,r.kt)("h4",{id:"returns"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/TransformPerspective"},(0,r.kt)("inlineCode",{parentName:"a"},"TransformPerspective"))),(0,r.kt)("h2",{id:"methods"},"Methods"),(0,r.kt)("h3",{id:"_setcamerarotation"},"_","setCameraRotation"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"_setCameraRotation"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"cameraRotation"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("p",null,"Sets the rotation of this projection's camera. Does not update the full camera transformation."),(0,r.kt)("h4",{id:"parameters"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cameraRotation")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#readonlytransform3d"},(0,r.kt)("inlineCode",{parentName:"a"},"ReadonlyTransform3D"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"A transformation representing the rotation of the camera.")))),(0,r.kt)("h4",{id:"returns-1"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"void")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:108"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"apply"},"apply"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"apply"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"vec"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"out"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array")),(0,r.kt)("p",null,"Applies this transformation to a 3D vector."),(0,r.kt)("h4",{id:"parameters-1"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"vec")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"A 3D vector, in world coordinates.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"out")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Float64Array")),(0,r.kt)("td",{parentName:"tr",align:"left"},"The 2D vector to which to write the result.")))),(0,r.kt)("h4",{id:"returns-2"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array")),(0,r.kt)("p",null,"The result of applying this transformation to ",(0,r.kt)("inlineCode",{parentName:"p"},"vec"),"."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:162"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"copy"},"copy"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"copy"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/TransformPerspective"},(0,r.kt)("inlineCode",{parentName:"a"},"TransformPerspective"))),(0,r.kt)("p",null,"Copies this transformation."),(0,r.kt)("h4",{id:"returns-3"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/classes/TransformPerspective"},(0,r.kt)("inlineCode",{parentName:"a"},"TransformPerspective"))),(0,r.kt)("p",null,"A copy of this transformation."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:152"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getcameraposition"},"getCameraPosition"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getCameraPosition"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"copyWithin"'),">",">"),(0,r.kt)("p",null,"Gets the position of this transformation's camera, as ",(0,r.kt)("inlineCode",{parentName:"p"},"[x, y, z]")," in world coordinates."),(0,r.kt)("h4",{id:"returns-4"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"copyWithin"'),">",">"),(0,r.kt)("p",null,"The position of this transformation's camera, as ",(0,r.kt)("inlineCode",{parentName:"p"},"[x, y, z]")," in world coordinates."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:29"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getcamerarotation"},"getCameraRotation"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getCameraRotation"),"(): ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#readonlytransform3d"},(0,r.kt)("inlineCode",{parentName:"a"},"ReadonlyTransform3D"))),(0,r.kt)("p",null,"Gets the transformation representing the rotation of this transformation's camera."),(0,r.kt)("h4",{id:"returns-5"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#readonlytransform3d"},(0,r.kt)("inlineCode",{parentName:"a"},"ReadonlyTransform3D"))),(0,r.kt)("p",null,"The transformation representing the rotation of this transformation's camera."),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:37"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"getsurfaceposition"},"getSurfacePosition"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"getSurfacePosition"),"(): ",(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"copyWithin"'),">",">"),(0,r.kt)("p",null,"Gets the position of this transformation's projection surface relative to the camera, as ",(0,r.kt)("inlineCode",{parentName:"p"},"[x, y, z]")," in camera\ncoordinates."),(0,r.kt)("h4",{id:"returns-6"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"p"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"p"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"p"},'"copyWithin"'),">",">"),(0,r.kt)("p",null,"The position of this transformation's projection surface relative to the camera, as ",(0,r.kt)("inlineCode",{parentName:"p"},"[x, y, z]")," in camera\ncoordinates."),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:47"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"set"},"set"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"set"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"cameraPos"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"cameraRotation"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"surfacePos"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"Sets the parameters of this transformation."),(0,r.kt)("h4",{id:"parameters-2"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cameraPos")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The position of the camera, as ",(0,r.kt)("inlineCode",{parentName:"td"},"[x, y, z]")," in world coordinates.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cameraRotation")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#readonlytransform3d"},(0,r.kt)("inlineCode",{parentName:"a"},"ReadonlyTransform3D"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"A transformation representing the rotation of the camera.")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"surfacePos")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The position of the projection surface relative to the camera, as ",(0,r.kt)("inlineCode",{parentName:"td"},"[x, y, z]")," in camera coordinates.")))),(0,r.kt)("h4",{id:"returns-7"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"This transformation, after it has been changed."),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:59"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"set"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"transform"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"Sets the parameters of this transformation from another transformation."),(0,r.kt)("h4",{id:"parameters-3"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"transform")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#readonlytransformperspective"},(0,r.kt)("inlineCode",{parentName:"a"},"ReadonlyTransformPerspective"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"The transformation from which to take parameters.")))),(0,r.kt)("h4",{id:"returns-8"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:68"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setcameraposition"},"setCameraPosition"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"setCameraPosition"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"cameraPos"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"Sets the position of this projection's camera."),(0,r.kt)("h4",{id:"parameters-4"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cameraPos")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The position of the camera, as ",(0,r.kt)("inlineCode",{parentName:"td"},"[x, y, z]")," in world coordinates.")))),(0,r.kt)("h4",{id:"returns-9"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"This transformation, after it has been changed."),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:118"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setcamerarotation"},"setCameraRotation"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"setCameraRotation"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"cameraRotation"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"Sets the rotation of this projection's camera."),(0,r.kt)("h4",{id:"parameters-5"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"cameraRotation")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("a",{parentName:"td",href:"/msfs-avionics-mirror/docs/framework/modules#readonlytransform3d"},(0,r.kt)("inlineCode",{parentName:"a"},"ReadonlyTransform3D"))),(0,r.kt)("td",{parentName:"tr",align:"left"},"A transformation representing the rotation of the camera.")))),(0,r.kt)("h4",{id:"returns-10"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"This transformation, after it has been changed."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:130"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"setsurfaceposition"},"setSurfacePosition"),(0,r.kt)("p",null,"\u25b8 ",(0,r.kt)("strong",{parentName:"p"},"setSurfacePosition"),"(",(0,r.kt)("inlineCode",{parentName:"p"},"surfacePos"),"): ",(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"Sets the position of this transformation's projection surface relative to the camera."),(0,r.kt)("h4",{id:"parameters-6"},"Parameters"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,r.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"surfacePos")),(0,r.kt)("td",{parentName:"tr",align:"left"},(0,r.kt)("inlineCode",{parentName:"td"},"Readonly"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Omit"),"<",(0,r.kt)("inlineCode",{parentName:"td"},"Float64Array"),", ",(0,r.kt)("inlineCode",{parentName:"td"},'"set"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"sort"')," ","|"," ",(0,r.kt)("inlineCode",{parentName:"td"},'"copyWithin"'),">",">"),(0,r.kt)("td",{parentName:"tr",align:"left"},"The position of the projection surface relative to the camera, as ",(0,r.kt)("inlineCode",{parentName:"td"},"[x, y, z]")," in camera coordinates.")))),(0,r.kt)("h4",{id:"returns-11"},"Returns"),(0,r.kt)("p",null,(0,r.kt)("inlineCode",{parentName:"p"},"this")),(0,r.kt)("p",null,"This transformation, after it has been changed."),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/math/TransformPerspective.ts:143"))}k.isMDXComponent=!0}}]);