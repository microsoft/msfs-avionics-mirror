"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["475019"],{177965:function(e,a,r){r.r(a),r.d(a,{metadata:()=>s,contentTitle:()=>t,default:()=>h,assets:()=>l,toc:()=>c,frontMatter:()=>i});var s=JSON.parse('{"id":"api/garminsdk/classes/NavDataBarFieldWptModelFactory","title":"Class: NavDataBarFieldWptModelFactory","description":"Creates data models for Active Waypoint navigation data bar fields.","source":"@site/docs/api/garminsdk/classes/NavDataBarFieldWptModelFactory.md","sourceDirName":"api/garminsdk/classes","slug":"/api/garminsdk/classes/NavDataBarFieldWptModelFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldWptModelFactory","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"NavDataBarFieldVsrModelFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldVsrModelFactory"},"next":{"title":"NavDataBarFieldXtkModelFactory","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldXtkModelFactory"}}'),d=r("785893"),n=r("250065");let i={},t="Class: NavDataBarFieldWptModelFactory",l={},c=[{value:"Extends",id:"extends",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new NavDataBarFieldWptModelFactory()",id:"new-navdatabarfieldwptmodelfactory",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Overrides",id:"overrides",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"lnavIndex",id:"lnavindex",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"sub",id:"sub",level:3},{value:"Inherited from",id:"inherited-from",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"Methods",id:"methods",level:2},{value:"create()",id:"create",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Overrides",id:"overrides-1",level:4},{value:"Defined in",id:"defined-in-3",level:4}];function o(e){let a={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",li:"li",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,n.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(a.header,{children:(0,d.jsx)(a.h1,{id:"class-navdatabarfieldwptmodelfactory",children:"Class: NavDataBarFieldWptModelFactory"})}),"\n",(0,d.jsx)(a.p,{children:"Creates data models for Active Waypoint navigation data bar fields."}),"\n",(0,d.jsx)(a.h2,{id:"extends",children:"Extends"}),"\n",(0,d.jsxs)(a.ul,{children:["\n",(0,d.jsxs)(a.li,{children:[(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory",children:(0,d.jsx)(a.code,{children:"EventBusNavDataBarFieldTypeModelFactory"})}),"<",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/NavDataFieldType#waypoint",children:(0,d.jsx)(a.code,{children:"Waypoint"})}),", ",(0,d.jsx)(a.code,{children:"LNavEvents"})," & ",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/LNavDataEvents",children:(0,d.jsx)(a.code,{children:"LNavDataEvents"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(a.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(a.h3,{id:"new-navdatabarfieldwptmodelfactory",children:"new NavDataBarFieldWptModelFactory()"}),"\n",(0,d.jsxs)(a.blockquote,{children:["\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.strong,{children:"new NavDataBarFieldWptModelFactory"}),"(",(0,d.jsx)(a.code,{children:"bus"}),", ",(0,d.jsx)(a.code,{children:"lnavIndex"}),"): ",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldWptModelFactory",children:(0,d.jsx)(a.code,{children:"NavDataBarFieldWptModelFactory"})})]}),"\n"]}),"\n",(0,d.jsx)(a.p,{children:"Creates a new instance of NavDataBarFieldWptModelFactory."}),"\n",(0,d.jsx)(a.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(a.table,{children:[(0,d.jsx)(a.thead,{children:(0,d.jsxs)(a.tr,{children:[(0,d.jsx)(a.th,{children:"Parameter"}),(0,d.jsx)(a.th,{children:"Type"}),(0,d.jsx)(a.th,{children:"Default value"}),(0,d.jsx)(a.th,{children:"Description"})]})}),(0,d.jsxs)(a.tbody,{children:[(0,d.jsxs)(a.tr,{children:[(0,d.jsx)(a.td,{children:(0,d.jsx)(a.code,{children:"bus"})}),(0,d.jsx)(a.td,{children:(0,d.jsx)(a.code,{children:"EventBus"})}),(0,d.jsx)(a.td,{children:(0,d.jsx)(a.code,{children:"undefined"})}),(0,d.jsx)(a.td,{children:"The event bus."})]}),(0,d.jsxs)(a.tr,{children:[(0,d.jsx)(a.td,{children:(0,d.jsx)(a.code,{children:"lnavIndex"})}),(0,d.jsxs)(a.td,{children:[(0,d.jsx)(a.code,{children:"number"})," | ",(0,d.jsx)(a.code,{children:"Subscribable"}),"<",(0,d.jsx)(a.code,{children:"number"}),">"]}),(0,d.jsx)(a.td,{children:(0,d.jsx)(a.code,{children:"0"})}),(0,d.jsxs)(a.td,{children:["The index of the LNAV from which to source data. Defaults to ",(0,d.jsx)(a.code,{children:"0"}),"."]})]})]})]}),"\n",(0,d.jsx)(a.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsx)(a.p,{children:(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/NavDataBarFieldWptModelFactory",children:(0,d.jsx)(a.code,{children:"NavDataBarFieldWptModelFactory"})})}),"\n",(0,d.jsx)(a.h4,{id:"overrides",children:"Overrides"}),"\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory",children:(0,d.jsx)(a.code,{children:"EventBusNavDataBarFieldTypeModelFactory"})}),".",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory#constructors",children:(0,d.jsx)(a.code,{children:"constructor"})})]}),"\n",(0,d.jsx)(a.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(a.p,{children:"src/garminsdk/components/navdatabar/NavDataBarFieldTypeModelFactories.ts:1082"}),"\n",(0,d.jsx)(a.h2,{id:"properties",children:"Properties"}),"\n",(0,d.jsx)(a.h3,{id:"lnavindex",children:"lnavIndex"}),"\n",(0,d.jsxs)(a.blockquote,{children:["\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.code,{children:"protected"})," ",(0,d.jsx)(a.code,{children:"readonly"})," ",(0,d.jsx)(a.strong,{children:"lnavIndex"}),": ",(0,d.jsx)(a.code,{children:"number"})," | ",(0,d.jsx)(a.code,{children:"Subscribable"}),"<",(0,d.jsx)(a.code,{children:"number"}),"> = ",(0,d.jsx)(a.code,{children:"0"})]}),"\n"]}),"\n",(0,d.jsxs)(a.p,{children:["The index of the LNAV from which to source data. Defaults to ",(0,d.jsx)(a.code,{children:"0"}),"."]}),"\n",(0,d.jsx)(a.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(a.p,{children:"src/garminsdk/components/navdatabar/NavDataBarFieldTypeModelFactories.ts:1082"}),"\n",(0,d.jsx)(a.hr,{}),"\n",(0,d.jsx)(a.h3,{id:"sub",children:"sub"}),"\n",(0,d.jsxs)(a.blockquote,{children:["\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.code,{children:"protected"})," ",(0,d.jsx)(a.code,{children:"readonly"})," ",(0,d.jsx)(a.strong,{children:"sub"}),": ",(0,d.jsx)(a.code,{children:"EventSubscriber"}),"<",(0,d.jsx)(a.code,{children:"LNavEvents"})," & ",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/LNavDataEvents",children:(0,d.jsx)(a.code,{children:"LNavDataEvents"})}),">"]}),"\n"]}),"\n",(0,d.jsx)(a.h4,{id:"inherited-from",children:"Inherited from"}),"\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory",children:(0,d.jsx)(a.code,{children:"EventBusNavDataBarFieldTypeModelFactory"})}),".",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory#sub",children:(0,d.jsx)(a.code,{children:"sub"})})]}),"\n",(0,d.jsx)(a.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(a.p,{children:"src/garminsdk/components/navdatabar/EventBusNavDataBarFieldTypeModelFactory.ts:12"}),"\n",(0,d.jsx)(a.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(a.h3,{id:"create",children:"create()"}),"\n",(0,d.jsxs)(a.blockquote,{children:["\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.strong,{children:"create"}),"(",(0,d.jsx)(a.code,{children:"gpsValidity"}),"): ",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/NavDataBarFieldModel",children:(0,d.jsx)(a.code,{children:"NavDataBarFieldModel"})}),"<",(0,d.jsx)(a.code,{children:"string"}),">"]}),"\n"]}),"\n",(0,d.jsx)(a.p,{children:"Creates a navigation data bar field data model for this factory's data field type."}),"\n",(0,d.jsx)(a.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(a.table,{children:[(0,d.jsx)(a.thead,{children:(0,d.jsxs)(a.tr,{children:[(0,d.jsx)(a.th,{children:"Parameter"}),(0,d.jsx)(a.th,{children:"Type"}),(0,d.jsx)(a.th,{children:"Description"})]})}),(0,d.jsx)(a.tbody,{children:(0,d.jsxs)(a.tr,{children:[(0,d.jsx)(a.td,{children:(0,d.jsx)(a.code,{children:"gpsValidity"})}),(0,d.jsxs)(a.td,{children:[(0,d.jsx)(a.code,{children:"Subscribable"}),"<",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/enumerations/NavDataFieldGpsValidity",children:(0,d.jsx)(a.code,{children:"NavDataFieldGpsValidity"})}),">"]}),(0,d.jsx)(a.td,{children:"The subscribable that provides the validity of the GPS data for the models."})]})})]}),"\n",(0,d.jsx)(a.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/NavDataBarFieldModel",children:(0,d.jsx)(a.code,{children:"NavDataBarFieldModel"})}),"<",(0,d.jsx)(a.code,{children:"string"}),">"]}),"\n",(0,d.jsx)(a.p,{children:"A navigation data bar field data model for this factory's data field type."}),"\n",(0,d.jsx)(a.h4,{id:"overrides-1",children:"Overrides"}),"\n",(0,d.jsxs)(a.p,{children:[(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory",children:(0,d.jsx)(a.code,{children:"EventBusNavDataBarFieldTypeModelFactory"})}),".",(0,d.jsx)(a.a,{href:"/msfs-avionics-mirror/2024/docs/api/garminsdk/classes/EventBusNavDataBarFieldTypeModelFactory#create",children:(0,d.jsx)(a.code,{children:"create"})})]}),"\n",(0,d.jsx)(a.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(a.p,{children:"src/garminsdk/components/navdatabar/NavDataBarFieldTypeModelFactories.ts:1087"})]})}function h(e={}){let{wrapper:a}={...(0,n.a)(),...e.components};return a?(0,d.jsx)(a,{...e,children:(0,d.jsx)(o,{...e})}):o(e)}},250065:function(e,a,r){r.d(a,{Z:function(){return t},a:function(){return i}});var s=r(667294);let d={},n=s.createContext(d);function i(e){let a=s.useContext(n);return s.useMemo(function(){return"function"==typeof e?e(a):{...a,...e}},[a,e])}function t(e){let a;return a=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:i(e.components),s.createElement(n.Provider,{value:a},e.children)}}}]);