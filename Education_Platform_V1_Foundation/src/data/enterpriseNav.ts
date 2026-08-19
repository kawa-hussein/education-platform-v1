import { architectureModules } from "./modules";

export type ProductPlane="provider"|"tenant";
export type NavEntry={code:string;route:string;label?:string;badge?:string};
export type NavGroup={id:string;label:string;entries:NavEntry[]};

const moduleRoute=(code:string)=>`module-${code}`;
export const operationalRouteByCode:Record<string,string>={
  P01:"provider-dashboard",
  P02:"customers",
  P29:"provider-team",
  A01:"tenant-dashboard",
  A02:"branches",
  A06:"access",
  A16:"audit",
  A19:"import",
  B04:"students",
  B10:"attendance",
  B30:"finance",
  B31:"finance",
  B35:"staff",
  B42:"payroll"
};
export const routeForCode=(code:string)=>operationalRouteByCode[code]||moduleRoute(code);
const moduleTitleMap=Object.fromEntries(architectureModules.map(m=>[m.code,m.title])) as Record<string,string>;
export const titleForCode=(code:string)=>moduleTitleMap[code]||code;

const entries=(codes:string[]):NavEntry[]=>codes.map(code=>({code,route:routeForCode(code)}));

export const providerNavGroups:NavGroup[]=[
  {id:"provider-command",label:"Command Center",entries:entries(["P01","P02"])},
  {id:"provider-commercial",label:"Commercial",entries:entries(["P03","P04","P05","P06","P07"])},
  {id:"provider-delivery",label:"Delivery & Customer",entries:entries(["P08","P09","P10","P11","P12","P13","P14"])},
  {id:"provider-operations",label:"Operations & Reliability",entries:entries(["P15","P16","P17","P18","P19","P20"])},
  {id:"provider-platform",label:"Platform & Governance",entries:entries(["P21","P22","P23","P24","P25"])},
  {id:"provider-intelligence",label:"Finance & Intelligence",entries:entries(["P26","P27","P28"])},
  {id:"provider-admin",label:"Administration & Protection",entries:entries(["P29","P30","P31","P32","P33","P34","P35"])},
];

export const tenantCoreNavGroups:NavGroup[]=[
  {id:"core-org",label:"Organization & Identity",entries:entries(["A01","A02","A03","A04","A05","A06"])},
  {id:"core-config",label:"Configuration & Automation",entries:entries(["A07","A08","A09","A10","A11","A12"])},
  {id:"core-work",label:"Documents, Work & History",entries:entries(["A13","A14","A15","A16"])},
  {id:"core-data",label:"Governance, Data & Integration",entries:entries(["A17","A18","A19","A20","A21","A22","A23","A24","A25"])},
  {id:"core-enterprise",label:"Enterprise Administration",entries:entries(["A26","A27","A28","A29","A30"])},
];

export const k12NavGroups:NavGroup[]=[
  {id:"school-academic",label:"Academic Core",entries:entries(["B01","B02","B03","B04","B05","B06","B07","B08","B09","B10","B11","B12","B13","B14"])},
  {id:"school-care",label:"Student Care & Support",entries:entries(["B15","B16","B17","B18","B19"])},
  {id:"school-community",label:"Portals & School Community",entries:entries(["B20","B21","B22","B23","B24","B25","B26","B27","B28","B29"])},
  {id:"school-ops",label:"Finance & Operations",entries:entries(["B30","B31","B32","B33","B34","B35","B36","B37","B38","B39"])},
  {id:"school-business",label:"Payroll, Funding & Development",entries:entries(["B40","B41","B42","B43","B44","B45","B46","B47"])},
  {id:"school-enterprise",label:"Growth, Quality & Resilience",entries:entries(["B48","B49","B50","B51","B52","B53","B54","B55","B56"])},
];

export const academyNavGroups:NavGroup[]=[
  {id:"academy-core",label:"Academy Core",entries:entries(["C01","C02","C03","C04","C05","C06","C07","C08"])},
  {id:"academy-commercial",label:"Billing & Operations",entries:entries(["C09","C10","C11","C12","C13","C14","C15"])},
];

export const higherEdNavGroups:NavGroup[]=[
  {id:"higher-academic",label:"Academic Lifecycle",entries:entries(["D01","D02","D03","D04","D05","D06","D07","D08","D09","D10","D11","D12","D13","D14","D15","D16"])},
  {id:"higher-finance",label:"Student Finance",entries:entries(["D17","D18","D19"])},
  {id:"higher-faculty",label:"Faculty & Research",entries:entries(["D20","D21","D22","D23","D24","D25"])},
  {id:"higher-campus",label:"Campus & Student Affairs",entries:entries(["D26","D27","D28","D29","D30"])},
  {id:"higher-institution",label:"Institutional Effectiveness",entries:entries(["D31","D32","D33"])},
];

export const foundationOperationalCodes=new Set(Object.keys(operationalRouteByCode));
