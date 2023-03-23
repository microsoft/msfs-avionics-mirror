"use strict";(self.webpackChunkdocs_api=self.webpackChunkdocs_api||[]).push([[6888],{3905:(e,t,i)=>{i.d(t,{Zo:()=>d,kt:()=>f});var a=i(67294);function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function r(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),i.push.apply(i,a)}return i}function s(e){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?r(Object(i),!0).forEach((function(t){n(e,t,i[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(i)):r(Object(i)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(i,t))}))}return e}function l(e,t){if(null==e)return{};var i,a,n=function(e,t){if(null==e)return{};var i,a,n={},r=Object.keys(e);for(a=0;a<r.length;a++)i=r[a],t.indexOf(i)>=0||(n[i]=e[i]);return n}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)i=r[a],t.indexOf(i)>=0||Object.prototype.propertyIsEnumerable.call(e,i)&&(n[i]=e[i])}return n}var o=a.createContext({}),c=function(e){var t=a.useContext(o),i=t;return e&&(i="function"==typeof e?e(t):s(s({},t),e)),i},d=function(e){var t=c(e.components);return a.createElement(o.Provider,{value:t},e.children)},h="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var i=e.components,n=e.mdxType,r=e.originalType,o=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),h=c(i),u=n,f=h["".concat(o,".").concat(u)]||h[u]||p[u]||r;return i?a.createElement(f,s(s({ref:t},d),{},{components:i})):a.createElement(f,s({ref:t},d))}));function f(e,t){var i=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=i.length,s=new Array(r);s[0]=u;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[h]="string"==typeof e?e:n,s[1]=l;for(var c=2;c<r;c++)s[c]=i[c];return a.createElement.apply(null,s)}return a.createElement.apply(null,i)}u.displayName="MDXCreateElement"},83518:(e,t,i)=>{i.r(t),i.d(t,{assets:()=>o,contentTitle:()=>s,default:()=>p,frontMatter:()=>r,metadata:()=>l,toc:()=>c});var a=i(87462),n=(i(67294),i(3905));const r={sidebar_position:4},s="Querying Navdata",l={unversionedId:"interacting-with-msfs/querying-navdata",id:"interacting-with-msfs/querying-navdata",title:"Querying Navdata",description:"What Are Facilities?",source:"@site/docs/interacting-with-msfs/querying-navdata.md",sourceDirName:"interacting-with-msfs",slug:"/interacting-with-msfs/querying-navdata",permalink:"/msfs-avionics-mirror/docs/interacting-with-msfs/querying-navdata",draft:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"sidebar",previous:{title:"Receiving H Events",permalink:"/msfs-avionics-mirror/docs/interacting-with-msfs/receiving-h-events"},next:{title:"Readme",permalink:"/msfs-avionics-mirror/docs/framework/"}},o={},c=[{value:"What Are Facilities?",id:"what-are-facilities",level:2},{value:"Airport Facilities",id:"airport-facilities",level:3},{value:"Intersection Facilities",id:"intersection-facilities",level:3},{value:"VOR Facilities",id:"vor-facilities",level:3},{value:"NDB Facilities",id:"ndb-facilities",level:3},{value:"Boundary Facilities",id:"boundary-facilities",level:3},{value:"MSFS Facility ICAO Format",id:"msfs-facility-icao-format",level:2},{value:"Type",id:"type",level:3},{value:"Region",id:"region",level:3},{value:"Airport",id:"airport",level:3},{value:"Ident",id:"ident",level:3},{value:"Loading Individual Facilities",id:"loading-individual-facilities",level:2},{value:"Finding An ICAO",id:"finding-an-icao",level:3},{value:"Searching Nearest Facilities",id:"searching-nearest-facilities",level:2},{value:"Performing A Nearest Facility Search",id:"performing-a-nearest-facility-search",level:3}],d={toc:c},h="wrapper";function p(e){let{components:t,...i}=e;return(0,n.kt)(h,(0,a.Z)({},d,i,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"querying-navdata"},"Querying Navdata"),(0,n.kt)("h2",{id:"what-are-facilities"},"What Are Facilities?"),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},"Facilities")," are the heart of MSFS navigational data, and encompass all of the different types of navigational data that are available to query. The Javascript facility loading system can access 5 different types of facilities from the simulator: airports, intersections, VORs, NDBs, and airspace boundaries."),(0,n.kt)("h3",{id:"airport-facilities"},"Airport Facilities"),(0,n.kt)("p",null,"Airport facilities records hold a large amount of data about a given airport:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"Metadata about the airport, such as the name, ICAO, location"),(0,n.kt)("li",{parentName:"ul"},"COM radio frequencies available related to the airport"),(0,n.kt)("li",{parentName:"ul"},"Runway definitions, including available runway ILS frequencies"),(0,n.kt)("li",{parentName:"ul"},"Departure, arrival, and approach procedures including:",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"All procedure legs"),(0,n.kt)("li",{parentName:"ul"},"Transitions and transition names"),(0,n.kt)("li",{parentName:"ul"},"Approach details, such as type, associated runways, RNAV information")))),(0,n.kt)("h3",{id:"intersection-facilities"},"Intersection Facilities"),(0,n.kt)("p",null,"Intersection facilities are one of the more basic facility types. They indicate some metadata regarding the intersection, such as ICAO, the type (low, high), what airway they might be on, and a location."),(0,n.kt)("h3",{id:"vor-facilities"},"VOR Facilities"),(0,n.kt)("p",null,"VOR facilities are similar to intersection facilities, except that they indicate some more relevant details about the VOR radio, such as the magnetic variance, tuning frequency, and class (high power, low power, etc). VOR facilities do not include airway information; for VORs that are part of an airway, there is a separate intersection facility record."),(0,n.kt)("h3",{id:"ndb-facilities"},"NDB Facilities"),(0,n.kt)("p",null,"Similar to VOR facilities, these instead give the NDB/ADF tuning frequency."),(0,n.kt)("h3",{id:"boundary-facilities"},"Boundary Facilities"),(0,n.kt)("p",null,"These facility records contain the name, ID, bounding box, type, and vector shape of a given airspace boundary."),(0,n.kt)("h2",{id:"msfs-facility-icao-format"},"MSFS Facility ICAO Format"),(0,n.kt)("p",null,"Most navigational facilities in MSFS are uniquely identified using a 12 character formatted string, called an ICAO. The ICAO format is:"),(0,n.kt)("table",null,(0,n.kt)("thead",null,(0,n.kt)("th",null,"Type"),(0,n.kt)("th",{colspan:"2"},"Region"),(0,n.kt)("th",{colspan:"4"},"Airport"),(0,n.kt)("th",{colspan:"5"},"Ident")),(0,n.kt)("tbody",null,(0,n.kt)("tr",null,(0,n.kt)("td",null,"A"),(0,n.kt)("td",null,"K"),(0,n.kt)("td",null,"5"),(0,n.kt)("td",null,"K"),(0,n.kt)("td",null,"O"),(0,n.kt)("td",null,"R"),(0,n.kt)("td",null,"D"),(0,n.kt)("td",null,"G"),(0,n.kt)("td",null,"O"),(0,n.kt)("td",null,"O"),(0,n.kt)("td",null,"Z"),(0,n.kt)("td",null,"Y")))),(0,n.kt)("admonition",{type:"info"},(0,n.kt)("p",{parentName:"admonition"},"The ICAO must always be 12 characters. Any omitted fields must be replaced by empty spaces.")),(0,n.kt)("h3",{id:"type"},"Type"),(0,n.kt)("p",null,"The first character of a MSFS ICAO represents the type of facility. The available types are:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("inlineCode",{parentName:"li"},"A")," - Airport"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("inlineCode",{parentName:"li"},"W")," - Intersection"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("inlineCode",{parentName:"li"},"V")," - VOR"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("inlineCode",{parentName:"li"},"N")," - NDB")),(0,n.kt)("h3",{id:"region"},"Region"),(0,n.kt)("p",null,"The second two characters represent the MSFS region code, which correspond to the ",(0,n.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/ICAO_airport_code"},"ICAO Airport Region Codes"),", with some large areas being subdivided. For example, the K area for the US is divided into regions K1 through K7 (generally from east to west incrementing), and the Y area for Australia is similarly divided (YB and YM)."),(0,n.kt)("p",null,"Airport facilities are not required to have a region code, since each airport ident is unique throughout the world."),(0,n.kt)("h3",{id:"airport"},"Airport"),(0,n.kt)("p",null,"Some facilities also include this optional field, which is the owning airport. This is used to disambiguate facilities which might otherwise have the same 12 character ICAO, such as airport RNAV approach fixes that share an ident with an intersection."),(0,n.kt)("p",null,"Airports themselves do not include this field."),(0,n.kt)("h3",{id:"ident"},"Ident"),(0,n.kt)("p",null,"This is the name of the facility, which is almost always what a user or pilot is interacting with. Idents are not unique around the world, while the full 12 digit ICAO will be."),(0,n.kt)("h2",{id:"loading-individual-facilities"},"Loading Individual Facilities"),(0,n.kt)("p",null,"This avionics framework includes a system by which you can query facility data, called ",(0,n.kt)("inlineCode",{parentName:"p"},"FacilityLoader"),":"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-typescript"},"const eventBus = new EventBus();\nconst facilityLoader = new FacilityLoader(FacilityRepository.getRepository(eventBus));\n\nconst ord = await facilityLoader.getFacility(FacilityType.Airport, 'A      KORD ');\nconsole.log(`This airport is called ${ord.name}`);\n")),(0,n.kt)("h3",{id:"finding-an-icao"},"Finding An ICAO"),(0,n.kt)("p",null,"Sometimes, you may not have the full 12 character ICAO available (such as when a user is inputting a facility ident). In these cases, you can get a collection of ICAOs whose ident starts with the given string:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-typescript"},"const matches = await facilityLoader.searchByIdent(FacilitySearchType.None, 'JOT');\n")),(0,n.kt)("p",null,"Or if you would like to limit your search to a specific facility type and a maximum of a certain number of facilities:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-typescript"},"const matches = await facilityLoader.searchByIdent(FacilitySearchType.NDB, 'AB', 10);\n")),(0,n.kt)("h2",{id:"searching-nearest-facilities"},"Searching Nearest Facilities"),(0,n.kt)("p",null,"Sometimes, it is helpful to get a collection of facilities that are within a certain geographic distance. For this, the framework provides nearest facilities search sessions."),(0,n.kt)("p",null,"By starting a search session, you can get a list of the facilities that are within a specfied distance of a lat/lon point. Once started, this search session keeps track, within the sim, of the ICAOs of facilities that have been either added or removed since the last time you searched using the given session."),(0,n.kt)("p",null,"This means that for the first search performed in a given session, all facilities within range will return in the data as ",(0,n.kt)("strong",{parentName:"p"},"added facilities"),". If no parameters change (the search radius or the search point), then the next search will return no facilities added or removed: in other words, the facilities that were returned last time are still the valid set of facilities in the search area. If you change the search area parameters, such as by moving the search point or changing the radius, the data returned will include only the diff: everything added to the set of valid facilities in range, and everything removed from the set of valid facilities in range."),(0,n.kt)("p",null,"This type of search is especially useful for things like map facility icons or pages that show nearest facilities: since only the diffs since the last search are returned, that's all that needs to be processed and the map or list can add or remove the few items in the diff."),(0,n.kt)("h3",{id:"performing-a-nearest-facility-search"},"Performing A Nearest Facility Search"),(0,n.kt)("p",null,"You can perform a nearest facility search by starting a new search session using the facility loader, and then searching using the returned session:"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-typescript"},"const session = await facilityLoader.startNearestSearchSession(FacilitySearchType.Airport);\n\nconst nearestAirports = new Map<string, AirportFacility>();\nsetInterval(async () => {\n  const lat = SimVar.GetSimVarValue('PLANE LATITUDE', 'degrees');\n  const lon = SimVar.GetSimVarValue('PLANE LONGITUDE', 'degrees');\n\n  const distanceMeters = UnitType.NMILE.convertTo(100, UnitType.METER);\n  const diff = await session.performNearestSearch(lat, lon, distanceMeters, 25);\n\n  for (let i = 0; i < diff.removed.length; i++) {\n    nearestAirports.remove(diff.removed[i]);\n  }\n\n  await Promise.all(diff.added.map(async (icao) => {\n    const airport = await facilityLoader.getFacility(FacilityType.Airport, icao);\n    nearestAirports.add(icao, airport);\n  }));\n}, 1000);\n")),(0,n.kt)("p",null,"This code starts a new session, then searches for all airports within 100NM of the current plane position every second, adding and removing from the collection of currently found airports as necessary."),(0,n.kt)("admonition",{type:"caution"},(0,n.kt)("p",{parentName:"admonition"},"Each search session started during a flight uses memory within the sim to track your session state. This is only cleared after the end of the flight. It is highly recommended to limit the number of search sessions started per instrument and reuse sessions where possible."),(0,n.kt)("p",{parentName:"admonition"},"Starting a new session for every individual search performed will cause an unnecessary memory load in the simulator and should be avoided.")))}p.isMDXComponent=!0}}]);