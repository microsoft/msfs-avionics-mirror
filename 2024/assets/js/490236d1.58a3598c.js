"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["825963"],{849580:function(e,n,i){i.r(n),i.d(n,{metadata:()=>d,contentTitle:()=>l,default:()=>o,assets:()=>c,toc:()=>h,frontMatter:()=>t});var d=JSON.parse('{"id":"api/epic2shared/classes/DynamicList","title":"Class: DynamicList\\\\<DataType\\\\>","description":"A list that handles dynamically adding and removing list items from an HTML element.","source":"@site/docs/api/epic2shared/classes/DynamicList.md","sourceDirName":"api/epic2shared/classes","slug":"/api/epic2shared/classes/DynamicList","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DynamicList","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"DisplayUnitsConfig","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DisplayUnitsConfig"},"next":{"title":"EngineReadout","permalink":"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/EngineReadout"}}'),s=i("785893"),r=i("250065");let t={},l="Class: DynamicList<DataType>",c={},h=[{value:"Type Parameters",id:"type-parameters",level:2},{value:"Constructors",id:"constructors",level:2},{value:"new DynamicList()",id:"new-dynamiclist",level:3},{value:"Parameters",id:"parameters",level:4},{value:"Returns",id:"returns",level:4},{value:"Defined in",id:"defined-in",level:4},{value:"Properties",id:"properties",level:2},{value:"visibleItemCount",id:"visibleitemcount",level:3},{value:"Defined in",id:"defined-in-1",level:4},{value:"Methods",id:"methods",level:2},{value:"destroy()",id:"destroy",level:3},{value:"Returns",id:"returns-1",level:4},{value:"Defined in",id:"defined-in-2",level:4},{value:"forEachComponent()",id:"foreachcomponent",level:3},{value:"Type Parameters",id:"type-parameters-1",level:4},{value:"Parameters",id:"parameters-1",level:4},{value:"Returns",id:"returns-2",level:4},{value:"Defined in",id:"defined-in-3",level:4},{value:"getRenderedItem()",id:"getrendereditem",level:3},{value:"Parameters",id:"parameters-2",level:4},{value:"Returns",id:"returns-3",level:4},{value:"Defined in",id:"defined-in-4",level:4},{value:"indexOfSortedIndex()",id:"indexofsortedindex",level:3},{value:"Parameters",id:"parameters-3",level:4},{value:"Returns",id:"returns-4",level:4},{value:"Defined in",id:"defined-in-5",level:4},{value:"indexOfSortedVisibleIndex()",id:"indexofsortedvisibleindex",level:3},{value:"Parameters",id:"parameters-4",level:4},{value:"Returns",id:"returns-5",level:4},{value:"Defined in",id:"defined-in-6",level:4},{value:"sortedIndexOfData()",id:"sortedindexofdata",level:3},{value:"Parameters",id:"parameters-5",level:4},{value:"Returns",id:"returns-6",level:4},{value:"Defined in",id:"defined-in-7",level:4},{value:"sortedIndexOfIndex()",id:"sortedindexofindex",level:3},{value:"Parameters",id:"parameters-6",level:4},{value:"Returns",id:"returns-7",level:4},{value:"Defined in",id:"defined-in-8",level:4},{value:"sortedVisibleIndexOfData()",id:"sortedvisibleindexofdata",level:3},{value:"Parameters",id:"parameters-7",level:4},{value:"Returns",id:"returns-8",level:4},{value:"Defined in",id:"defined-in-9",level:4},{value:"sortedVisibleIndexOfIndex()",id:"sortedvisibleindexofindex",level:3},{value:"Parameters",id:"parameters-8",level:4},{value:"Returns",id:"returns-9",level:4},{value:"Defined in",id:"defined-in-10",level:4},{value:"updateOrder()",id:"updateorder",level:3},{value:"Returns",id:"returns-10",level:4},{value:"Defined in",id:"defined-in-11",level:4}];function a(e){let n={a:"a",blockquote:"blockquote",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",hr:"hr",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,r.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"class-dynamiclistdatatype",children:"Class: DynamicList<DataType>"})}),"\n",(0,s.jsx)(n.p,{children:"A list that handles dynamically adding and removing list items from an HTML element."}),"\n",(0,s.jsx)(n.h2,{id:"type-parameters",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsx)(n.tr,{children:(0,s.jsx)(n.th,{children:"Type Parameter"})})}),(0,s.jsx)(n.tbody,{children:(0,s.jsx)(n.tr,{children:(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"DataType"})," ",(0,s.jsx)(n.em,{children:"extends"})," ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/interfaces/DynamicListData",children:(0,s.jsx)(n.code,{children:"DynamicListData"})})]})})})]}),"\n",(0,s.jsx)(n.h2,{id:"constructors",children:"Constructors"}),"\n",(0,s.jsx)(n.h3,{id:"new-dynamiclist",children:"new DynamicList()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"new DynamicList"}),"<",(0,s.jsx)(n.code,{children:"DataType"}),">(",(0,s.jsx)(n.code,{children:"data"}),", ",(0,s.jsx)(n.code,{children:"itemsContainer"}),", ",(0,s.jsx)(n.code,{children:"renderItem"}),", ",(0,s.jsx)(n.code,{children:"sortItems"}),"?): ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DynamicList",children:(0,s.jsx)(n.code,{children:"DynamicList"})}),"<",(0,s.jsx)(n.code,{children:"DataType"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Creates a new instance of DynamicList."}),"\n",(0,s.jsx)(n.h4,{id:"parameters",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"data"})}),(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"SubscribableArray"}),"<",(0,s.jsx)(n.code,{children:"DataType"}),">"]}),(0,s.jsx)(n.td,{children:"An array of data items to display in this list."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"itemsContainer"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"Element"})}),(0,s.jsx)(n.td,{children:"The Element to which this list's items will be rendered as children."})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"renderItem"})}),(0,s.jsxs)(n.td,{children:["(",(0,s.jsx)(n.code,{children:"data"}),", ",(0,s.jsx)(n.code,{children:"index"}),") => ",(0,s.jsx)(n.code,{children:"VNode"})]}),(0,s.jsxs)(n.td,{children:["A function that used to render this list's items. The function is called for every list item that is added to this list. If the root node returned by the function is a DisplayComponent, then its ",(0,s.jsx)(n.code,{children:"destroy()"})," method will be called when the item is removed from this list."]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"sortItems"}),"?"]}),(0,s.jsxs)(n.td,{children:["(",(0,s.jsx)(n.code,{children:"a"}),", ",(0,s.jsx)(n.code,{children:"b"}),") => ",(0,s.jsx)(n.code,{children:"number"})]}),(0,s.jsx)(n.td,{children:"A function to sort data items before rendering them. The function should return a negative number if the first item should be rendered before the second, a positive number if the first item should be rendered after the second, or zero if the two items' relative order does not matter. If not defined, items will be rendered in the order in which they appear in the data item array."})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/api/epic2shared/classes/DynamicList",children:(0,s.jsx)(n.code,{children:"DynamicList"})}),"<",(0,s.jsx)(n.code,{children:"DataType"}),">"]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:45"}),"\n",(0,s.jsx)(n.h2,{id:"properties",children:"Properties"}),"\n",(0,s.jsx)(n.h3,{id:"visibleitemcount",children:"visibleItemCount"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"readonly"})," ",(0,s.jsx)(n.strong,{children:"visibleItemCount"}),": ",(0,s.jsx)(n.code,{children:"Subscribable"}),"<",(0,s.jsx)(n.code,{children:"number"}),">"]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"The number of visible items in this list."}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-1",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:15"}),"\n",(0,s.jsx)(n.h2,{id:"methods",children:"Methods"}),"\n",(0,s.jsx)(n.h3,{id:"destroy",children:"destroy()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"destroy"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Destroys this list."}),"\n",(0,s.jsx)(n.h4,{id:"returns-1",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-2",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:468"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"foreachcomponent",children:"forEachComponent()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"forEachComponent"}),"<",(0,s.jsx)(n.code,{children:"T"}),">(",(0,s.jsx)(n.code,{children:"fn"}),", ",(0,s.jsx)(n.code,{children:"visibleOnly"}),", ",(0,s.jsx)(n.code,{children:"sortedOrder"}),"): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Iterates over each rendered component and executes a callback function."}),"\n",(0,s.jsx)(n.h4,{id:"type-parameters-1",children:"Type Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsx)(n.tr,{children:(0,s.jsx)(n.th,{children:"Type Parameter"})})}),(0,s.jsx)(n.tbody,{children:(0,s.jsx)(n.tr,{children:(0,s.jsxs)(n.td,{children:[(0,s.jsx)(n.code,{children:"T"})," ",(0,s.jsx)(n.em,{children:"extends"})," ",(0,s.jsx)(n.code,{children:"DisplayComponent"}),"<",(0,s.jsx)(n.code,{children:"any"}),", []>"]})})})]}),"\n",(0,s.jsx)(n.h4,{id:"parameters-1",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Default value"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"fn"})}),(0,s.jsxs)(n.td,{children:["(",(0,s.jsx)(n.code,{children:"component"}),", ",(0,s.jsx)(n.code,{children:"index"}),") => ",(0,s.jsx)(n.code,{children:"void"})]}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"undefined"})}),(0,s.jsxs)(n.td,{children:["The callback function to execute for each component. The function should take two arguments: the first argument is the iterated component, and the second argument is the index of the component ",(0,s.jsx)(n.em,{children:"in the iteration"}),"."]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"visibleOnly"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"false"})}),(0,s.jsxs)(n.td,{children:["Whether to only iterate over components whose associated data items have their visibility flags set to ",(0,s.jsx)(n.code,{children:"true"}),". Defaults to ",(0,s.jsx)(n.code,{children:"false"}),"."]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"sortedOrder"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"boolean"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"false"})}),(0,s.jsxs)(n.td,{children:["Whether to iterate over components in sorted order instead of the order in which their associated data items appear in the data array. Defaults to ",(0,s.jsx)(n.code,{children:"false"}),"."]})]})]})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-2",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-3",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:173"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"getrendereditem",children:"getRenderedItem()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"getRenderedItem"}),"(",(0,s.jsx)(n.code,{children:"index"}),"): ",(0,s.jsx)(n.code,{children:"undefined"})," | ",(0,s.jsx)(n.code,{children:"NodeInstance"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Gets the rendered instance of a data item in this list."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-2",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"index"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"The index of the data item for which to get the rendered instance."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-3",children:"Returns"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"undefined"})," | ",(0,s.jsx)(n.code,{children:"NodeInstance"})]}),"\n",(0,s.jsxs)(n.p,{children:["The rendered instance of the specified data item, or ",(0,s.jsx)(n.code,{children:"undefined"})," if index is out of bounds."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-4",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:160"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"indexofsortedindex",children:"indexOfSortedIndex()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"indexOfSortedIndex"}),"(",(0,s.jsx)(n.code,{children:"sortedIndex"}),"): ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Gets the data item index of a sorted index."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-3",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"sortedIndex"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"A sorted index."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-4",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"number"})}),"\n",(0,s.jsxs)(n.p,{children:["The index of the data item that is sorted to the specified index, or ",(0,s.jsx)(n.code,{children:"-1"})," if the sorted index is out of bounds."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-5",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:125"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"indexofsortedvisibleindex",children:"indexOfSortedVisibleIndex()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"indexOfSortedVisibleIndex"}),"(",(0,s.jsx)(n.code,{children:"sortedVisibleIndex"}),"): ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Gets the data item index of a sorted index after hidden items have been excluded."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-4",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"sortedVisibleIndex"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"A sorted index after hidden items have been excluded."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-5",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"number"})}),"\n",(0,s.jsxs)(n.p,{children:["The index of the data item that is sorted to the specified index after hidden items have been excluded,\nor ",(0,s.jsx)(n.code,{children:"-1"})," if the sorted index is out of bounds."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-6",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:135"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"sortedindexofdata",children:"sortedIndexOfData()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"sortedIndexOfData"}),"(",(0,s.jsx)(n.code,{children:"data"}),"): ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Gets the sorted index of a data item."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-5",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"data"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"DataType"})}),(0,s.jsx)(n.td,{children:"A data item."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-6",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"number"})}),"\n",(0,s.jsxs)(n.p,{children:["The index to which the specified data item is sorted, or ",(0,s.jsx)(n.code,{children:"-1"})," if the item is not in this list."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-7",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:76"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"sortedindexofindex",children:"sortedIndexOfIndex()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"sortedIndexOfIndex"}),"(",(0,s.jsx)(n.code,{children:"index"}),"): ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Gets the sorted index of a data item index."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-6",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"index"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"A data item index."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-7",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"number"})}),"\n",(0,s.jsxs)(n.p,{children:["The index to which the specified data item index is sorted, or ",(0,s.jsx)(n.code,{children:"-1"})," if the data index is out of bounds."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-8",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:67"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"sortedvisibleindexofdata",children:"sortedVisibleIndexOfData()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"sortedVisibleIndexOfData"}),"(",(0,s.jsx)(n.code,{children:"data"}),"): ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Gets the sorted index of a data item after hidden items have been excluded."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-7",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"data"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"DataType"})}),(0,s.jsx)(n.td,{children:"A data item."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-8",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"number"})}),"\n",(0,s.jsxs)(n.p,{children:["The index to which the specified data item is sorted after hidden items have been excluded, or ",(0,s.jsx)(n.code,{children:"-1"})," if\nthe item is not in this list or is itself hidden."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-9",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:112"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"sortedvisibleindexofindex",children:"sortedVisibleIndexOfIndex()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"sortedVisibleIndexOfIndex"}),"(",(0,s.jsx)(n.code,{children:"index"}),"): ",(0,s.jsx)(n.code,{children:"number"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Gets the sorted index of a data item index after hidden items have been excluded."}),"\n",(0,s.jsx)(n.h4,{id:"parameters-8",children:"Parameters"}),"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Parameter"}),(0,s.jsx)(n.th,{children:"Type"}),(0,s.jsx)(n.th,{children:"Description"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"index"})}),(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"number"})}),(0,s.jsx)(n.td,{children:"A data item index."})]})})]}),"\n",(0,s.jsx)(n.h4,{id:"returns-9",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"number"})}),"\n",(0,s.jsxs)(n.p,{children:["The index to which the specified data item index is sorted after hidden items have been excluded, or ",(0,s.jsx)(n.code,{children:"-1"}),"\nif the data index is out of bounds or the data item whose index was given is itself hidden."]}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-10",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:86"}),"\n",(0,s.jsx)(n.hr,{}),"\n",(0,s.jsx)(n.h3,{id:"updateorder",children:"updateOrder()"}),"\n",(0,s.jsxs)(n.blockquote,{children:["\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"updateOrder"}),"(): ",(0,s.jsx)(n.code,{children:"void"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"Updates the order of the rendered items in this list."}),"\n",(0,s.jsx)(n.h4,{id:"returns-10",children:"Returns"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.code,{children:"void"})}),"\n",(0,s.jsx)(n.h4,{id:"defined-in-11",children:"Defined in"}),"\n",(0,s.jsx)(n.p,{children:"workingtitle-instruments-epic2/shared/Components/List/DynamicList.ts:442"})]})}function o(e={}){let{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return l},a:function(){return t}});var d=i(667294);let s={},r=d.createContext(s);function t(e){let n=d.useContext(r);return d.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:t(e.components),d.createElement(r.Provider,{value:n},e.children)}}}]);