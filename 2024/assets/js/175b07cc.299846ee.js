"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["79406"],{947841:function(e,n,r){r.r(n),r.d(n,{metadata:()=>s,contentTitle:()=>l,default:()=>o,assets:()=>c,toc:()=>h,frontMatter:()=>t});var s=JSON.parse('{"id":"api/framework/classes/GeoKdTree","title":"Class: GeoKdTree\\\\<T\\\\>","description":"A spatial tree which is keyed on points on Earth\'s surface and allows searching for elements based on the great-","source":"@site/docs/api/framework/classes/GeoKdTree.md","sourceDirName":"api/framework/classes","slug":"/api/framework/classes/GeoKdTree","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoKdTree","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GeodesicResampler","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeodesicResampler"},"next":{"title":"GeoMath","permalink":"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoMath"}}'),d=r("785893"),i=r("250065");let t={},l="Class: GeoKdTree<T>",c={},h=[{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new GeoKdTree()",id:"new-geokdtree",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Throws",id:"throws",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Methods",id:"methods",level:2},{value:"clear()",id:"clear",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-1",level:4},{value:"insert()",id:"insert",level:3},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"insertAll()",id:"insertall",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"rebuild()",id:"rebuild",level:3},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"remove()",id:"remove",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"removeAll()",id:"removeall",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"removeAndInsert()",id:"removeandinsert",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"search()",id:"search",level:3},{value:"search(lat, lon, radius, visitor)",id:"searchlat-lon-radius-visitor",level:4},{value:"Parameters",id:"parameters-6",level:5},{value:"Returns",id:"returns-8",level:5},{value:"Defined in",id:"defined-in-8",level:5},{value:"search(center, radius, visitor)",id:"searchcenter-radius-visitor",level:4},{value:"Parameters",id:"parameters-7",level:5},{value:"Returns",id:"returns-9",level:5},{value:"Defined in",id:"defined-in-9",level:5},{value:"search(lat, lon, radius, maxResultCount, out, filter)",id:"searchlat-lon-radius-maxresultcount-out-filter",level:4},{value:"Parameters",id:"parameters-8",level:5},{value:"Returns",id:"returns-10",level:5},{value:"Defined in",id:"defined-in-10",level:5},{value:"search(center, radius, maxResultCount, out, filter)",id:"searchcenter-radius-maxresultcount-out-filter",level:4},{value:"Parameters",id:"parameters-9",level:5},{value:"Returns",id:"returns-11",level:5},{value:"Defined in",id:"defined-in-11",level:5}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.a)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"class-geokdtreet",children:"Class: GeoKdTree<T>"})}),"\n",(0,d.jsx)(n.p,{children:"A spatial tree which is keyed on points on Earth's surface and allows searching for elements based on the great-\ncircle distances from their keys to a query point."}),"\n",(0,d.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsx)(n.tr,{children:(0,d.jsx)(n.th,{children:"Type Parameter"})})}),(0,d.jsx)(n.tbody,{children:(0,d.jsx)(n.tr,{children:(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"T"})})})})]}),"\n",(0,d.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,d.jsx)(n.h3,{id:"new-geokdtree",children:"new GeoKdTree()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"new GeoKdTree"}),"<",(0,d.jsx)(n.code,{children:"T"}),">(",(0,d.jsx)(n.code,{children:"keyFunc"}),"): ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoKdTree",children:(0,d.jsx)(n.code,{children:"GeoKdTree"})}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Constructor."}),"\n",(0,d.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"keyFunc"})}),(0,d.jsxs)(n.td,{children:["(",(0,d.jsx)(n.code,{children:"element"}),", ",(0,d.jsx)(n.code,{children:"out"}),") => ",(0,d.jsx)(n.code,{children:"Float64Array"})]}),(0,d.jsx)(n.td,{children:"A function which generates keys from elements. Keys are cartesian representations of points on Earth's surface."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/classes/GeoKdTree",children:(0,d.jsx)(n.code,{children:"GeoKdTree"})}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),"\n",(0,d.jsx)(n.h4,{id:"throws",children:"Throws"}),"\n",(0,d.jsx)(n.p,{children:"Error if the dimension count is less than 2."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:46"}),"\n",(0,d.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,d.jsx)(n.h3,{id:"clear",children:"clear()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"clear"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Removes all elements from this tree."}),"\n",(0,d.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:235"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"insert",children:"insert()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"insert"}),"(",(0,d.jsx)(n.code,{children:"element"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Inserts an element into this tree. This operation will trigger a rebalancing if, after the insertion, the length\nof this tree's longest branch is more than twice the length of the shortest branch."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"element"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"T"})}),(0,d.jsx)(n.td,{children:"The element to insert."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:183"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"insertall",children:"insertAll()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"insertAll"}),"(",(0,d.jsx)(n.code,{children:"elements"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Inserts a batch of elements into this tree. This tree will be rebalanced after the elements are inserted."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elements"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Iterable"}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsx)(n.td,{children:"An iterable of the elements to insert."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:191"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"rebuild",children:"rebuild()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"rebuild"}),"(): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Rebuilds and balances this tree."}),"\n",(0,d.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:228"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"remove",children:"remove()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"remove"}),"(",(0,d.jsx)(n.code,{children:"element"}),"): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Removes an element from this tree. This tree will be rebalanced after the element is removed."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"element"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"T"})}),(0,d.jsx)(n.td,{children:"The element to remove."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"Whether the element was removed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:200"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"removeall",children:"removeAll()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"removeAll"}),"(",(0,d.jsx)(n.code,{children:"elements"}),"): ",(0,d.jsx)(n.code,{children:"boolean"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Removes a batch of elements from this tree. This tree will be rebalanced after the elements are removed."}),"\n",(0,d.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsx)(n.tbody,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"elements"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Iterable"}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsx)(n.td,{children:"An iterable of the elements to remove."})]})})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"boolean"})}),"\n",(0,d.jsx)(n.p,{children:"Whether at least one element was removed."}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:209"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"removeandinsert",children:"removeAndInsert()"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"removeAndInsert"}),"(",(0,d.jsx)(n.code,{children:"toRemove"}),", ",(0,d.jsx)(n.code,{children:"toInsert"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Removes elements from this tree, then inserts elements into this tree as a single operation. The tree will be\nrebalanced at the end of the operation."}),"\n",(0,d.jsxs)(n.p,{children:["Using this method is more efficient than calling ",(0,d.jsx)(n.code,{children:"removeAll()"})," and ",(0,d.jsx)(n.code,{children:"insertAll()"})," separately."]}),"\n",(0,d.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"toRemove"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Iterable"}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsx)(n.td,{children:"An iterable of the elements to remove."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"toInsert"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Iterable"}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsx)(n.td,{children:"An iterable of the elements to insert."})]})]})]}),"\n",(0,d.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:221"}),"\n",(0,d.jsx)(n.hr,{}),"\n",(0,d.jsx)(n.h3,{id:"search",children:"search()"}),"\n",(0,d.jsx)(n.h4,{id:"searchlat-lon-radius-visitor",children:"search(lat, lon, radius, visitor)"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"search"}),"(",(0,d.jsx)(n.code,{children:"lat"}),", ",(0,d.jsx)(n.code,{children:"lon"}),", ",(0,d.jsx)(n.code,{children:"radius"}),", ",(0,d.jsx)(n.code,{children:"visitor"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Searches this tree for elements located near a query point and visits each of them with a function."}),"\n",(0,d.jsx)(n.h5,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"lat"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The latitude of the query point, in degrees."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"lon"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The longitude of the query point, in degrees."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"radius"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The radius around the query point to search, in great-arc radians."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"visitor"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GeoKdTreeSearchVisitor",children:(0,d.jsx)(n.code,{children:"GeoKdTreeSearchVisitor"})}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsxs)(n.td,{children:["A visitor function. This function will be called once per element found within the search radius. If the visitor returns ",(0,d.jsx)(n.code,{children:"true"}),", then the search will continue; if the visitor returns ",(0,d.jsx)(n.code,{children:"false"}),", the search will immediately halt."]})]})]})]}),"\n",(0,d.jsx)(n.h5,{id:"returns-8",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h5,{id:"defined-in-8",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:58"}),"\n",(0,d.jsx)(n.h4,{id:"searchcenter-radius-visitor",children:"search(center, radius, visitor)"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"search"}),"(",(0,d.jsx)(n.code,{children:"center"}),", ",(0,d.jsx)(n.code,{children:"radius"}),", ",(0,d.jsx)(n.code,{children:"visitor"}),"): ",(0,d.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Searches this tree for elements located near a query point and visits each of them with a function."}),"\n",(0,d.jsx)(n.h5,{id:"parameters-7",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"center"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">> | ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LatLonInterface",children:(0,d.jsx)(n.code,{children:"LatLonInterface"})})]}),(0,d.jsx)(n.td,{children:"The query point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"radius"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The radius around the query point to search, in great-arc radians."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"visitor"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GeoKdTreeSearchVisitor",children:(0,d.jsx)(n.code,{children:"GeoKdTreeSearchVisitor"})}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsxs)(n.td,{children:["A visitor function. This function will be called once per element found within the search radius. If the visitor returns ",(0,d.jsx)(n.code,{children:"true"}),", then the search will continue; if the visitor returns ",(0,d.jsx)(n.code,{children:"false"}),", the search will immediately halt."]})]})]})]}),"\n",(0,d.jsx)(n.h5,{id:"returns-9",children:"Returns"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.code,{children:"void"})}),"\n",(0,d.jsx)(n.h5,{id:"defined-in-9",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:67"}),"\n",(0,d.jsx)(n.h4,{id:"searchlat-lon-radius-maxresultcount-out-filter",children:"search(lat, lon, radius, maxResultCount, out, filter)"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"search"}),"(",(0,d.jsx)(n.code,{children:"lat"}),", ",(0,d.jsx)(n.code,{children:"lon"}),", ",(0,d.jsx)(n.code,{children:"radius"}),", ",(0,d.jsx)(n.code,{children:"maxResultCount"}),", ",(0,d.jsx)(n.code,{children:"out"}),", ",(0,d.jsx)(n.code,{children:"filter"}),"?): ",(0,d.jsx)(n.code,{children:"T"}),"[]"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Searches this tree for elements located near a query point and returns them in order of increasing distance from\nthe query key."}),"\n",(0,d.jsx)(n.h5,{id:"parameters-8",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"lat"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The latitude of the query point, in degrees."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"lon"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The longitude of the query point, in degrees."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"radius"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The radius around the query point to search, in great-arc radians."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"maxResultCount"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The maximum number of search results to return."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"out"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"T"}),"[]"]}),(0,d.jsx)(n.td,{children:"An array in which to store the search results."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"filter"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GeoKdTreeSearchFilter",children:(0,d.jsx)(n.code,{children:"GeoKdTreeSearchFilter"})}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsx)(n.td,{children:"A function to filter the search results."})]})]})]}),"\n",(0,d.jsx)(n.h5,{id:"returns-10",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"T"}),"[]"]}),"\n",(0,d.jsx)(n.p,{children:"An array containing the search results, in order of increasing distance from the query key."}),"\n",(0,d.jsx)(n.h5,{id:"defined-in-10",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:79"}),"\n",(0,d.jsx)(n.h4,{id:"searchcenter-radius-maxresultcount-out-filter",children:"search(center, radius, maxResultCount, out, filter)"}),"\n",(0,d.jsxs)(n.blockquote,{children:["\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.strong,{children:"search"}),"(",(0,d.jsx)(n.code,{children:"center"}),", ",(0,d.jsx)(n.code,{children:"radius"}),", ",(0,d.jsx)(n.code,{children:"maxResultCount"}),", ",(0,d.jsx)(n.code,{children:"out"}),", ",(0,d.jsx)(n.code,{children:"filter"}),"?): ",(0,d.jsx)(n.code,{children:"T"}),"[]"]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"Searches this tree for elements located near a query point and returns them in order of increasing distance from\nthe query key."}),"\n",(0,d.jsx)(n.h5,{id:"parameters-9",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"Parameter"}),(0,d.jsx)(n.th,{children:"Type"}),(0,d.jsx)(n.th,{children:"Description"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"center"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"Readonly"}),"<",(0,d.jsx)(n.code,{children:"Omit"}),"<",(0,d.jsx)(n.code,{children:"Float64Array"}),", ",(0,d.jsx)(n.code,{children:'"set"'})," | ",(0,d.jsx)(n.code,{children:'"sort"'})," | ",(0,d.jsx)(n.code,{children:'"copyWithin"'}),">> | ",(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/interfaces/LatLonInterface",children:(0,d.jsx)(n.code,{children:"LatLonInterface"})})]}),(0,d.jsx)(n.td,{children:"The query point."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"radius"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The radius around the query point to search, in great-arc radians."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"maxResultCount"})}),(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"number"})}),(0,d.jsx)(n.td,{children:"The maximum number of search results to return."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:(0,d.jsx)(n.code,{children:"out"})}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"T"}),"[]"]}),(0,d.jsx)(n.td,{children:"An array in which to store the search results."})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.code,{children:"filter"}),"?"]}),(0,d.jsxs)(n.td,{children:[(0,d.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/framework/type-aliases/GeoKdTreeSearchFilter",children:(0,d.jsx)(n.code,{children:"GeoKdTreeSearchFilter"})}),"<",(0,d.jsx)(n.code,{children:"T"}),">"]}),(0,d.jsx)(n.td,{children:"A function to filter the search results."})]})]})]}),"\n",(0,d.jsx)(n.h5,{id:"returns-11",children:"Returns"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"T"}),"[]"]}),"\n",(0,d.jsx)(n.p,{children:"An array containing the search results, in order of increasing distance from the query key."}),"\n",(0,d.jsx)(n.h5,{id:"defined-in-11",children:"Defined in"}),"\n",(0,d.jsx)(n.p,{children:"src/sdk/utils/datastructures/GeoKdTree.ts:90"})]})}function o(e={}){let{wrapper:n}={...(0,i.a)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(a,{...e})}):a(e)}},250065:function(e,n,r){r.d(n,{Z:function(){return l},a:function(){return t}});var s=r(667294);let d={},i=s.createContext(d);function t(e){let n=s.useContext(i);return s.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:t(e.components),s.createElement(i.Provider,{value:n},e.children)}}}]);