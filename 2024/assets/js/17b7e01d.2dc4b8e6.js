"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([["739804"],{248261:function(e,r,n){n.r(r),n.d(r,{metadata:()=>i,contentTitle:()=>a,default:()=>h,assets:()=>l,toc:()=>o,frontMatter:()=>s});var i=JSON.parse('{"id":"api/garminsdk/interfaces/GarminFlightPlanRouteProvider","title":"Interface: GarminFlightPlanRouteProvider","description":"A provider of Garmin flight plan routes.","source":"@site/docs/api/garminsdk/interfaces/GarminFlightPlanRouteProvider.md","sourceDirName":"api/garminsdk/interfaces","slug":"/api/garminsdk/interfaces/GarminFlightPlanRouteProvider","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/GarminFlightPlanRouteProvider","draft":false,"unlisted":false,"tags":[],"version":"current","frontMatter":{},"sidebar":"sidebar","previous":{"title":"GarminFlightPlanRouteLoader","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/GarminFlightPlanRouteLoader"},"next":{"title":"GarminGlidepathComputerOptions","permalink":"/msfs-avionics-mirror/2024/docs/api/garminsdk/interfaces/GarminGlidepathComputerOptions"}}'),t=n("785893"),d=n("250065");let s={},a="Interface: GarminFlightPlanRouteProvider",l={},o=[{value:"Methods",id:"methods",level:2},{value:"getRoute()",id:"getroute",level:3},{value:"Returns",id:"returns",level:4},{value:"__Type",id:"__type",level:5},{value:"approach",id:"approach",level:5},{value:"approach.__Type",id:"approach__type",level:5},{value:"approach.runway",id:"approachrunway",level:5},{value:"approach.runway.__Type",id:"approachrunway__type",level:5},{value:"approach.runway.designator",id:"approachrunwaydesignator",level:5},{value:"approach.runway.number",id:"approachrunwaynumber",level:5},{value:"approach.suffix",id:"approachsuffix",level:5},{value:"approach.type",id:"approachtype",level:5},{value:"approachTransition",id:"approachtransition",level:5},{value:"approachVfrPattern",id:"approachvfrpattern",level:5},{value:"approachVfrPattern.__Type",id:"approachvfrpattern__type",level:5},{value:"approachVfrPattern.altitude",id:"approachvfrpatternaltitude",level:5},{value:"approachVfrPattern.distance",id:"approachvfrpatterndistance",level:5},{value:"approachVfrPattern.isLeftTraffic",id:"approachvfrpatternislefttraffic",level:5},{value:"approachVfrPattern.type",id:"approachvfrpatterntype",level:5},{value:"arrival",id:"arrival",level:5},{value:"arrivalTransition",id:"arrivaltransition",level:5},{value:"cruiseAltitude",id:"cruisealtitude",level:5},{value:"departure",id:"departure",level:5},{value:"departureAirport",id:"departureairport",level:5},{value:"departureAirport.__Type",id:"departureairport__type",level:5},{value:"departureAirport.airport",id:"departureairportairport",level:5},{value:"departureAirport.ident",id:"departureairportident",level:5},{value:"departureAirport.region",id:"departureairportregion",level:5},{value:"departureAirport.type",id:"departureairporttype",level:5},{value:"departureRunway",id:"departurerunway",level:5},{value:"departureRunway.__Type",id:"departurerunway__type",level:5},{value:"departureRunway.designator",id:"departurerunwaydesignator",level:5},{value:"departureRunway.number",id:"departurerunwaynumber",level:5},{value:"departureTransition",id:"departuretransition",level:5},{value:"departureVfrPattern",id:"departurevfrpattern",level:5},{value:"departureVfrPattern.__Type",id:"departurevfrpattern__type",level:5},{value:"departureVfrPattern.altitude",id:"departurevfrpatternaltitude",level:5},{value:"departureVfrPattern.distance",id:"departurevfrpatterndistance",level:5},{value:"departureVfrPattern.isLeftTraffic",id:"departurevfrpatternislefttraffic",level:5},{value:"departureVfrPattern.type",id:"departurevfrpatterntype",level:5},{value:"destinationAirport",id:"destinationairport",level:5},{value:"destinationAirport.__Type",id:"destinationairport__type",level:5},{value:"destinationAirport.airport",id:"destinationairportairport",level:5},{value:"destinationAirport.ident",id:"destinationairportident",level:5},{value:"destinationAirport.region",id:"destinationairportregion",level:5},{value:"destinationAirport.type",id:"destinationairporttype",level:5},{value:"destinationRunway",id:"destinationrunway",level:5},{value:"destinationRunway.__Type",id:"destinationrunway__type",level:5},{value:"destinationRunway.designator",id:"destinationrunwaydesignator",level:5},{value:"destinationRunway.number",id:"destinationrunwaynumber",level:5},{value:"enroute",id:"enroute",level:5},{value:"isVfr",id:"isvfr",level:5},{value:"Defined in",id:"defined-in",level:4}];function c(e){let r={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",header:"header",p:"p",strong:"strong",...(0,d.a)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.header,{children:(0,t.jsx)(r.h1,{id:"interface-garminflightplanrouteprovider",children:"Interface: GarminFlightPlanRouteProvider"})}),"\n",(0,t.jsx)(r.p,{children:"A provider of Garmin flight plan routes."}),"\n",(0,t.jsx)(r.h2,{id:"methods",children:"Methods"}),"\n",(0,t.jsx)(r.h3,{id:"getroute",children:"getRoute()"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.strong,{children:"getRoute"}),"(): ",(0,t.jsx)(r.code,{children:"Promise"}),"<",(0,t.jsx)(r.code,{children:"object"}),">"]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Gets a flight plan route."}),"\n",(0,t.jsx)(r.h4,{id:"returns",children:"Returns"}),"\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"Promise"}),"<",(0,t.jsx)(r.code,{children:"object"}),">"]}),"\n",(0,t.jsx)(r.p,{children:"A Promise which is fulfilled with a flight plan route. The returned Promise is guaranteed to never be\nrejected."}),"\n",(0,t.jsx)(r.h5,{id:"__type",children:"__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_FlightPlanRoute"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"approach",children:"approach"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"approach"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"This route's approach procedure."}),"\n",(0,t.jsx)(r.h5,{id:"approach__type",children:"approach.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_ApproachIdentifier"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"approachrunway",children:"approach.runway"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"runway"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The approach's associated runway."}),"\n",(0,t.jsx)(r.h5,{id:"approachrunway__type",children:"approach.runway.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_RunwayIdentifier"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"approachrunwaydesignator",children:"approach.runway.designator"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"designator"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The designator of the runway."}),"\n",(0,t.jsx)(r.h5,{id:"approachrunwaynumber",children:"approach.runway.number"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"number"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The number of the runway."}),"\n",(0,t.jsx)(r.h5,{id:"approachsuffix",children:"approach.suffix"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"suffix"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The suffix of the approach."}),"\n",(0,t.jsx)(r.h5,{id:"approachtype",children:"approach.type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"type"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The type name of the approach."}),"\n",(0,t.jsx)(r.h5,{id:"approachtransition",children:"approachTransition"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"approachTransition"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The name of this route's approach procedure transition."}),"\n",(0,t.jsx)(r.h5,{id:"approachvfrpattern",children:"approachVfrPattern"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"approachVfrPattern"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"This route's VFR traffic pattern approach procedure."}),"\n",(0,t.jsx)(r.h5,{id:"approachvfrpattern__type",children:"approachVfrPattern.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_VfrPatternProcedure"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"approachvfrpatternaltitude",children:"approachVfrPattern.altitude"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"altitude"}),": ",(0,t.jsx)(r.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The pattern altitude, in feet AGL."}),"\n",(0,t.jsx)(r.h5,{id:"approachvfrpatterndistance",children:"approachVfrPattern.distance"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"distance"}),": ",(0,t.jsx)(r.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The pattern leg distance, in nautical miles."}),"\n",(0,t.jsx)(r.h5,{id:"approachvfrpatternislefttraffic",children:"approachVfrPattern.isLeftTraffic"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"isLeftTraffic"}),": ",(0,t.jsx)(r.code,{children:"boolean"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Whether the pattern uses a left-hand traffic pattern (true) instead of a right-hand traffic pattern (false)."}),"\n",(0,t.jsx)(r.h5,{id:"approachvfrpatterntype",children:"approachVfrPattern.type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"type"}),": ",(0,t.jsx)(r.code,{children:"FlightPlanRouteVfrPatternApproachType"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The selected pattern type."}),"\n",(0,t.jsx)(r.h5,{id:"arrival",children:"arrival"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"arrival"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The name of this route's arrival procedure."}),"\n",(0,t.jsx)(r.h5,{id:"arrivaltransition",children:"arrivalTransition"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"arrivalTransition"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The name of this route's arrival procedure enroute transition."}),"\n",(0,t.jsx)(r.h5,{id:"cruisealtitude",children:"cruiseAltitude"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"cruiseAltitude"}),": ",(0,t.jsx)(r.code,{children:"null"})," | ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"This route's cruise altitude."}),"\n",(0,t.jsx)(r.h5,{id:"departure",children:"departure"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"departure"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The name of this route's departure procedure."}),"\n",(0,t.jsx)(r.h5,{id:"departureairport",children:"departureAirport"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"departureAirport"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The ICAO of this route's departure airport."}),"\n",(0,t.jsx)(r.h5,{id:"departureairport__type",children:"departureAirport.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_ICAO"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"departureairportairport",children:"departureAirport.airport"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"airport"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The ident of the facility's associated airport."}),"\n",(0,t.jsx)(r.h5,{id:"departureairportident",children:"departureAirport.ident"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"ident"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The facility's ident."}),"\n",(0,t.jsx)(r.h5,{id:"departureairportregion",children:"departureAirport.region"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"region"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The facility's region code."}),"\n",(0,t.jsx)(r.h5,{id:"departureairporttype",children:"departureAirport.type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"type"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The facility's type."}),"\n",(0,t.jsx)(r.h5,{id:"departurerunway",children:"departureRunway"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"departureRunway"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"This route's departure runway."}),"\n",(0,t.jsx)(r.h5,{id:"departurerunway__type",children:"departureRunway.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_RunwayIdentifier"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"departurerunwaydesignator",children:"departureRunway.designator"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"designator"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The designator of the runway."}),"\n",(0,t.jsx)(r.h5,{id:"departurerunwaynumber",children:"departureRunway.number"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"number"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The number of the runway."}),"\n",(0,t.jsx)(r.h5,{id:"departuretransition",children:"departureTransition"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"departureTransition"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The name of this route's departure procedure enroute transition."}),"\n",(0,t.jsx)(r.h5,{id:"departurevfrpattern",children:"departureVfrPattern"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"departureVfrPattern"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"This route's VFR traffic pattern departure procedure."}),"\n",(0,t.jsx)(r.h5,{id:"departurevfrpattern__type",children:"departureVfrPattern.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_VfrPatternProcedure"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"departurevfrpatternaltitude",children:"departureVfrPattern.altitude"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"altitude"}),": ",(0,t.jsx)(r.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The pattern altitude, in feet AGL."}),"\n",(0,t.jsx)(r.h5,{id:"departurevfrpatterndistance",children:"departureVfrPattern.distance"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"distance"}),": ",(0,t.jsx)(r.code,{children:"number"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The pattern leg distance, in nautical miles."}),"\n",(0,t.jsx)(r.h5,{id:"departurevfrpatternislefttraffic",children:"departureVfrPattern.isLeftTraffic"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"isLeftTraffic"}),": ",(0,t.jsx)(r.code,{children:"boolean"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Whether the pattern uses a left-hand traffic pattern (true) instead of a right-hand traffic pattern (false)."}),"\n",(0,t.jsx)(r.h5,{id:"departurevfrpatterntype",children:"departureVfrPattern.type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"type"}),": ",(0,t.jsx)(r.code,{children:"FlightPlanRouteVfrPatternDepartureType"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The selected pattern type."}),"\n",(0,t.jsx)(r.h5,{id:"destinationairport",children:"destinationAirport"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"destinationAirport"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The ICAO of this route's destination airport."}),"\n",(0,t.jsx)(r.h5,{id:"destinationairport__type",children:"destinationAirport.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_ICAO"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"destinationairportairport",children:"destinationAirport.airport"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"airport"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The ident of the facility's associated airport."}),"\n",(0,t.jsx)(r.h5,{id:"destinationairportident",children:"destinationAirport.ident"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"ident"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The facility's ident."}),"\n",(0,t.jsx)(r.h5,{id:"destinationairportregion",children:"destinationAirport.region"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"region"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The facility's region code."}),"\n",(0,t.jsx)(r.h5,{id:"destinationairporttype",children:"destinationAirport.type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"type"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The facility's type."}),"\n",(0,t.jsx)(r.h5,{id:"destinationrunway",children:"destinationRunway"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"destinationRunway"}),": ",(0,t.jsx)(r.code,{children:"object"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"This route's destination runway."}),"\n",(0,t.jsx)(r.h5,{id:"destinationrunway__type",children:"destinationRunway.__Type"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"__Type"}),": ",(0,t.jsx)(r.code,{children:'"JS_RunwayIdentifier"'})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Coherent C++ object binding type."}),"\n",(0,t.jsx)(r.h5,{id:"destinationrunwaydesignator",children:"destinationRunway.designator"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"designator"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The designator of the runway."}),"\n",(0,t.jsx)(r.h5,{id:"destinationrunwaynumber",children:"destinationRunway.number"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"number"}),": ",(0,t.jsx)(r.code,{children:"string"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"The number of the runway."}),"\n",(0,t.jsx)(r.h5,{id:"enroute",children:"enroute"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"enroute"}),": readonly ",(0,t.jsx)(r.code,{children:"object"}),"[]"]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"This route's enroute legs."}),"\n",(0,t.jsx)(r.h5,{id:"isvfr",children:"isVfr"}),"\n",(0,t.jsxs)(r.blockquote,{children:["\n",(0,t.jsxs)(r.p,{children:[(0,t.jsx)(r.code,{children:"readonly"})," ",(0,t.jsx)(r.strong,{children:"isVfr"}),": ",(0,t.jsx)(r.code,{children:"boolean"})]}),"\n"]}),"\n",(0,t.jsx)(r.p,{children:"Whether this route is classified as VFR."}),"\n",(0,t.jsx)(r.h4,{id:"defined-in",children:"Defined in"}),"\n",(0,t.jsx)(r.p,{children:"src/garminsdk/flightplan/GarminFlightPlanRouteProvider.ts:12"})]})}function h(e={}){let{wrapper:r}={...(0,d.a)(),...e.components};return r?(0,t.jsx)(r,{...e,children:(0,t.jsx)(c,{...e})}):c(e)}},250065:function(e,r,n){n.d(r,{Z:function(){return a},a:function(){return s}});var i=n(667294);let t={},d=i.createContext(t);function s(e){let r=i.useContext(d);return i.useMemo(function(){return"function"==typeof e?e(r):{...r,...e}},[r,e])}function a(e){let r;return r=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:s(e.components),i.createElement(d.Provider,{value:r},e.children)}}}]);