"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["642472"],{963896:function(e,i,r){r.r(i),r.d(i,{metadata:()=>n,contentTitle:()=>c,default:()=>o,assets:()=>t,toc:()=>h,frontMatter:()=>l});var n=JSON.parse('{"id":"api/framework/classes/FacilityRepository","title":"Class: FacilityRepository","description":"A repository of facilities.","source":"@site/docs/api/framework/classes/FacilityRepository.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/FacilityRepository","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/FacilityRepository","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"FacilityLoader","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/FacilityLoader"},"next":{"title":"FacilityUtils","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/FacilityUtils"}}'),s=r("785893"),d=r("250065");let l={},c="Class: FacilityRepository",t={},h=[{value:"Methods",id:"methods",level:2},{value:"add()",id:"add",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"addMultiple()",id:"addmultiple",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"forEach()",id:"foreach",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"get()",id:"get",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"remove()",id:"remove",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Throws",id:"throws-1",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"removeMultiple()",id:"removemultiple",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"search()",id:"search",level:3},{value:"search(type, lat, lon, radius, visitor)",id:"searchtype-lat-lon-radius-visitor",level:4},{value:"Parameters",id:"parameters-6",level:5},{value:"Returns",id:"returns-6",level:5},{value:"Throws",id:"throws-2",level:5},{value:"Defined in",id:"defined-in-6",level:5},{value:"search(type, lat, lon, radius, maxResultCount, out, filter)",id:"searchtype-lat-lon-radius-maxresultcount-out-filter",level:4},{value:"Parameters",id:"parameters-7",level:5},{value:"Returns",id:"returns-7",level:5},{value:"Throws",id:"throws-3",level:5},{value:"Defined in",id:"defined-in-7",level:5},{value:"size()",id:"size",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"getRepository()",id:"getrepository",level:3},{value:"Parameters",id:"parameters-9",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-9",level:4}];function a(e){let i={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,d.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(i.header,{children:(0,s.jsx)(i.h1,{id:"class-facilityrepository",children:"Class: FacilityRepository"})}),"\n",(0,s.jsx)(i.p,{children:"A repository of facilities."}),"\n",(0,s.jsx)(i.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(i.h3,{id:"add",children:"add()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"add"}),"(",(0,s.jsx)(i.code,{children:"fac"}),"): ",(0,s.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Adds a facility to this repository and all other repositories synced with this one. If this repository already\ncontains a facility with the same ICAO as the facility to add, the existing facility will be replaced with the\nnew one."}),"\n",(0,s.jsx)(i.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"fac"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})})}),(0,s.jsx)(i.td,{children:"The facility to add."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"void"})}),"\n",(0,s.jsx)(i.h4,{id:"throws",children:"Throws"}),"\n",(0,s.jsx)(i.p,{children:"Error if the facility has an invalid ICAO."}),"\n",(0,s.jsx)(i.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:234"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"addmultiple",children:"addMultiple()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"addMultiple"}),"(",(0,s.jsx)(i.code,{children:"facs"}),"): ",(0,s.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Adds multiple facilities from this repository and all other repositories synced with this one. For each added\nfacility, if this repository already contains a facility with the same ICAO, the existing facility will be\nreplaced with the new one."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"facs"})}),(0,s.jsxs)(i.td,{children:["readonly ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})}),"[]"]}),(0,s.jsx)(i.td,{children:"The facilities to add."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"void"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:249"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"foreach",children:"forEach()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"forEach"}),"(",(0,s.jsx)(i.code,{children:"fn"}),", ",(0,s.jsx)(i.code,{children:"types"}),"?): ",(0,s.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Iterates over every facility in this respository with a visitor function."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsxs)(i.tbody,{children:[(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"fn"})}),(0,s.jsxs)(i.td,{children:["(",(0,s.jsx)(i.code,{children:"fac"}),") => ",(0,s.jsx)(i.code,{children:"void"})]}),(0,s.jsx)(i.td,{children:"A visitor function."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsxs)(i.td,{children:[(0,s.jsx)(i.code,{children:"types"}),"?"]}),(0,s.jsxs)(i.td,{children:["readonly ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/FacilityType",children:(0,s.jsx)(i.code,{children:"FacilityType"})}),"[]"]}),(0,s.jsx)(i.td,{children:"The types of facilities over which to iterate. Defaults to all facility types."})]})]})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"void"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:283"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"get",children:"get()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"get"}),"(",(0,s.jsx)(i.code,{children:"icao"}),"): ",(0,s.jsx)(i.code,{children:"undefined"})," | ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Retrieves a facility from this repository."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"icao"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/IcaoValue",children:(0,s.jsx)(i.code,{children:"IcaoValue"})})}),(0,s.jsx)(i.td,{children:"The ICAO of the facility to retrieve."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.code,{children:"undefined"})," | ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})})]}),"\n",(0,s.jsx)(i.p,{children:"The requested user facility, or undefined if it was not found in this repository."}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:166"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"remove",children:"remove()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"remove"}),"(",(0,s.jsx)(i.code,{children:"fac"}),"): ",(0,s.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Removes a facility from this repository and all other repositories synced with this one."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"fac"})}),(0,s.jsxs)(i.td,{children:[(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/IcaoValue",children:(0,s.jsx)(i.code,{children:"IcaoValue"})})," | ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})})]}),(0,s.jsx)(i.td,{children:"The facility to remove, or the ICAO of the facility to remove."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"void"})}),"\n",(0,s.jsx)(i.h4,{id:"throws-1",children:"Throws"}),"\n",(0,s.jsx)(i.p,{children:"Error if the facility has an invalid ICAO."}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:259"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"removemultiple",children:"removeMultiple()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"removeMultiple"}),"(",(0,s.jsx)(i.code,{children:"facs"}),"): ",(0,s.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Removes multiple facilities from this repository and all other repositories synced with this one."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"facs"})}),(0,s.jsxs)(i.td,{children:["readonly (",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/IcaoValue",children:(0,s.jsx)(i.code,{children:"IcaoValue"})})," | ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})}),")[]"]}),(0,s.jsx)(i.td,{children:"The facilities to remove, or the ICAOs of the facilties to remove."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-5",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"void"})}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:273"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"search",children:"search()"}),"\n",(0,s.jsx)(i.h4,{id:"searchtype-lat-lon-radius-visitor",children:"search(type, lat, lon, radius, visitor)"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"search"}),"(",(0,s.jsx)(i.code,{children:"type"}),", ",(0,s.jsx)(i.code,{children:"lat"}),", ",(0,s.jsx)(i.code,{children:"lon"}),", ",(0,s.jsx)(i.code,{children:"radius"}),", ",(0,s.jsx)(i.code,{children:"visitor"}),"): ",(0,s.jsx)(i.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Searches for facilities around a point. Only supported for USR and VIS facilities."}),"\n",(0,s.jsx)(i.h5,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsxs)(i.tbody,{children:[(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"type"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/FacilityRepositorySearchableTypes",children:(0,s.jsx)(i.code,{children:"FacilityRepositorySearchableTypes"})})}),(0,s.jsx)(i.td,{children:"The type of facility for which to search."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"lat"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"number"})}),(0,s.jsx)(i.td,{children:"The latitude of the query point, in degrees."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"lon"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"number"})}),(0,s.jsx)(i.td,{children:"The longitude of the query point, in degrees."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"radius"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"number"})}),(0,s.jsx)(i.td,{children:"The radius of the search, in great-arc radians."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"visitor"})}),(0,s.jsxs)(i.td,{children:[(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GeoKdTreeSearchVisitor",children:(0,s.jsx)(i.code,{children:"GeoKdTreeSearchVisitor"})}),"<",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})}),">"]}),(0,s.jsxs)(i.td,{children:["A visitor function. This function will be called once per element found within the search radius. If the visitor returns ",(0,s.jsx)(i.code,{children:"true"}),", then the search will continue; if the visitor returns ",(0,s.jsx)(i.code,{children:"false"}),", the search will immediately halt."]})]})]})]}),"\n",(0,s.jsx)(i.h5,{id:"returns-6",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"void"})}),"\n",(0,s.jsx)(i.h5,{id:"throws-2",children:"Throws"}),"\n",(0,s.jsx)(i.p,{children:"Error if spatial searches are not supported for the specified facility type."}),"\n",(0,s.jsx)(i.h5,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:185"}),"\n",(0,s.jsx)(i.h4,{id:"searchtype-lat-lon-radius-maxresultcount-out-filter",children:"search(type, lat, lon, radius, maxResultCount, out, filter)"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"search"}),"(",(0,s.jsx)(i.code,{children:"type"}),", ",(0,s.jsx)(i.code,{children:"lat"}),", ",(0,s.jsx)(i.code,{children:"lon"}),", ",(0,s.jsx)(i.code,{children:"radius"}),", ",(0,s.jsx)(i.code,{children:"maxResultCount"}),", ",(0,s.jsx)(i.code,{children:"out"}),", ",(0,s.jsx)(i.code,{children:"filter"}),"?): ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})}),"[]"]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Searches for facilities around a point. Only supported for USR and VIS facilities."}),"\n",(0,s.jsx)(i.h5,{id:"parameters-7",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsxs)(i.tbody,{children:[(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"type"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/FacilityRepositorySearchableTypes",children:(0,s.jsx)(i.code,{children:"FacilityRepositorySearchableTypes"})})}),(0,s.jsx)(i.td,{children:"The type of facility for which to search."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"lat"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"number"})}),(0,s.jsx)(i.td,{children:"The latitude of the query point, in degrees."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"lon"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"number"})}),(0,s.jsx)(i.td,{children:"The longitude of the query point, in degrees."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"radius"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"number"})}),(0,s.jsx)(i.td,{children:"The radius of the search, in great-arc radians."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"maxResultCount"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"number"})}),(0,s.jsx)(i.td,{children:"The maximum number of search results to return."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"out"})}),(0,s.jsxs)(i.td,{children:[(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})}),"[]"]}),(0,s.jsx)(i.td,{children:"An array in which to store the search results."})]}),(0,s.jsxs)(i.tr,{children:[(0,s.jsxs)(i.td,{children:[(0,s.jsx)(i.code,{children:"filter"}),"?"]}),(0,s.jsxs)(i.td,{children:[(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GeoKdTreeSearchFilter",children:(0,s.jsx)(i.code,{children:"GeoKdTreeSearchFilter"})}),"<",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})}),">"]}),(0,s.jsx)(i.td,{children:"A function to filter the search results."})]})]})]}),"\n",(0,s.jsx)(i.h5,{id:"returns-7",children:"Returns"}),"\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/Facility",children:(0,s.jsx)(i.code,{children:"Facility"})}),"[]"]}),"\n",(0,s.jsx)(i.h5,{id:"throws-3",children:"Throws"}),"\n",(0,s.jsx)(i.p,{children:"Error if spatial searches are not supported for the specified facility type."}),"\n",(0,s.jsx)(i.h5,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:197"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"size",children:"size()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.strong,{children:"size"}),"(",(0,s.jsx)(i.code,{children:"types"}),"?): ",(0,s.jsx)(i.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Gets the number of facilities stored in this repository."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-8",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsxs)(i.td,{children:[(0,s.jsx)(i.code,{children:"types"}),"?"]}),(0,s.jsxs)(i.td,{children:["readonly ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/enumerations/FacilityType",children:(0,s.jsx)(i.code,{children:"FacilityType"})}),"[]"]}),(0,s.jsx)(i.td,{children:"The types of facilities to count. Defaults to all facility types."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-8",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.code,{children:"number"})}),"\n",(0,s.jsx)(i.p,{children:"The number of facilities stored in this repository."}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:145"}),"\n",(0,s.jsx)(i.hr,{}),"\n",(0,s.jsx)(i.h3,{id:"getrepository",children:"getRepository()"}),"\n",(0,s.jsxs)(i.blockquote,{children:["\n",(0,s.jsxs)(i.p,{children:[(0,s.jsx)(i.code,{children:"static"})," ",(0,s.jsx)(i.strong,{children:"getRepository"}),"(",(0,s.jsx)(i.code,{children:"bus"}),"): ",(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/FacilityRepository",children:(0,s.jsx)(i.code,{children:"FacilityRepository"})})]}),"\n"]}),"\n",(0,s.jsx)(i.p,{children:"Gets an instance of FacilityRepository."}),"\n",(0,s.jsx)(i.h4,{id:"parameters-9",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(i.table,{children:[(0,s.jsx)(i.thead,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.th,{children:"Parameter"}),(0,s.jsx)(i.th,{children:"Type"}),(0,s.jsx)(i.th,{children:"Description"})]})}),(0,s.jsx)(i.tbody,{children:(0,s.jsxs)(i.tr,{children:[(0,s.jsx)(i.td,{children:(0,s.jsx)(i.code,{children:"bus"})}),(0,s.jsx)(i.td,{children:(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/EventBus",children:(0,s.jsx)(i.code,{children:"EventBus"})})}),(0,s.jsx)(i.td,{children:"The event bus."})]})})]}),"\n",(0,s.jsx)(i.h4,{id:"returns-9",children:"Returns"}),"\n",(0,s.jsx)(i.p,{children:(0,s.jsx)(i.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/FacilityRepository",children:(0,s.jsx)(i.code,{children:"FacilityRepository"})})}),"\n",(0,s.jsx)(i.p,{children:"an instance of FacilityRepository."}),"\n",(0,s.jsx)(i.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,s.jsx)(i.p,{children:"src/sdk/navigation/FacilityRepository.ts:523"})]})}function o(e={}){let{wrapper:i}={...(0,d.a)(),...e.components};return i?(0,s.jsx)(i,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},250065:function(e,i,r){r.d(i,{Z:function(){return c},a:function(){return l}});var n=r(667294);let s={},d=n.createContext(s);function l(e){let i=n.useContext(d);return n.useMemo(function(){return"function"==typeof e?e(i):{...i,...e}},[i,e])}function c(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:l(e.components),n.createElement(d.Provider,{value:i},e.children)}}}]);