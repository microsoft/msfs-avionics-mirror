"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[63407],{3905:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>m});var s=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);t&&(s=s.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,s)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,s,i=function(e,t){if(null==e)return{};var n,s,i={},a=Object.keys(e);for(s=0;s<a.length;s++)n=a[s],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(s=0;s<a.length;s++)n=a[s],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var u=s.createContext({}),l=function(e){var t=s.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},c=function(e){var t=l(e.components);return s.createElement(u.Provider,{value:t},e.children)},p="mdxType",b={inlineCode:"code",wrapper:function(e){var t=e.children;return s.createElement(s.Fragment,{},t)}},d=s.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,u=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),p=l(n),d=i,m=p["".concat(u,".").concat(d)]||p[d]||b[d]||a;return n?s.createElement(m,r(r({ref:t},c),{},{components:n})):s.createElement(m,r({ref:t},c))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,r=new Array(a);r[0]=d;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o[p]="string"==typeof e?e:i,r[1]=o;for(var l=2;l<a;l++)r[l]=n[l];return s.createElement.apply(null,r)}return s.createElement.apply(null,n)}d.displayName="MDXCreateElement"},73510:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>r,default:()=>b,frontMatter:()=>a,metadata:()=>o,toc:()=>l});var s=n(87462),i=(n(67294),n(3905));const a={sidebar_label:"Intro to Subscriptions",sidebar_position:1},r="Intro to Subscriptions",o={unversionedId:"subscriptions/intro-to-subscriptions",id:"subscriptions/intro-to-subscriptions",title:"Intro to Subscriptions",description:"What are Subscriptions?",source:"@site/docs/subscriptions/intro-to-subscriptions.md",sourceDirName:"subscriptions",slug:"/subscriptions/intro-to-subscriptions",permalink:"/msfs-avionics-mirror/docs/subscriptions/intro-to-subscriptions",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_label:"Intro to Subscriptions",sidebar_position:1},sidebar:"sidebar",previous:{title:"Creating Plugins",permalink:"/msfs-avionics-mirror/docs/plugins/creating-plugins"},next:{title:"Subscribables",permalink:"/msfs-avionics-mirror/docs/subscriptions/subscribables"}},u={},l=[{value:"What are Subscriptions?",id:"what-are-subscriptions",level:2},{value:"Creating Subscriptions",id:"creating-subscriptions",level:2},{value:"Event Bus",id:"event-bus",level:3},{value:"Subscribables",id:"subscribables",level:3},{value:"SubEvent",id:"subevent",level:3},{value:"Managing Subscriptions",id:"managing-subscriptions",level:2},{value:"Pause/Resume",id:"pauseresume",level:3},{value:"Initial Notify on Resume",id:"initial-notify-on-resume",level:3},{value:"Destroy",id:"destroy",level:3}],c={toc:l},p="wrapper";function b(e){let{components:t,...n}=e;return(0,i.kt)(p,(0,s.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"intro-to-subscriptions"},"Intro to Subscriptions"),(0,i.kt)("h2",{id:"what-are-subscriptions"},"What are Subscriptions?"),(0,i.kt)("p",null,"The avionics framework largely adopts a paradigm where code that needs access to data (consumers) have the data ",(0,i.kt)("em",{parentName:"p"},"pushed")," to them, as opposed to one where consumers actively query data. In order for consumers to have data pushed to them, they must explicitly enter into a contract with a data source saying, ",(0,i.kt)("em",{parentName:"p"},'"I, the consumer, want to be notified when you, the data source, have something substantive to tell me about."')," The details of the ",(0,i.kt)("em",{parentName:"p"},'"something substantive"')," in the contract is left up to the data source to decide and can take many forms, including but not limited to a state change in a value or a triggered event."),(0,i.kt)("p",null,"A ",(0,i.kt)("strong",{parentName:"p"},"subscription")," then, is just such a contract between a consumer and a data source. Within the framework, subscriptions are represented by the ",(0,i.kt)("a",{parentName:"p",href:"https://microsoft.github.io/msfs-avionics-mirror/docs/framework/interfaces/Subscription"},(0,i.kt)("inlineCode",{parentName:"a"},"Subscription"))," interface."),(0,i.kt)("h2",{id:"creating-subscriptions"},"Creating Subscriptions"),(0,i.kt)("p",null,"In general, consumers do not directly create subscriptions. Instead, subscriptions are created by invoking methods on data sources to set up notification contracts. Any data source that supports notifying subscribers can be made to generate subscriptions. The rest of this section describes some common framework data sources that generate subscriptions."),(0,i.kt)("h3",{id:"event-bus"},"Event Bus"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/getting-started/using-the-event-bus"},"Setting up a handler")," for an event bus topic will create a subscription for each handler:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const sub: Subscription = bus.getSubscriber<MyEvents>().on('my_event').handle(() => {\n  console.log('my_event was published!');\n});\n")),(0,i.kt)("p",null,"In the above example, ",(0,i.kt)("inlineCode",{parentName:"p"},"sub")," is a ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")," object that represents the new contract created by ",(0,i.kt)("inlineCode",{parentName:"p"},"handle()")," wherein the event bus will call the handler function whenever the ",(0,i.kt)("inlineCode",{parentName:"p"},"my_event")," topic is published."),(0,i.kt)("h3",{id:"subscribables"},"Subscribables"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/subscriptions/subscribables"},"Subscribables")," are a collection of classes that provide an observable value. Subscribing to one of these objects will create a subscription:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const sub: Subscription = subscribable.sub(v => {\n  console.log(`Value changed to ${v}!`);\n});\n")),(0,i.kt)("p",null,"In the above example, ",(0,i.kt)("inlineCode",{parentName:"p"},"sub")," is a ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")," object that represents the new contract created by ",(0,i.kt)("inlineCode",{parentName:"p"},"sub()")," wherein the subscribable will call the handler function whenever its value changes."),(0,i.kt)("h3",{id:"subevent"},"SubEvent"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://microsoft.github.io/msfs-avionics-mirror/docs/framework/classes/SubEvent"},"SubEvent")," is a class that supports publishing events and can be thought of as a more localized version of the event bus. Subscribing to a ",(0,i.kt)("inlineCode",{parentName:"p"},"SubEvent")," will create a subscription:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const sub: Subscription = subEvent.on((sender, data) => {\n  console.log(`An event was triggered with data ${data}!`);\n});\n")),(0,i.kt)("p",null,"In the above example, ",(0,i.kt)("inlineCode",{parentName:"p"},"sub")," is a ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")," object that represents the new contract created by ",(0,i.kt)("inlineCode",{parentName:"p"},"on()")," wherein the ",(0,i.kt)("inlineCode",{parentName:"p"},"SubEvent")," will call the handler function whenever an event is triggered by calling the ",(0,i.kt)("inlineCode",{parentName:"p"},"SubEvent"),"'s ",(0,i.kt)("inlineCode",{parentName:"p"},"notify()")," method."),(0,i.kt)("h2",{id:"managing-subscriptions"},"Managing Subscriptions"),(0,i.kt)("p",null,"Once a subscription is created, a consumer can use it to manage the new notification contract established between it and the data source. Subscriptions support three basic operations: ",(0,i.kt)("strong",{parentName:"p"},"pause"),", ",(0,i.kt)("strong",{parentName:"p"},"resume"),", and ",(0,i.kt)("strong",{parentName:"p"},"destroy"),"."),(0,i.kt)("h3",{id:"pauseresume"},"Pause/Resume"),(0,i.kt)("p",null,"Pausing/resuming a subscription controls whether notifications are received from its data source. A paused subscription will not receive any notifications, while a resumed subscription will. Subscriptions can be paused and resumed at will, and there is no limit to how many times a subscription can toggle between the two states. The ",(0,i.kt)("inlineCode",{parentName:"p"},"pause()")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"resume()")," methods are used to pause and resume subscriptions, respectively:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// Subject is a Subscribable.\nconst subject = Subject.create(0);\n\nconst sub = subject.sub(v => {\n  console.log(`Value changed to ${v}!`);\n});\n\nsub.pause();\nsubject.set(5); // No console message will be logged.\n\nsub.resume();\nsubject.set(10); // 'Value changed to 10!' will be logged.\n")),(0,i.kt)("p",null,"Generally, newly created subscriptions are initialized as resumed, but some data sources will allow you to initialize subscription to the paused state instead:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const subEvent = new SubEvent<void, number>();\n\n// The second argument passed to on() controls whether the new subscription is initially paused.\nconst sub = subEvent.on((sender, data) => {\n  console.log(`An event was triggered with data ${data}!`);\n}, true);\n\nsubEvent.notify(undefined, 5); // No console message will be logged.\n\nsub.resume();\nsubEvent.notify(undefined, 10); // 'An event was triggered with data 10!' will be logged.\n")),(0,i.kt)("h3",{id:"initial-notify-on-resume"},"Initial Notify on Resume"),(0,i.kt)("p",null,'When resuming certain subscriptions, you can control whether an initial notification will be sent immediately when it is resumed. This initial notify operation is primarily useful for subscriptions in which the data source is notifying the consumer about state changes. In such cases, initial notify can be used to "sync" the consumer with the current state of the data source as soon as it is resumed rather than waiting (potentially forever) for the state to change again:'),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// Subject is a Subscribable.\nconst subject = Subject.create(0);\n\nconst sub = subject.sub(v => {\n  console.log(`Value changed to ${v}!`);\n});\n\nsub.pause();\nsubject.set(5); // No console message will be logged.\n\nsub.resume(true); // 'Value changed to 5!' will be logged.\n")),(0,i.kt)("p",null,"Not all subscriptions support initial notify on resume. In particular, subscriptions for event notifications that are not tied to some persistent state typically do not support initial notify. For example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const subEvent = new SubEvent<void, number>();\n\nconst sub = subEvent.on((sender, data) => {\n  console.log(`An event was triggered with data ${data}!`);\n});\n\nsub.pause();\nsubEvent.notify(undefined, 5); // No console message will be logged.\n\nsub.resume(true); // No console message will be logged.\n")),(0,i.kt)("p",null,"The ",(0,i.kt)("inlineCode",{parentName:"p"},"canInitialNotify")," property on a ",(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")," object reports whether that particular subscription supports initial notify on resume. If ",(0,i.kt)("inlineCode",{parentName:"p"},"canInitialNotify")," is ",(0,i.kt)("inlineCode",{parentName:"p"},"false"),", then initial notify on resume will always fail on that subscription. If the property is ",(0,i.kt)("inlineCode",{parentName:"p"},"true"),", then initial notify ",(0,i.kt)("em",{parentName:"p"},"may")," work but is not guaranteed to do so under all circumstances. For example, all subscriptions created by setting up event bus handlers report ",(0,i.kt)("inlineCode",{parentName:"p"},"canInitialNotify")," as ",(0,i.kt)("inlineCode",{parentName:"p"},"true"),", but initial notify will only work if the subscription's associated topic has cached data published to it:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"const sub1 = bus.getSubscriber<MyEvents>().on('my_event_1').handle(v => {\n  console.log(`my_event_1 was published with data ${v}!`);\n});\nconst sub2 = bus.getSubscriber<MyEvents>().on('my_event_2').handle(v => {\n  console.log(`my_event_2 was published with data ${v}!`);\n});\n\nsub1.pause();\nsub2.pause();\n\n// The last argument passed to pub() controls whether published data is cached.\nbus.getPublisher<MyEvents>().pub('my_event_1', 5, false, false);\nbus.getPublisher<MyEvents>().pub('my_event_2', 5, false, true);\n\nsub1.resume(true); // No console message will be logged.\nsub2.resume(true); // 'my_event_2 was published with data 5!' will be logged.\n")),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"Some subscriptions ",(0,i.kt)("em",{parentName:"p"},"always")," trigger an initial notification when resumed, even if ",(0,i.kt)("inlineCode",{parentName:"p"},"false")," is passed as the ",(0,i.kt)("inlineCode",{parentName:"p"},"initialNotify")," argument to ",(0,i.kt)("inlineCode",{parentName:"p"},"resume()"),". Examples of subscriptions that behave like this include ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/subscriptions/subscribables#consumersubject"},(0,i.kt)("inlineCode",{parentName:"a"},"ConsumerSubject"))," and ",(0,i.kt)("a",{parentName:"p",href:"/msfs-avionics-mirror/docs/subscriptions/subscribables#mapping-a-subscribable-to-new-subscribables"},"mapped subscribables"),".")),(0,i.kt)("p",null,"Some data sources allow you to specify whether subscriptions should be resumed with initial notify immediately upon creation while others always perform an initial notify on newly created resumed subscriptions:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"// Subject is a Subscribable.\nconst subject = Subject.create(0);\n\n// The second argument passed to sub() controls whether to perform an initial notify if the subscription is created as resumed.\nsubject.sub(v => {\n  console.log(`Value changed to ${v}!`);\n}, true); // 'Value changed to 0!' will be logged.\n\n// ----------------\n// ----------------\n\nbus.getPublisher<MyEvents>().pub('my_event', 5, false, true);\n\n// handle() always performs an initial notify if the subscription is created as resumed.\nbus.getSubscriber<MyEvents>().on('my_event').handle(v => {\n  console.log(`my_event was published with data ${v}!`);\n}); // 'my_event was published with data 5!' will be logged.\n")),(0,i.kt)("admonition",{type:"tip"},(0,i.kt)("p",{parentName:"admonition"},"If you want to set up an event bus handler ",(0,i.kt)("em",{parentName:"p"},"without")," an initial notify when the subscription is created, then create the subscription as paused and immediately resume the subscription without initial notify:"),(0,i.kt)("pre",{parentName:"admonition"},(0,i.kt)("code",{parentName:"pre",className:"language-typescript"},"bus.getSubscriber<MyEvents>().on('my_event').handle(v => {\n  console.log(`my_event was published with data ${v}!`);\n}, true).resume();\n"))),(0,i.kt)("h3",{id:"destroy"},"Destroy"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"Subscription")," objects can be destroyed by calling their ",(0,i.kt)("inlineCode",{parentName:"p"},"destroy()")," methods. Destroying a subscription permanently stops notifications from being received from its data source. Once destroyed, a subscription can no longer be paused or resumed (attempting to do so will result in runtime errors being thrown)."),(0,i.kt)("p",null,"When a subscription is created, a strong reference to the subscription is created and stored within the subscription's data source. As long as that reference exists (and assuming the data source has not been garbage collected), the subscription and anything it references (which usually includes things like associated handler functions) cannot be garbage collected. Therefore, it is imperative that subscriptions be destroyed once they are at the end of their useful lives. Failure to do so may result in memory leaks."),(0,i.kt)("admonition",{type:"note"},(0,i.kt)("p",{parentName:"admonition"},"Although destroying and re-creating subscriptions achieves the same end result as pausing/resuming, the former strategy incurs additional performance and memory allocation overhead. Therefore, it is recommended to pause/resume subscriptions whenever possible and only destroy them when they never need to be resumed again.")))}b.isMDXComponent=!0}}]);