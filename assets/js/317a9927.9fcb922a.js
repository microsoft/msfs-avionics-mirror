"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[59697],{3905:(e,n,l)=>{l.d(n,{Zo:()=>s,kt:()=>v});var t=l(67294);function i(e,n,l){return n in e?Object.defineProperty(e,n,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[n]=l,e}function a(e,n){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),l.push.apply(l,t)}return l}function r(e){for(var n=1;n<arguments.length;n++){var l=null!=arguments[n]?arguments[n]:{};n%2?a(Object(l),!0).forEach((function(n){i(e,n,l[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):a(Object(l)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(l,n))}))}return e}function c(e,n){if(null==e)return{};var l,t,i=function(e,n){if(null==e)return{};var l,t,i={},a=Object.keys(e);for(t=0;t<a.length;t++)l=a[t],n.indexOf(l)>=0||(i[l]=e[l]);return i}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)l=a[t],n.indexOf(l)>=0||Object.prototype.propertyIsEnumerable.call(e,l)&&(i[l]=e[l])}return i}var _=t.createContext({}),u=function(e){var n=t.useContext(_),l=n;return e&&(l="function"==typeof e?e(n):r(r({},n),e)),l},s=function(e){var n=u(e.components);return t.createElement(_.Provider,{value:n},e.children)},d="mdxType",o={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},p=t.forwardRef((function(e,n){var l=e.components,i=e.mdxType,a=e.originalType,_=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),d=u(l),p=i,v=d["".concat(_,".").concat(p)]||d[p]||o[p]||a;return l?t.createElement(v,r(r({ref:n},s),{},{components:l})):t.createElement(v,r({ref:n},s))}));function v(e,n){var l=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var a=l.length,r=new Array(a);r[0]=p;var c={};for(var _ in n)hasOwnProperty.call(n,_)&&(c[_]=n[_]);c.originalType=e,c[d]="string"==typeof e?e:i,r[1]=c;for(var u=2;u<a;u++)r[u]=l[u];return t.createElement.apply(null,r)}return t.createElement.apply(null,l)}p.displayName="MDXCreateElement"},48708:(e,n,l)=>{l.r(n),l.d(n,{assets:()=>_,contentTitle:()=>r,default:()=>o,frontMatter:()=>a,metadata:()=>c,toc:()=>u});var t=l(87462),i=(l(67294),l(3905));const a={id:"BaseElectricalEvents",title:"Interface: BaseElectricalEvents",sidebar_label:"BaseElectricalEvents",sidebar_position:0,custom_edit_url:null},r=void 0,c={unversionedId:"framework/interfaces/BaseElectricalEvents",id:"framework/interfaces/BaseElectricalEvents",title:"Interface: BaseElectricalEvents",description:"Events relating to the electrical systems.",source:"@site/docs/framework/interfaces/BaseElectricalEvents.md",sourceDirName:"framework/interfaces",slug:"/framework/interfaces/BaseElectricalEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/BaseElectricalEvents",draft:!1,editUrl:null,tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"BaseElectricalEvents",title:"Interface: BaseElectricalEvents",sidebar_label:"BaseElectricalEvents",sidebar_position:0,custom_edit_url:null},sidebar:"sidebar",previous:{title:"BaseControlSurfacesEvents",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/BaseControlSurfacesEvents"},next:{title:"BaseFlightPathVector",permalink:"/msfs-avionics-mirror/docs/framework/interfaces/BaseFlightPathVector"}},_={},u=[{value:"Properties",id:"properties",level:2},{value:"elec_apu_gen_active",id:"elec_apu_gen_active",level:3},{value:"Defined in",id:"defined-in",level:4},{value:"elec_apu_gen_switch",id:"elec_apu_gen_switch",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"elec_av1_bus",id:"elec_av1_bus",level:3},{value:"Defined in",id:"defined-in-2",level:4},{value:"elec_av2_bus",id:"elec_av2_bus",level:3},{value:"Defined in",id:"defined-in-3",level:4},{value:"elec_bat_a",id:"elec_bat_a",level:3},{value:"Defined in",id:"defined-in-4",level:4},{value:"elec_bat_v",id:"elec_bat_v",level:3},{value:"Defined in",id:"defined-in-5",level:4},{value:"elec_bus_avionics_a",id:"elec_bus_avionics_a",level:3},{value:"Defined in",id:"defined-in-6",level:4},{value:"elec_bus_avionics_v",id:"elec_bus_avionics_v",level:3},{value:"Defined in",id:"defined-in-7",level:4},{value:"elec_bus_genalt_1_a",id:"elec_bus_genalt_1_a",level:3},{value:"Defined in",id:"defined-in-8",level:4},{value:"elec_bus_genalt_1_v",id:"elec_bus_genalt_1_v",level:3},{value:"Defined in",id:"defined-in-9",level:4},{value:"elec_bus_genalt_2_a",id:"elec_bus_genalt_2_a",level:3},{value:"Defined in",id:"defined-in-10",level:4},{value:"elec_bus_genalt_2_v",id:"elec_bus_genalt_2_v",level:3},{value:"Defined in",id:"defined-in-11",level:4},{value:"elec_bus_genalt_3_a",id:"elec_bus_genalt_3_a",level:3},{value:"Defined in",id:"defined-in-12",level:4},{value:"elec_bus_genalt_3_v",id:"elec_bus_genalt_3_v",level:3},{value:"Defined in",id:"defined-in-13",level:4},{value:"elec_bus_genalt_4_a",id:"elec_bus_genalt_4_a",level:3},{value:"Defined in",id:"defined-in-14",level:4},{value:"elec_bus_genalt_4_v",id:"elec_bus_genalt_4_v",level:3},{value:"Defined in",id:"defined-in-15",level:4},{value:"elec_bus_genalt_5_a",id:"elec_bus_genalt_5_a",level:3},{value:"Defined in",id:"defined-in-16",level:4},{value:"elec_bus_genalt_5_v",id:"elec_bus_genalt_5_v",level:3},{value:"Defined in",id:"defined-in-17",level:4},{value:"elec_bus_genalt_6_a",id:"elec_bus_genalt_6_a",level:3},{value:"Defined in",id:"defined-in-18",level:4},{value:"elec_bus_genalt_6_v",id:"elec_bus_genalt_6_v",level:3},{value:"Defined in",id:"defined-in-19",level:4},{value:"elec_bus_main_a",id:"elec_bus_main_a",level:3},{value:"Defined in",id:"defined-in-20",level:4},{value:"elec_bus_main_v",id:"elec_bus_main_v",level:3},{value:"Defined in",id:"defined-in-21",level:4},{value:"elec_circuit_avionics_on",id:"elec_circuit_avionics_on",level:3},{value:"Defined in",id:"defined-in-22",level:4},{value:"elec_circuit_navcom1_on",id:"elec_circuit_navcom1_on",level:3},{value:"Defined in",id:"defined-in-23",level:4},{value:"elec_circuit_navcom2_on",id:"elec_circuit_navcom2_on",level:3},{value:"Defined in",id:"defined-in-24",level:4},{value:"elec_circuit_navcom3_on",id:"elec_circuit_navcom3_on",level:3},{value:"Defined in",id:"defined-in-25",level:4},{value:"elec_circuit_on",id:"elec_circuit_on",level:3},{value:"Defined in",id:"defined-in-26",level:4},{value:"elec_circuit_switch_on",id:"elec_circuit_switch_on",level:3},{value:"Defined in",id:"defined-in-27",level:4},{value:"elec_eng_gen_switch",id:"elec_eng_gen_switch",level:3},{value:"Defined in",id:"defined-in-28",level:4},{value:"elec_ext_power_available",id:"elec_ext_power_available",level:3},{value:"Defined in",id:"defined-in-29",level:4},{value:"elec_ext_power_on",id:"elec_ext_power_on",level:3},{value:"Defined in",id:"defined-in-30",level:4},{value:"elec_master_battery",id:"elec_master_battery",level:3},{value:"Defined in",id:"defined-in-31",level:4}],s={toc:u},d="wrapper";function o(e){let{components:n,...l}=e;return(0,i.kt)(d,(0,t.Z)({},s,l,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Events relating to the electrical systems."),(0,i.kt)("h2",{id:"properties"},"Properties"),(0,i.kt)("h3",{id:"elec_apu_gen_active"},"elec","_","apu","_","gen","_","active"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","apu","_","gen","_","active"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A value for if APU generator is active"),(0,i.kt)("h4",{id:"defined-in"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:95"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_apu_gen_switch"},"elec","_","apu","_","gen","_","switch"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","apu","_","gen","_","switch"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A value for if APU generator switch is on"),(0,i.kt)("h4",{id:"defined-in-1"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:92"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_av1_bus"},"elec","_","av1","_","bus"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","av1","_","bus"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"The first avionics power bus."),(0,i.kt)("h4",{id:"defined-in-2"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:26"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_av2_bus"},"elec","_","av2","_","bus"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","av2","_","bus"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"The second avionics power bus."),(0,i.kt)("h4",{id:"defined-in-3"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:29"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bat_a"},"elec","_","bat","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bat","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the battery"),(0,i.kt)("h4",{id:"defined-in-4"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:83"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bat_v"},"elec","_","bat","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bat","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the battery"),(0,i.kt)("h4",{id:"defined-in-5"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:80"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_avionics_a"},"elec","_","bus","_","avionics","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","avionics","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the avinoics bus"),(0,i.kt)("h4",{id:"defined-in-6"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:41"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_avionics_v"},"elec","_","bus","_","avionics","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","avionics","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the avionics bus"),(0,i.kt)("h4",{id:"defined-in-7"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:38"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_1_a"},"elec","_","bus","_","genalt","_","1","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","1","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the generator/alternator 1 bus"),(0,i.kt)("h4",{id:"defined-in-8"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:62"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_1_v"},"elec","_","bus","_","genalt","_","1","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","1","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the generator/alternator 1 bus"),(0,i.kt)("h4",{id:"defined-in-9"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:44"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_2_a"},"elec","_","bus","_","genalt","_","2","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","2","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the generator/alternator 2 bus"),(0,i.kt)("h4",{id:"defined-in-10"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:65"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_2_v"},"elec","_","bus","_","genalt","_","2","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","2","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the generator/alternator 2 bus"),(0,i.kt)("h4",{id:"defined-in-11"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:47"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_3_a"},"elec","_","bus","_","genalt","_","3","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","3","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the generator/alternator 3 bus"),(0,i.kt)("h4",{id:"defined-in-12"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:68"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_3_v"},"elec","_","bus","_","genalt","_","3","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","3","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the generator/alternator 3 bus"),(0,i.kt)("h4",{id:"defined-in-13"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:50"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_4_a"},"elec","_","bus","_","genalt","_","4","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","4","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the generator/alternator 4 bus"),(0,i.kt)("h4",{id:"defined-in-14"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:71"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_4_v"},"elec","_","bus","_","genalt","_","4","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","4","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the generator/alternator 4 bus"),(0,i.kt)("h4",{id:"defined-in-15"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:53"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_5_a"},"elec","_","bus","_","genalt","_","5","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","5","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the generator/alternator 5 bus"),(0,i.kt)("h4",{id:"defined-in-16"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:74"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_5_v"},"elec","_","bus","_","genalt","_","5","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","5","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the generator/alternator 5 bus"),(0,i.kt)("h4",{id:"defined-in-17"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:56"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_6_a"},"elec","_","bus","_","genalt","_","6","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","6","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the generator/alternator 6 bus"),(0,i.kt)("h4",{id:"defined-in-18"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:77"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_genalt_6_v"},"elec","_","bus","_","genalt","_","6","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","genalt","_","6","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the generator/alternator 6 bus"),(0,i.kt)("h4",{id:"defined-in-19"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:59"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_main_a"},"elec","_","bus","_","main","_","a"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","main","_","a"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A current value for the main elec bus"),(0,i.kt)("h4",{id:"defined-in-20"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:35"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_bus_main_v"},"elec","_","bus","_","main","_","v"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","bus","_","main","_","v"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"number")),(0,i.kt)("p",null,"A voltage value for the main elec bus"),(0,i.kt)("h4",{id:"defined-in-21"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:32"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_circuit_avionics_on"},"elec","_","circuit","_","avionics","_","on"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","circuit","_","avionics","_","on"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"The avionics circuit is on or off."),(0,i.kt)("h4",{id:"defined-in-22"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:14"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_circuit_navcom1_on"},"elec","_","circuit","_","navcom1","_","on"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","circuit","_","navcom1","_","on"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"The navcom 1 circuit is on or off."),(0,i.kt)("h4",{id:"defined-in-23"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:17"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_circuit_navcom2_on"},"elec","_","circuit","_","navcom2","_","on"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","circuit","_","navcom2","_","on"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"The navcom 2 circuit is on of off."),(0,i.kt)("h4",{id:"defined-in-24"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:20"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_circuit_navcom3_on"},"elec","_","circuit","_","navcom3","_","on"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","circuit","_","navcom3","_","on"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"The navcom 3 circuit is on of off."),(0,i.kt)("h4",{id:"defined-in-25"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:23"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_circuit_on"},"elec","_","circuit","_","on"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","circuit","_","on"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A value indicating if a circuit is on"),(0,i.kt)("h4",{id:"defined-in-26"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:101"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_circuit_switch_on"},"elec","_","circuit","_","switch","_","on"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","circuit","_","switch","_","on"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A value for a circuit switch."),(0,i.kt)("h4",{id:"defined-in-27"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:104"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_eng_gen_switch"},"elec","_","eng","_","gen","_","switch"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","eng","_","gen","_","switch"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A value for if engine generator switch is on"),(0,i.kt)("h4",{id:"defined-in-28"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:98"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_ext_power_available"},"elec","_","ext","_","power","_","available"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","ext","_","power","_","available"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A value for if external power is available"),(0,i.kt)("h4",{id:"defined-in-29"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:86"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_ext_power_on"},"elec","_","ext","_","power","_","on"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","ext","_","power","_","on"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"A value for if external power is on"),(0,i.kt)("h4",{id:"defined-in-30"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:89"),(0,i.kt)("hr",null),(0,i.kt)("h3",{id:"elec_master_battery"},"elec","_","master","_","battery"),(0,i.kt)("p",null,"\u2022 ",(0,i.kt)("strong",{parentName:"p"},"elec","_","master","_","battery"),": ",(0,i.kt)("inlineCode",{parentName:"p"},"boolean")),(0,i.kt)("p",null,"Master battery power is switched on or not."),(0,i.kt)("h4",{id:"defined-in-31"},"Defined in"),(0,i.kt)("p",null,"src/sdk/instruments/Electrical.ts:11"))}o.isMDXComponent=!0}}]);