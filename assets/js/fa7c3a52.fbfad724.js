"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[88243],{3905:(e,n,a)=>{a.d(n,{Zo:()=>v,kt:()=>p});var t=a(67294);function r(e,n,a){return n in e?Object.defineProperty(e,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[n]=a,e}function i(e,n){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),a.push.apply(a,t)}return a}function l(e){for(var n=1;n<arguments.length;n++){var a=null!=arguments[n]?arguments[n]:{};n%2?i(Object(a),!0).forEach((function(n){r(e,n,a[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(a,n))}))}return e}function s(e,n){if(null==e)return{};var a,t,r=function(e,n){if(null==e)return{};var a,t,r={},i=Object.keys(e);for(t=0;t<i.length;t++)a=i[t],n.indexOf(a)>=0||(r[a]=e[a]);return r}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(t=0;t<i.length;t++)a=i[t],n.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var o=t.createContext({}),d=function(e){var n=t.useContext(o),a=n;return e&&(a="function"==typeof e?e(n):l(l({},n),e)),a},v=function(e){var n=d(e.components);return t.createElement(o.Provider,{value:n},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},f=t.forwardRef((function(e,n){var a=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,v=s(e,["components","mdxType","originalType","parentName"]),m=d(a),f=r,p=m["".concat(o,".").concat(f)]||m[f]||c[f]||i;return a?t.createElement(p,l(l({ref:n},v),{},{components:a})):t.createElement(p,l({ref:n},v))}));function p(e,n){var a=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=f;var s={};for(var o in n)hasOwnProperty.call(n,o)&&(s[o]=n[o]);s.originalType=e,s[m]="string"==typeof e?e:r,l[1]=s;for(var d=2;d<i;d++)l[d]=a[d];return t.createElement.apply(null,l)}return t.createElement.apply(null,a)}f.displayName="MDXCreateElement"},9224:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>o,contentTitle:()=>l,default:()=>c,frontMatter:()=>i,metadata:()=>s,toc:()=>d});var t=a(87462),r=(a(67294),a(3905));const i={id:"LNavSimVarEvents",title:"Interface: LNavSimVarEvents",sidebar_label:"LNavSimVarEvents",sidebar_position:0,custom_edit_url:null},l=void 0,s={unversionedId:"framework/interfaces/LNavSimVarEvents",id:"framework/interfaces/LNavSimVarEvents",title:"Interface: LNavSimVarEvents",description:"Events published by LNAV that are derived from SimVars.",source:"@site/docs/framework/interfaces/LNavSimVarEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/LNavSimVarEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LNavSimVarEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"LNavSimVarEvents",title:"Interface: LNavSimVarEvents",sidebar_label:"LNavSimVarEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"LNavOverrideModule",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LNavOverrideModule"},next:{title:"LatLonDisplayProps",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/LatLonDisplayProps"}},o={},d=[{value:"Hierarchy",id:"hierarchy",level:2},{value:"Properties",id:"properties",level:2},{value:"lnav_along_track_speed",id:"lnav_along_track_speed",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"lnav_course_to_steer",id:"lnav_course_to_steer",level:3},{value:"Inherited from",id:"inherited-from-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"lnav_dtk",id:"lnav_dtk",level:3},{value:"Inherited from",id:"inherited-from-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"lnav_is_suspended",id:"lnav_is_suspended",level:3},{value:"Inherited from",id:"inherited-from-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"lnav_is_tracking",id:"lnav_is_tracking",level:3},{value:"Inherited from",id:"inherited-from-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"lnav_leg_distance_along",id:"lnav_leg_distance_along",level:3},{value:"Inherited from",id:"inherited-from-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"lnav_leg_distance_remaining",id:"lnav_leg_distance_remaining",level:3},{value:"Inherited from",id:"inherited-from-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"lnav_tracked_leg_index",id:"lnav_tracked_leg_index",level:3},{value:"Inherited from",id:"inherited-from-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"lnav_tracked_vector_index",id:"lnav_tracked_vector_index",level:3},{value:"Inherited from",id:"inherited-from-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"lnav_transition_mode",id:"lnav_transition_mode",level:3},{value:"Inherited from",id:"inherited-from-9",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"lnav_vector_anticipation_distance",id:"lnav_vector_anticipation_distance",level:3},{value:"Inherited from",id:"inherited-from-10",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"lnav_vector_distance_along",id:"lnav_vector_distance_along",level:3},{value:"Inherited from",id:"inherited-from-11",level:4},{value:"Defined in",id:"defined-in-11",level:4},{value:"lnav_vector_distance_remaining",id:"lnav_vector_distance_remaining",level:3},{value:"Inherited from",id:"inherited-from-12",level:4},{value:"Defined in",id:"defined-in-12",level:4},{value:"lnav_xtk",id:"lnav_xtk",level:3},{value:"Inherited from",id:"inherited-from-13",level:4},{value:"Defined in",id:"defined-in-13",level:4}],v={toc:d},m="wrapper";function c(e){let{components:n,...a}=e;return(0,r.kt)(m,(0,t.Z)({},v,a,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Events published by LNAV that are derived from SimVars."),(0,r.kt)("h2",{id:"hierarchy"},"Hierarchy"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},(0,r.kt)("inlineCode",{parentName:"a"},"BaseLNavSimVarEvents")))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("p",{parentName:"li"},(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#indexedlnavsimvarevents"},(0,r.kt)("inlineCode",{parentName:"a"},"IndexedLNavSimVarEvents"))),(0,r.kt)("p",{parentName:"li"},"\u21b3 ",(0,r.kt)("strong",{parentName:"p"},(0,r.kt)("inlineCode",{parentName:"strong"},"LNavSimVarEvents"))))),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"lnav_along_track_speed"},"lnav","_","along","_","track","_","speed"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","along","_","track","_","speed"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current along-track ground speed of the airplane, in knots."),(0,r.kt)("h4",{id:"inherited-from"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_along_track_speed"},"lnav_along_track_speed")),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:135"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_course_to_steer"},"lnav","_","course","_","to","_","steer"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","course","_","to","_","steer"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current course LNAV is attempting to steer, in degrees true."),(0,r.kt)("h4",{id:"inherited-from-1"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_course_to_steer"},"lnav_course_to_steer")),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:99"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_dtk"},"lnav","_","dtk"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","dtk"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current desired track, in degrees true."),(0,r.kt)("h4",{id:"inherited-from-2"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_dtk"},"lnav_dtk")),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:78"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_is_suspended"},"lnav","_","is","_","suspended"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","is","_","suspended"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether LNAV sequencing is suspended."),(0,r.kt)("h4",{id:"inherited-from-3"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_is_suspended"},"lnav_is_suspended")),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:102"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_is_tracking"},"lnav","_","is","_","tracking"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","is","_","tracking"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether LNAV is tracking a path."),(0,r.kt)("h4",{id:"inherited-from-4"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_is_tracking"},"lnav_is_tracking")),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:87"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_leg_distance_along"},"lnav","_","leg","_","distance","_","along"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","leg","_","distance","_","along"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The along-track distance from the start of the currently tracked leg to the plane's present position, in nautical\nmiles. A negative distance indicates the plane is before the start of the leg."),(0,r.kt)("h4",{id:"inherited-from-5"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_leg_distance_along"},"lnav_leg_distance_along")),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:108"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_leg_distance_remaining"},"lnav","_","leg","_","distance","_","remaining"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","leg","_","distance","_","remaining"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The along-track distance remaining in the currently tracked leg, in nautical miles. A negative distance indicates\nthe plane is past the end of the leg."),(0,r.kt)("h4",{id:"inherited-from-6"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_leg_distance_remaining"},"lnav_leg_distance_remaining")),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:114"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_tracked_leg_index"},"lnav","_","tracked","_","leg","_","index"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","tracked","_","leg","_","index"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The global leg index of the flight plan leg LNAV is currently tracking."),(0,r.kt)("h4",{id:"inherited-from-7"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_tracked_leg_index"},"lnav_tracked_leg_index")),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:90"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_tracked_vector_index"},"lnav","_","tracked","_","vector","_","index"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","tracked","_","vector","_","index"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The index of the vector LNAV is currently tracking."),(0,r.kt)("h4",{id:"inherited-from-8"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_tracked_vector_index"},"lnav_tracked_vector_index")),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:96"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_transition_mode"},"lnav","_","transition","_","mode"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","transition","_","mode"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/enums/LNavTransitionMode"},(0,r.kt)("inlineCode",{parentName:"a"},"LNavTransitionMode"))),(0,r.kt)("p",null,"The currently active LNAV transition mode."),(0,r.kt)("h4",{id:"inherited-from-9"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_transition_mode"},"lnav_transition_mode")),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:93"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_vector_anticipation_distance"},"lnav","_","vector","_","anticipation","_","distance"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","vector","_","anticipation","_","distance"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The along-track distance from the current vector end where LNAV will sequence to the next vector in nautical miles.\nA positive value means the vector will be sequenced this distance prior to the vector end."),(0,r.kt)("h4",{id:"inherited-from-10"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_vector_anticipation_distance"},"lnav_vector_anticipation_distance")),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:132"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_vector_distance_along"},"lnav","_","vector","_","distance","_","along"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","vector","_","distance","_","along"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The along-track distance from the start of the currently tracked vector to the plane's present position, in\nnautical miles. A negative distance indicates the plane is before the start of the vector."),(0,r.kt)("h4",{id:"inherited-from-11"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_vector_distance_along"},"lnav_vector_distance_along")),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:120"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_vector_distance_remaining"},"lnav","_","vector","_","distance","_","remaining"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","vector","_","distance","_","remaining"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The along-track distance remaining in the currently tracked vector, in nautical miles. A negative distance\nindicates the plane is past the end of the vector."),(0,r.kt)("h4",{id:"inherited-from-12"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_vector_distance_remaining"},"lnav_vector_distance_remaining")),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:126"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_xtk"},"lnav","_","xtk"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","xtk"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"The current crosstrack error, in nautical miles. Negative values indicate deviation to the left, as viewed when\nfacing in the direction of the track. Positive values indicate deviation to the right."),(0,r.kt)("h4",{id:"inherited-from-13"},"Inherited from"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents"},"BaseLNavSimVarEvents"),".",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/BaseLNavSimVarEvents#lnav_xtk"},"lnav_xtk")),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"src/sdk/autopilot/lnav/LNavEvents.ts:84"))}c.isMDXComponent=!0}}]);