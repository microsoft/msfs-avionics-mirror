"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[92161],{3905:(e,n,t)=>{t.d(n,{Zo:()=>p,kt:()=>f});var i=t(67294);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function l(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?l(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,i,r=function(e,n){if(null==e)return{};var t,i,r={},l=Object.keys(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||(r[t]=e[t]);return r}(e,n);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(i=0;i<l.length;i++)t=l[i],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(r[t]=e[t])}return r}var d=i.createContext({}),o=function(e){var n=i.useContext(d),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},p=function(e){var n=o(e.components);return i.createElement(d.Provider,{value:n},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var n=e.children;return i.createElement(i.Fragment,{},n)}},k=i.forwardRef((function(e,n){var t=e.components,r=e.mdxType,l=e.originalType,d=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),c=o(t),k=r,f=c["".concat(d,".").concat(k)]||c[k]||u[k]||l;return t?i.createElement(f,a(a({ref:n},p),{},{components:t})):i.createElement(f,a({ref:n},p))}));function f(e,n){var t=arguments,r=n&&n.mdxType;if("string"==typeof e||r){var l=t.length,a=new Array(l);a[0]=k;var s={};for(var d in n)hasOwnProperty.call(n,d)&&(s[d]=n[d]);s.originalType=e,s[c]="string"==typeof e?e:r,a[1]=s;for(var o=2;o<l;o++)a[o]=t[o];return i.createElement.apply(null,a)}return i.createElement.apply(null,t)}k.displayName="MDXCreateElement"},35246:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>a,default:()=>u,frontMatter:()=>l,metadata:()=>s,toc:()=>o});var i=t(87462),r=(t(67294),t(3905));const l={id:"ControlEvents",title:"Interface: ControlEvents",sidebar_label:"ControlEvents",sidebar_position:0,custom_edit_url:null},a=void 0,s={unversionedId:"framework/interfaces/ControlEvents",id:"framework/interfaces/ControlEvents",title:"Interface: ControlEvents",description:"Control events, for where HEvents don't exist",source:"@site/docs/framework/interfaces/ControlEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/ControlEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ControlEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"ControlEvents",title:"Interface: ControlEvents",sidebar_label:"ControlEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"Consumer",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/Consumer"},next:{title:"ControlSurfacesEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/ControlSurfacesEvents"}},d={},o=[{value:"Indexable",id:"indexable",level:2},{value:"Properties",id:"properties",level:2},{value:"activate_missed_approach",id:"activate_missed_approach",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"approach_available",id:"approach_available",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"approach_freq_set",id:"approach_freq_set",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"baro_set",id:"baro_set",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"brg_src_set",id:"brg_src_set",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"brg_src_switch",id:"brg_src_switch",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"cdi_src_gps_toggle",id:"cdi_src_gps_toggle",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"cdi_src_set",id:"cdi_src_set",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"cdi_src_switch",id:"cdi_src_switch",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"com_spacing_set",id:"com_spacing_set",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"dme_toggle",id:"dme_toggle",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"init_cdi",id:"init_cdi",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"lnav_inhibit_next_sequence",id:"lnav_inhibit_next_sequence",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"publish_radio_states",id:"publish_radio_states",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"standby_com_freq",id:"standby_com_freq",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"standby_nav_freq",id:"standby_nav_freq",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"suspend_sequencing",id:"suspend_sequencing",level:3},{value:"Defined in",id:"defined-in-16",level:4}],p={toc:o},c="wrapper";function u(e){let{components:n,...t}=e;return(0,r.kt)(c,(0,i.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"Control events, for where HEvents don't exist"),(0,r.kt)("h2",{id:"indexable"},"Indexable"),(0,r.kt)("p",null,"\u25aa [publish_xpdr_code: ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#indexedeventtype"},(0,r.kt)("inlineCode",{parentName:"a"},"IndexedEventType")),"<",(0,r.kt)("inlineCode",{parentName:"p"},'"publish_xpdr_code"'),">","]: ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("h2",{id:"properties"},"Properties"),(0,r.kt)("h3",{id:"activate_missed_approach"},"activate","_","missed","_","approach"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"activate","_","missed","_","approach"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Event for setting missed approach state."),(0,r.kt)("h4",{id:"defined-in"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:54"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"approach_available"},"approach","_","available"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"approach","_","available"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether or not an approach is available for guidance."),(0,r.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:58"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"approach_freq_set"},"approach","_","freq","_","set"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"approach","_","freq","_","set"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"undefined")," ","|"," ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/interfaces/FacilityFrequency"},(0,r.kt)("inlineCode",{parentName:"a"},"FacilityFrequency"))),(0,r.kt)("p",null,"Approach Frequency Set by FMS."),(0,r.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:56"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"baro_set"},"baro","_","set"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"baro","_","set"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Event when user presses 'B' to auto set pressure."),(0,r.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:48"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"brg_src_set"},"brg","_","src","_","set"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"brg","_","src","_","set"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#indexednavsourcesetting"},(0,r.kt)("inlineCode",{parentName:"a"},"IndexedNavSourceSetting"))),(0,r.kt)("p",null,"Set the source of a given bearing needle"),(0,r.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:26"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"brg_src_switch"},"brg","_","src","_","switch"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"brg","_","src","_","switch"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"number")),(0,r.kt)("p",null,"Increment the source of a given bearing needle number"),(0,r.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:28"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cdi_src_gps_toggle"},"cdi","_","src","_","gps","_","toggle"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"cdi","_","src","_","gps","_","toggle"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"toggle CDI source between GPS and NAV"),(0,r.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:24"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cdi_src_set"},"cdi","_","src","_","set"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"cdi","_","src","_","set"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#navsourceid"},(0,r.kt)("inlineCode",{parentName:"a"},"NavSourceId"))),(0,r.kt)("p",null,"explicitly set a CDI source"),(0,r.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:22"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"cdi_src_switch"},"cdi","_","src","_","switch"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"cdi","_","src","_","switch"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"increment the CDI source"),(0,r.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:20"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"com_spacing_set"},"com","_","spacing","_","set"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"com","_","spacing","_","set"),": ",(0,r.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/framework/modules#comspacingchangeevent"},(0,r.kt)("inlineCode",{parentName:"a"},"ComSpacingChangeEvent"))),(0,r.kt)("p",null,"Set the COM spacing for a radio."),(0,r.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:44"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"dme_toggle"},"dme","_","toggle"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"dme","_","toggle"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"toggle DME window"),(0,r.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:40"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"init_cdi"},"init","_","cdi"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"init","_","cdi"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Init the CDI Source"),(0,r.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:38"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"lnav_inhibit_next_sequence"},"lnav","_","inhibit","_","next","_","sequence"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"lnav","_","inhibit","_","next","_","sequence"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Whether LNAV should automatically inhibit the next attempt to sequence to the next flight plan leg."),(0,r.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:52"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"publish_radio_states"},"publish","_","radio","_","states"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"publish","_","radio","_","states"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Publish radio state"),(0,r.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:30"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"standby_com_freq"},"standby","_","com","_","freq"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"standby","_","com","_","freq"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"Set the current standby com frequency as a string."),(0,r.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:42"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"standby_nav_freq"},"standby","_","nav","_","freq"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"standby","_","nav","_","freq"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"string")),(0,r.kt)("p",null,"Set the current standby nav frequency as a string."),(0,r.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:46"),(0,r.kt)("hr",null),(0,r.kt)("h3",{id:"suspend_sequencing"},"suspend","_","sequencing"),(0,r.kt)("p",null,"\u2022 ",(0,r.kt)("strong",{parentName:"p"},"suspend","_","sequencing"),": ",(0,r.kt)("inlineCode",{parentName:"p"},"boolean")),(0,r.kt)("p",null,"Event when a user suspends LNAV leg sequencing."),(0,r.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,r.kt)("p",null,"src/sdk/data/ControlPublisher.ts:50"))}u.isMDXComponent=!0}}]);