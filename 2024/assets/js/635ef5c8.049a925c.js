"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["596493"],{11508:function(e,a,r){r.r(a),r.d(a,{metadata:()=>s,contentTitle:()=>n,default:()=>h,assets:()=>c,toc:()=>o,frontMatter:()=>l});var s=JSON.parse('{"id":"api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory","title":"Class: abstract EventBusNavDataBarFieldTypeModelFactory\\\\<T, E\\\\>","description":"An abstract implementation of NavDataBarFieldTypeModelFactory which accesses data from the event bus to use","source":"@site/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"EspRollModule","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EspRollModule"},"next":{"title":"FailureBox","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/FailureBox"}}'),i=r("785893"),d=r("250065");let l={},n="Class: abstract EventBusNavDataBarFieldTypeModelFactory<T, E>",c={},o=[{value:"Extended by",id:"extended-by",level:2},{value:"Type Parameters",id:"type-parameters",level:2},{value:"Implements",id:"implements",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new EventBusNavDataBarFieldTypeModelFactory()",id:"new-eventbusnavdatabarfieldtypemodelfactory",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"sub",id:"sub",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"create()",id:"create",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Implementation of",id:"implementation-of",level:4},{value:"Defined in",id:"defined-in-2",level:4}];function t(e){let a={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(a.header,{children:(0,i.jsxs)(a.h1,{id:"class-abstract-eventbusnavdatabarfieldtypemodelfactoryt-e",children:["Class: ",(0,i.jsx)(a.code,{children:"abstract"})," EventBusNavDataBarFieldTypeModelFactory<T, E>"]})}),"\n",(0,i.jsxs)(a.p,{children:["An abstract implementation of ",(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/NavDataBarFieldTypeModelFactory",children:"NavDataBarFieldTypeModelFactory"})," which accesses data from the event bus to use\nto create its data models."]}),"\n",(0,i.jsx)(a.h2,{id:"extended-by",children:"Extended by"}),"\n",(0,i.jsxs)(a.ul,{children:["\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldAglModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldAglModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldBrgModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldBrgModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldCabinAltitudeModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldCabinAltitudeModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldClgModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldClgModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldClmModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldClmModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldDensityAltitudeModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldDensityAltitudeModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldDestModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldDestModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldDisModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldDisModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldDtgModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldDtgModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldDtkModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldDtkModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldEcoModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldEcoModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldEndModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldEndModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldEnrModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldEnrModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldEtaModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldEtaModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldEteModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldEteModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldFuelFlowModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldFuelFlowModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldFlightLevelModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldFlightLevelModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldFobModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldFobModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldFodModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldFodModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldGMeterModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldGMeterModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldGpsAltitudeModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldGpsAltitudeModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldGsModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldGsModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldIsaModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldIsaModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldLdgModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldLdgModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldMachModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldMachModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldOatModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldOatModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldRatModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldRatModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldTasModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldTasModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldTkeModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldTkeModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldTrkModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldTrkModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldUtcModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldUtcModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldVsrModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldVsrModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldWptModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldWptModelFactory"})})}),"\n",(0,i.jsx)(a.li,{children:(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldXtkModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldXtkModelFactory"})})}),"\n"]}),"\n",(0,i.jsx)(a.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(a.table,{children:[(0,i.jsx)(a.thead,{children:(0,i.jsx)(a.tr,{children:(0,i.jsx)(a.th,{children:"Type Parameter"})})}),(0,i.jsxs)(a.tbody,{children:[(0,i.jsx)(a.tr,{children:(0,i.jsxs)(a.td,{children:[(0,i.jsx)(a.code,{children:"T"})," ",(0,i.jsx)(a.em,{children:"extends"})," ",(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/NavDataFieldType",children:(0,i.jsx)(a.code,{children:"NavDataFieldType"})})]})}),(0,i.jsx)(a.tr,{children:(0,i.jsx)(a.td,{children:(0,i.jsx)(a.code,{children:"E"})})})]})]}),"\n",(0,i.jsx)(a.h2,{id:"implements",children:"Implements"}),"\n",(0,i.jsxs)(a.ul,{children:["\n",(0,i.jsxs)(a.li,{children:[(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/NavDataBarFieldTypeModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldTypeModelFactory"})}),"<",(0,i.jsx)(a.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,i.jsx)(a.h2,{id:"constructors",children:"Constructors"}),"\n",(0,i.jsx)(a.h3,{id:"new-eventbusnavdatabarfieldtypemodelfactory",children:"new EventBusNavDataBarFieldTypeModelFactory()"}),"\n",(0,i.jsxs)(a.blockquote,{children:["\n",(0,i.jsxs)(a.p,{children:[(0,i.jsx)(a.strong,{children:"new EventBusNavDataBarFieldTypeModelFactory"}),"<",(0,i.jsx)(a.code,{children:"T"}),", ",(0,i.jsx)(a.code,{children:"E"}),">(",(0,i.jsx)(a.code,{children:"bus"}),"): ",(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory",children:(0,i.jsx)(a.code,{children:"EventBusNavDataBarFieldTypeModelFactory"})}),"<",(0,i.jsx)(a.code,{children:"T"}),", ",(0,i.jsx)(a.code,{children:"E"}),">"]}),"\n"]}),"\n",(0,i.jsx)(a.p,{children:"Constructor."}),"\n",(0,i.jsx)(a.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(a.table,{children:[(0,i.jsx)(a.thead,{children:(0,i.jsxs)(a.tr,{children:[(0,i.jsx)(a.th,{children:"Parameter"}),(0,i.jsx)(a.th,{children:"Type"}),(0,i.jsx)(a.th,{children:"Description"})]})}),(0,i.jsx)(a.tbody,{children:(0,i.jsxs)(a.tr,{children:[(0,i.jsx)(a.td,{children:(0,i.jsx)(a.code,{children:"bus"})}),(0,i.jsx)(a.td,{children:(0,i.jsx)(a.code,{children:"EventBus"})}),(0,i.jsx)(a.td,{children:"The event bus."})]})})]}),"\n",(0,i.jsx)(a.h4,{id:"returns",children:"Returns"}),"\n",(0,i.jsxs)(a.p,{children:[(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory",children:(0,i.jsx)(a.code,{children:"EventBusNavDataBarFieldTypeModelFactory"})}),"<",(0,i.jsx)(a.code,{children:"T"}),", ",(0,i.jsx)(a.code,{children:"E"}),">"]}),"\n",(0,i.jsx)(a.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,i.jsx)(a.p,{children:"src/garminsdk/components/navdatabar/EventBusNavDataBarFieldTypeModelFactory.ts:18"}),"\n",(0,i.jsx)(a.h2,{id:"properties",children:"Properties"}),"\n",(0,i.jsx)(a.h3,{id:"sub",children:"sub"}),"\n",(0,i.jsxs)(a.blockquote,{children:["\n",(0,i.jsxs)(a.p,{children:[(0,i.jsx)(a.code,{children:"protected"})," ",(0,i.jsx)(a.code,{children:"readonly"})," ",(0,i.jsx)(a.strong,{children:"sub"}),": ",(0,i.jsx)(a.code,{children:"EventSubscriber"}),"<",(0,i.jsx)(a.code,{children:"E"}),">"]}),"\n"]}),"\n",(0,i.jsx)(a.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,i.jsx)(a.p,{children:"src/garminsdk/components/navdatabar/EventBusNavDataBarFieldTypeModelFactory.ts:12"}),"\n",(0,i.jsx)(a.h2,{id:"methods",children:"Methods"}),"\n",(0,i.jsx)(a.h3,{id:"create",children:"create()"}),"\n",(0,i.jsxs)(a.blockquote,{children:["\n",(0,i.jsxs)(a.p,{children:[(0,i.jsx)(a.code,{children:"abstract"})," ",(0,i.jsx)(a.strong,{children:"create"}),"(",(0,i.jsx)(a.code,{children:"gpsValidity"}),"): ",(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/NavDataBarFieldTypeModelMap",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldTypeModelMap"})}),"[",(0,i.jsx)(a.code,{children:"T"}),"]"]}),"\n"]}),"\n",(0,i.jsx)(a.p,{children:"Creates a navigation data bar field data model for this factory's data field type."}),"\n",(0,i.jsx)(a.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,i.jsxs)(a.table,{children:[(0,i.jsx)(a.thead,{children:(0,i.jsxs)(a.tr,{children:[(0,i.jsx)(a.th,{children:"Parameter"}),(0,i.jsx)(a.th,{children:"Type"}),(0,i.jsx)(a.th,{children:"Description"})]})}),(0,i.jsx)(a.tbody,{children:(0,i.jsxs)(a.tr,{children:[(0,i.jsx)(a.td,{children:(0,i.jsx)(a.code,{children:"gpsValidity"})}),(0,i.jsxs)(a.td,{children:[(0,i.jsx)(a.code,{children:"Subscribable"}),"<",(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/NavDataFieldGpsValidity",children:(0,i.jsx)(a.code,{children:"NavDataFieldGpsValidity"})}),">"]}),(0,i.jsx)(a.td,{children:"The subscribable that provides the validity of the GPS data for the models."})]})})]}),"\n",(0,i.jsx)(a.h4,{id:"returns-1",children:"Returns"}),"\n",(0,i.jsxs)(a.p,{children:[(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/type-aliases/NavDataBarFieldTypeModelMap",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldTypeModelMap"})}),"[",(0,i.jsx)(a.code,{children:"T"}),"]"]}),"\n",(0,i.jsx)(a.p,{children:"A navigation data bar field data model for this factory's data field type."}),"\n",(0,i.jsx)(a.h4,{id:"implementation-of",children:"Implementation of"}),"\n",(0,i.jsxs)(a.p,{children:[(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/NavDataBarFieldTypeModelFactory",children:(0,i.jsx)(a.code,{children:"NavDataBarFieldTypeModelFactory"})}),".",(0,i.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/NavDataBarFieldTypeModelFactory#create",children:(0,i.jsx)(a.code,{children:"create"})})]}),"\n",(0,i.jsx)(a.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,i.jsx)(a.p,{children:"src/garminsdk/components/navdatabar/EventBusNavDataBarFieldTypeModelFactory.ts:22"})]})}function h(e={}){let{wrapper:a}={...(0,d.a)(),...e.components};return a?(0,i.jsx)(a,{...e,children:(0,i.jsx)(t,{...e})}):t(e)}},250065:function(e,a,r){r.d(a,{Z:function(){return n},a:function(){return l}});var s=r(667294);let i={},d=s.createContext(i);function l(e){let a=s.useContext(d);return s.useMemo(function(){return"function"==typeof e?e(a):{...a,...e}},[a,e])}function n(e){let a;return a=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:l(e.components),s.createElement(d.Provider,{value:a},e.children)}}}]);