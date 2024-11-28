"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["603318"],{819595:function(e,n,i){i.r(n),i.d(n,{metadata:()=>r,contentTitle:()=>o,default:()=>h,assets:()=>l,toc:()=>d,frontMatter:()=>a});var r=JSON.parse('{"id":"interacting-with-msfs/simvars","title":"SimVars","description":"Introduction","source":"@site/docs/interacting-with-msfs/simvars.md","sourceDirName":"interacting-with-msfs","slug":"/interacting-with-msfs/simvars","permalink":"/msfs-avionics-mirror/2024/docs/interacting-with-msfs/simvars","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1},"sidebar":"sidebar","previous":{"title":"Refs and the Component Lifecycle","permalink":"/msfs-avionics-mirror/2024/docs/getting-started/refs-and-component-lifecycle"},"next":{"title":"Key Events","permalink":"/msfs-avionics-mirror/2024/docs/interacting-with-msfs/key-events"}}'),s=i("785893"),t=i("250065");let a={sidebar_position:1},o="SimVars",l={},d=[{value:"Introduction",id:"introduction",level:2},{value:"Types of SimVars",id:"types-of-simvars",level:2},{value:"A Vars",id:"a-vars",level:3},{value:"L Vars",id:"l-vars",level:3},{value:"B Vars",id:"b-vars",level:3},{value:"Setting SimVars in JS",id:"setting-simvars-in-js",level:2},{value:"Setting B Vars",id:"setting-b-vars",level:3},{value:"Bridging SimVars to the Event Bus",id:"bridging-simvars-to-the-event-bus",level:2},{value:"Using <code>SimVarPublisher</code>",id:"using-simvarpublisher",level:3},{value:"Publishing Boolean Values",id:"publishing-boolean-values",level:3},{value:"Publishing Indexed SimVars",id:"publishing-indexed-simvars",level:3},{value:"More Information",id:"more-information",level:2}];function c(e){let n={a:"a",admonition:"admonition",code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,t.a)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"simvars",children:"SimVars"})}),"\n",(0,s.jsx)(n.h2,{id:"introduction",children:"Introduction"}),"\n",(0,s.jsxs)(n.p,{children:["One of the primary ways by which addons can communicate with MSFS is via Simulation Variables, or ",(0,s.jsx)(n.em,{children:"SimVars"}),". These variable contain data and information about the state of the simulator itself, your airplane, and various other components of MSFS."]}),"\n",(0,s.jsx)(n.p,{children:"From Javascript, you can utilize several of the types of SimVars available in MSFS."}),"\n",(0,s.jsx)(n.h2,{id:"types-of-simvars",children:"Types of SimVars"}),"\n",(0,s.jsx)(n.h3,{id:"a-vars",children:"A Vars"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"A vars"})," are normal MSFS simulation variables which can be queried. Historically, they have been called ",(0,s.jsx)(n.strong,{children:"A vars"})," due to needing to prefix those SimVars with the text ",(0,s.jsx)(n.strong,{children:"A:"}),", but this is not required from the Javascript framework. To query a SimVar, supply the SimVar name and the units you would like to return the value in:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"const indicatedAirspeed = SimVar.GetSimVarValue('INDICATED AIRSPEED', 'knots');\n"})}),"\n",(0,s.jsx)(n.p,{children:"Some A vars in the sim can also take an index, such as with engine SimVars. This index can be appended to the end of the SimVar to specify which in a collection of items the value should be retrieved for:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"const engineN1 = SimVar.GetSimVarValue('TURB ENG N1:1', 'percent');\n"})}),"\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsxs)(n.p,{children:["While you can read the value of any A var, only certain A vars allow you to directly set their values. Attempting to set the value of a read-only A var will ",(0,s.jsx)(n.em,{children:"fail silently"}),"."]})}),"\n",(0,s.jsx)(n.h3,{id:"l-vars",children:"L Vars"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"L vars"})," are user-settable values that can have any name that is a contiguous string with no spaces. Setting an L var for the first time creates the variable; it is not necessary to define them anywhere ahead of time. All L vars can hold only ",(0,s.jsx)(n.strong,{children:"numeric"})," data, and not arbitrary string or binary data. Attempting to access an L var before its value has been explicitly set will always return a value of zero."]}),"\n",(0,s.jsxs)(n.p,{children:["There are two types of L vars: ",(0,s.jsx)(n.strong,{children:"scoped L vars"})," and ",(0,s.jsx)(n.strong,{children:"global L vars"}),". Scoped L vars are prefixed with ",(0,s.jsx)(n.code,{children:"L:1:"})," and global L vars are prefixed with ",(0,s.jsx)(n.code,{children:"L:"}),"."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"const scopedLVarValue = SimVar.GetSimVarValue('L:1:My_Scoped_Var', 'number');\r\nconst globalLVarValue = SimVar.GetSimVarValue('L:My_Global_Var', 'number');\n"})}),"\n",(0,s.jsx)(n.p,{children:"Scoped L vars are defined within the scope of a single sim entity (most commonly the player airplane). Global L vars are defined globally for all sim entities. This distinction is important when an L var is used to store state specific to an airplane. If a scoped L var is used, then different airplane instances using an L var can store different values for that same L var. If a global L var is used, then there is only value that is shared among all airplane instances that use the L var."}),"\n",(0,s.jsxs)(n.p,{children:["For example, let's say that a particular type of airplane uses the ",(0,s.jsx)(n.code,{children:"Door_Open"})," L var to control whether the airplane's door is open. If a scoped L var is used (",(0,s.jsx)(n.code,{children:"L:1:Door_Open"}),"), then multiple instances of the airplane in the sim can each have its own independent door state. Opening the door for one airplane instance (setting the value of ",(0,s.jsx)(n.code,{children:"L:1:Door_Open"})," to 1) will open the door only for that instance, and other instances of the airplane will remain unaffected. On the other hand, if a global L var is used (",(0,s.jsx)(n.code,{children:"L:Door_Open"}),"), then opening the door for any airplane instance (setting the value of ",(0,s.jsx)(n.code,{children:"L:Door_Open"})," to 1) will open the door for ",(0,s.jsx)(n.em,{children:"all"})," instances of the airplane."]}),"\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsxs)(n.p,{children:["When using ",(0,s.jsx)(n.code,{children:"SimVar"})," to access scoped L vars, the scope that is used is that of the player airplane."]})}),"\n",(0,s.jsx)(n.h3,{id:"b-vars",children:"B Vars"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"B vars"})," are values associated with ",(0,s.jsx)(n.a,{href:"https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/Models/ModelBehaviors/Input_Event_XML_Properties.htm",children:"Model Behaviors Input Events"})," and are prefixed with ",(0,s.jsx)(n.strong,{children:"B:"}),". Each Input Event defined by Model Behaviors has a corresponding B var with the name ",(0,s.jsx)(n.code,{children:"B:[Input Event Name]"})," that stores the value for that Input Event. Input Events are typically used to capture and manage the states of various user-interactable cockpit elements, such as switches, knobs, levers, etc. Therefore, B vars are a convenient method to access the states of these cockpit elements."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"const taxiLightSwitchState = SimVar.GetSimVarValue('B:LIGHTING_Taxi_Switch', 'number');\n"})}),"\n",(0,s.jsxs)(n.p,{children:["B vars can hold only ",(0,s.jsx)(n.strong,{children:"numeric"})," data. B vars are user-settable, but require a ",(0,s.jsx)(n.a,{href:"#setting-b-vars",children:"special syntax"})," to do so."]}),"\n",(0,s.jsx)(n.h2,{id:"setting-simvars-in-js",children:"Setting SimVars in JS"}),"\n",(0,s.jsx)(n.p,{children:"Setting a SimVar is very straightforward:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"SimVar.SetSimVarValue('GENERAL ENG THROTTLE LEVER POSITION:1', 'percent', 100);\n"})}),"\n",(0,s.jsxs)(n.p,{children:["However, do note that setting SimVars via JS is an asynchronous operation that is not guaranteed to finish by the time the next line of code is run. ",(0,s.jsx)(n.code,{children:"SetSimVarValue()"})," returns a ",(0,s.jsx)(n.code,{children:"Promise<void>"}),", which allows you to wait until the command has been accepted to run additional code:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"//Using .then\r\nSimVar.SetSimVarValue('LIGHT NAV', 'bool', true)\r\n  .then(() => console.log('Nav light is on!'));\r\n\r\n//Using async/await\r\nawait SimVar.SetSimVarValue('LIGHT NAV', 'bool', true);\r\nconsole.log('Nav light is on!');\n"})}),"\n",(0,s.jsxs)(n.admonition,{type:"warning",children:[(0,s.jsxs)(n.p,{children:["For some SimVars, even awaiting the ",(0,s.jsx)(n.code,{children:"Promise"})," will not guarantee the update is complete. Calls into the sim are cached and run at frame end for performance reasons and not all sim systems are synchronous. Nonetheless, we still highly recommend using the ",(0,s.jsx)(n.code,{children:"Promise"})," form, which yeilds much more consistent results for these cases."]}),(0,s.jsx)(n.p,{children:"Most usages of setting SimVars will not fall into this case, where explicit post-set timings are required."})]}),"\n",(0,s.jsx)(n.h3,{id:"setting-b-vars",children:"Setting B Vars"}),"\n",(0,s.jsx)(n.p,{children:"Setting the value of a B Var is a bit different from setting A Vars and L Vars. The usual syntax does not work for B Vars:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"// Doesn't work!\r\nSimVar.SetSimVarValue('B:LIGHTING_Taxi_Switch', 'number', 1);\n"})}),"\n",(0,s.jsxs)(n.p,{children:['Instead, you must "set" or invoke special B Var events (also known as B events) using ',(0,s.jsx)(n.code,{children:"SetSimVarValue()"}),", similar to how ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/interacting-with-msfs/key-events#initiating-a-key-event",children:"key events"})," can be invoked using the same API. All B Vars have three associated B events:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Set"}),": sets the value of a B Var."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Inc"}),": increments the value of a B Var."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.code,{children:"Dec"}),": decrements the value of a B Var."]}),"\n"]}),"\n",(0,s.jsxs)(n.p,{children:["The exact behavior of each of the above events depends on its associated Input Event/B Var. For example, ",(0,s.jsx)(n.code,{children:"Set"})," may clamp values to a certain range, and ",(0,s.jsx)(n.code,{children:"Inc"})," may increment values with or without wrapping."]}),"\n",(0,s.jsxs)(n.p,{children:["To invoke a B event, call ",(0,s.jsx)(n.code,{children:"SetSimVarValue()"})," with the name of the B var suffixed with the event name:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"// Invokes the 'Set' event on the 'B:LIGHTING_Taxi_Switch' B Var with a parameter of 1.\r\nSimVar.SetSimVarValue('B:LIGHTING_Taxi_Switch_Set', 'number', 1);\n"})}),"\n",(0,s.jsxs)(n.p,{children:["Some B Vars have additional custom events defined for them (called ",(0,s.jsx)(n.strong,{children:"bindings"}),"). These events can be invoked in the same manner as the default events. For example, if the ",(0,s.jsx)(n.code,{children:"On"})," binding is defined as an alias for invoking ",(0,s.jsx)(n.code,{children:"Set"})," with a parameter of 1, then the following is equivalent to the previous example:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"SimVar.SetSimVarValue('B:LIGHTING_Taxi_Switch_On', 'number', 0);\n"})}),"\n",(0,s.jsx)(n.h2,{id:"bridging-simvars-to-the-event-bus",children:"Bridging SimVars to the Event Bus"}),"\n",(0,s.jsxs)(n.p,{children:["SimVars are the primary means by which you will retrieve information from the simulator. However, calls to ",(0,s.jsx)(n.code,{children:"SimVar.GetSimVarValue()"})," incur a non-negligible performance cost. Because of this, we want to minimize the number of times we call ",(0,s.jsx)(n.code,{children:"SimVar.GetSimVarValue()"}),". Additionally, there are many scenarios when we would like to use event-driven logic with SimVars by watching the value of a SimVar and executing code only when it changes. We can solve both of these issues by bridging SimVars to the ",(0,s.jsx)(n.a,{href:"/msfs-avionics-mirror/2024/docs/getting-started/using-the-event-bus#publishing-simvar-data-via-the-event-bus",children:"event bus"}),"."]}),"\n",(0,s.jsxs)(n.h3,{id:"using-simvarpublisher",children:["Using ",(0,s.jsx)(n.code,{children:"SimVarPublisher"})]}),"\n",(0,s.jsxs)(n.p,{children:["We can code the bridge manually as described in the section linked above, but doing this for many SimVars will quickly become tedious. Instead, we can use the ",(0,s.jsx)(n.code,{children:"SimVarPublisher"})," class to simplify the process. To use ",(0,s.jsx)(n.code,{children:"SimVarPublisher"}),", we must specify a set of SimVars to read and then take care of some initialization and housekeeping tasks:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"import { EventBus, SimVarPublisher } from '@microsoft/msfs-sdk';\r\n\r\ninterface SpeedEvents {\r\n  indicated_airspeed: number;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private readonly bus = new EventBus();\r\n\r\n  private readonly airspeedPublisher = new SimVarPublisher<SpeedEvents>(new Map([\r\n    ['indicated_airspeed', { name: 'AIRSPEED INDICATED', type: 'knots' }]\r\n  ]), this.bus);\r\n\r\n  // ...\r\n\r\n  public connectedCallback(): void {\r\n    super.connectedCallback();\r\n\r\n    this.airspeedPublisher.startPublish();\r\n  }\r\n\r\n  protected Update(): void {\r\n    super.Update();\r\n\r\n    this.airspeedPublisher.onUpdate();\r\n  }\r\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["In the above example, we've created a ",(0,s.jsx)(n.code,{children:"SimVarPublisher"})," that reads the ",(0,s.jsx)(n.code,{children:"AIRSPEED INDICATED"})," SimVar with units ",(0,s.jsx)(n.code,{children:"knots"})," and publishes the value to the ",(0,s.jsx)(n.code,{children:"indicated_airspeed"})," topic on the event bus. The call to ",(0,s.jsx)(n.code,{children:"startPublish()"})," tells the publisher to start reading and publishing SimVar values the next time it is updated. Finally, we call ",(0,s.jsx)(n.code,{children:"onUpdate()"})," in the instrument's update loop to update the publisher once on every instrument update cycle."]}),"\n",(0,s.jsx)(n.p,{children:"Publishing just one SimVar doesn't seem so impressive, but we can quite easily add additional SimVars:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"interface AirDataEvents {\r\n  indicated_airspeed: number;\r\n  true_airspeed: number;\r\n  mach: number;\r\n  pressure_altitude: number;\r\n  vertical_speed: number;\r\n  total_air_temperature: number;\r\n  static_air_temperature: number;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private readonly bus = new EventBus();\r\n\r\n  private readonly airspeedPublisher = new SimVarPublisher<AirDataEvents>(new Map([\r\n    ['indicated_airspeed', { name: 'AIRSPEED INDICATED', type: 'knots' }],\r\n    ['true_airspeed', { name: 'AIRSPEED TRUE', type: 'knots' }],\r\n    ['mach', { name: 'AIRSPEED MACH', type: 'mach' }],\r\n    ['pressure_altitude', { name: 'PRESSURE ALTITUDE', type: 'feet' }],\r\n    ['vertical_speed', { name: 'VERTICAL SPEED', type: 'feet per minute' }],\r\n    ['total_air_temperature', { name: 'TOTAL AIR TEMPERATURE', type: 'celsius' }],\r\n    ['static_air_temperature', { name: 'AMBIENT TEMPERATURE', type: 'celsius' }]\r\n  ]), this.bus);\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsx)(n.admonition,{type:"tip",children:(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"SimVarPublisher"})," will only read and publish the SimVars tied to topics that have actually been subscribed to in order to avoid making useless calls to ",(0,s.jsx)(n.code,{children:"SimVar.GetSimVarValue()"}),"."]})}),"\n",(0,s.jsx)(n.h3,{id:"publishing-boolean-values",children:"Publishing Boolean Values"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"SimVar.GetSimVarValue()"})," does not return values of type ",(0,s.jsx)(n.code,{children:"boolean"}),", even if you pass in ",(0,s.jsx)(n.code,{children:"'bool'"})," or ",(0,s.jsx)(n.code,{children:"'boolean'"})," as the units argument. Instead, it will return the numeric values ",(0,s.jsx)(n.code,{children:"0"})," and ",(0,s.jsx)(n.code,{children:"1"})," to represent ",(0,s.jsx)(n.code,{children:"false"})," and ",(0,s.jsx)(n.code,{children:"true"}),", respectively. In order to avoid type confusion and to allow SimVar values of type ",(0,s.jsx)(n.code,{children:"boolean"})," to be published on the bus where a ",(0,s.jsx)(n.code,{children:"boolean"})," type is expected, ",(0,s.jsx)(n.code,{children:"SimVarPublisher"})," automatically converts numeric SimVar values to their ",(0,s.jsx)(n.code,{children:"boolean"})," equivalents when ",(0,s.jsx)(n.code,{children:"'bool'"})," or ",(0,s.jsx)(n.code,{children:"'boolean'"})," is specified as the SimVar unit type."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"interface OnGroundEvents {\r\n  is_on_ground: boolean;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private readonly bus = new EventBus();\r\n\r\n  private readonly airspeedPublisher = new SimVarPublisher<OnGroundEvents>(new Map([\r\n    // A boolean (true/false) will be published to 'is_on_ground' instead of 0/1.\r\n    ['is_on_ground', { name: 'SIM ON GROUND', type: 'bool' }]\r\n  ]), this.bus);\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsx)(n.h3,{id:"publishing-indexed-simvars",children:"Publishing Indexed SimVars"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"SimVarPublisher"})," supports publishing SimVars with arbitrary indexes:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"interface EngineEvents {\r\n  n1: number;\r\n\r\n  [n1: `n1_${number}`]: number;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private readonly bus = new EventBus();\r\n\r\n  private readonly airspeedPublisher = new SimVarPublisher<EngineEvents>(new Map([\r\n    ['n1', { name: 'TURB ENG N1:#index#', type: 'percent', indexed: true }]\r\n  ]), this.bus);\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["In the above example, the ",(0,s.jsx)(n.code,{children:"n1"})," topic is flagged as an indexed SimVar topic by setting ",(0,s.jsx)(n.code,{children:"indexed"})," to ",(0,s.jsx)(n.code,{children:"true"})," in its publisher entry. When an entry is flagged as indexed, the publisher will automatically expand the entry to a series of indexed topics and SimVar names, with indexes beginning at 0. The indexed topics are generated using the pattern ",(0,s.jsx)(n.code,{children:"`${topic}_${index}`"}),", and the indexed SimVar names are generated by replacing the ",(0,s.jsx)(n.code,{children:"#index#"})," macro with the numeric index. So, in the above example the SimVars ",(0,s.jsx)(n.code,{children:"TURB ENG N1:0"}),", ",(0,s.jsx)(n.code,{children:"TURB ENG N1:1"}),", ",(0,s.jsx)(n.code,{children:"TURB ENG N1:2"}),", ... will be published to the topics ",(0,s.jsx)(n.code,{children:"n1_0"}),", ",(0,s.jsx)(n.code,{children:"n1_1"}),", ",(0,s.jsx)(n.code,{children:"n1_2"}),", ..."]}),"\n",(0,s.jsxs)(n.p,{children:["Additionally, the publisher will publish the SimVar at a default index (equal to 1 unless otherwise specified) to the unsuffixed form of the topic. So, in the above example the ",(0,s.jsx)(n.code,{children:"TURB ENG N1:1"})," SimVar will also be published to the topic ",(0,s.jsx)(n.code,{children:"n1"}),". A different default index may be specified through the ",(0,s.jsx)(n.code,{children:"defaultIndex"})," property in the publisher entry. Publishing of the default index can be omitted altogether by specifying ",(0,s.jsx)(n.code,{children:"null"})," for ",(0,s.jsx)(n.code,{children:"defaultIndex"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"interface EngineEventsRoot {\r\n  n1: number;\r\n}\r\n\r\ninterface EngineEvents {\r\n  [n1: `n1_${number}`]: number;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private readonly bus = new EventBus();\r\n\r\n  // The second type parameter on SimVarPublisher lets it know it should accept entries with topics defined in the\r\n  // EngineEventsRoot interface in addition to the ones defined in EngineEvents interface. This is needed because the\r\n  // unsuffixed 'n1' topic is not actually published and so doesn't appear in the EngineEvents interface.\r\n  private readonly airspeedPublisher = new SimVarPublisher<EngineEvents, EngineEventsRoot>(new Map([\r\n    ['n1', { name: 'TURB ENG N1:#index#', type: 'percent', indexed: true, defaultIndex: null }]\r\n  ]), this.bus);\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsxs)(n.p,{children:["If you want only certain indexes of a SimVar to be published, pass an iterable of indexes to the entry's ",(0,s.jsx)(n.code,{children:"indexed"})," property instead of ",(0,s.jsx)(n.code,{children:"true"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-typescript",children:"interface EngineEventsRoot {\r\n  n1: number;\r\n}\r\n\r\ninterface EngineEvents {\r\n  n1_1: number;\r\n  n1_2: number;\r\n}\r\n\r\nclass MyInstrument extends BaseInstrument {\r\n  private readonly bus = new EventBus();\r\n\r\n  private readonly airspeedPublisher = new SimVarPublisher<EngineEvents, EngineEventsRoot>(new Map([\r\n    // Only publish SimVar for engines 1 and 2.\r\n    ['n1', { name: 'TURB ENG N1:#index#', type: 'percent', indexed: [1, 2], defaultIndex: null }]\r\n  ]), this.bus);\r\n\r\n  // ...\r\n}\n"})}),"\n",(0,s.jsx)(n.h2,{id:"more-information",children:"More Information"}),"\n",(0,s.jsxs)(n.p,{children:["For more information about the various SimVars available in MSFS as well as a full list and description of each A var, please see the ",(0,s.jsx)(n.a,{href:"https://docs.flightsimulator.com/msfs2024/html/6_Programming_APIs/SimVars/Simulation_Variables.htm",children:"MSFS SDK Documentation"}),"."]})]})}function h(e={}){let{wrapper:n}={...(0,t.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(c,{...e})}):c(e)}},250065:function(e,n,i){i.d(n,{Z:function(){return o},a:function(){return a}});var r=i(667294);let s={},t=r.createContext(s);function a(e){let n=r.useContext(t);return r.useMemo(function(){return"function"==typeof e?e(n):{...n,...e}},[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),r.createElement(t.Provider,{value:n},e.children)}}}]);