// Mock data layer for the RFID Fabric Roll Traceability System front end.
// Mirrors the database design in the SRS: Users, Roles, Departments,
// RFIDTags, FabricRolls, RollMovements, AuditLogs, Gates.

export type Role = "Admin" | "Supervisor" | "Operator" | "Management";

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  status: "Active" | "Disabled";
  createdDate: string;
  lastLogin: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  sequenceNo: number;
}

export type TagStatus = "Active" | "Damaged" | "Replaced" | "Inactive";

export interface RFIDTag {
  id: number;
  epc: string;
  status: TagStatus;
  assignedRollId: number | null;
  registeredDate: string;
}

export type RollStatus =
  | "In Production"
  | "Pending QC"
  | "QC Pass"
  | "QC Fail"
  | "Rework"
  | "Hold"
  | "Packed"
  | "Dispatched";

export interface FabricRoll {
  id: number;
  rollNumber: string;
  rfidEpc: string;
  batchNo: string;
  gsm: number;
  width: number; // cm
  length: number; // m
  weight: number; // kg
  machine: string;
  operator: string;
  productionDate: string;
  currentDepartment: string;
  currentStatus: RollStatus;
  location: string;
  lastScanTime: string;
}

export interface RollMovement {
  id: number;
  rollId: number;
  sourceDept: string;
  destinationDept: string;
  status: string;
  user: string;
  timestamp: string;
  device: string;
  machine: string;
  remarks: string;
  viaGate?: string;
}

export interface AuditLog {
  id: number;
  user: string;
  action:
    | "Login"
    | "Logout"
    | "Roll Creation"
    | "Roll Movement"
    | "Status Change"
    | "RFID Replacement"
    | "User Management";
  detail: string;
  timestamp: string;
  deviceId: string;
}

export interface Gate {
  id: string;
  name: string;
  department: string;
  direction: "Entry" | "Exit";
  readerIp: string;
  readZone: string;
  sensitivity: number; // dBm
  dedupeIntervalSec: number;
  status: "Online" | "Offline";
}

export interface GateEvent {
  id: number;
  gate: string;
  epc: string;
  rollNumber: string | null;
  direction: "Entry" | "Exit";
  signalStrength: number;
  timestamp: string;
  result: "Movement Created" | "Duplicate Ignored" | "Unknown Tag Alert";
}

// ---------------------------------------------------------------- departments
export const departments: Department[] = [
  { id: 1, name: "Weaving", code: "WVG", sequenceNo: 1 },
  { id: 2, name: "Printing", code: "PRT", sequenceNo: 2 },
  { id: 3, name: "Lamination", code: "LAM", sequenceNo: 3 },
  { id: 4, name: "Cutting", code: "CUT", sequenceNo: 4 },
  { id: 5, name: "Quality Check", code: "QC", sequenceNo: 5 },
  { id: 6, name: "Packing", code: "PCK", sequenceNo: 6 },
  { id: 7, name: "Dispatch", code: "DSP", sequenceNo: 7 },
];

// ---------------------------------------------------------------- users
export const users: User[] = [
  { id: 1, username: "admin", fullName: "Rajesh Verma", role: "Admin", status: "Active", createdDate: "2025-11-02", lastLogin: "2026-09-18 06:42" },
  { id: 2, username: "s.iyer", fullName: "Suresh Iyer", role: "Supervisor", status: "Active", createdDate: "2025-11-10", lastLogin: "2026-09-18 07:15" },
  { id: 3, username: "m.khatun", fullName: "Mina Khatun", role: "Supervisor", status: "Active", createdDate: "2025-12-01", lastLogin: "2026-09-18 05:58" },
  { id: 4, username: "a.das", fullName: "Arjun Das", role: "Operator", status: "Active", createdDate: "2026-01-14", lastLogin: "2026-09-18 08:03" },
  { id: 5, username: "p.singh", fullName: "Prakash Singh", role: "Operator", status: "Active", createdDate: "2026-01-14", lastLogin: "2026-09-18 08:11" },
  { id: 6, username: "r.mondal", fullName: "Rina Mondal", role: "Operator", status: "Active", createdDate: "2026-02-09", lastLogin: "2026-09-17 22:40" },
  { id: 7, username: "k.bose", fullName: "Kunal Bose", role: "Operator", status: "Disabled", createdDate: "2026-02-09", lastLogin: "2026-08-30 14:22" },
  { id: 8, username: "d.ghosh", fullName: "Debasish Ghosh", role: "Management", status: "Active", createdDate: "2025-11-02", lastLogin: "2026-09-17 18:05" },
];

// ---------------------------------------------------------------- helpers
const deptNames = departments.map((d) => d.name);
const statusesByStage: Record<number, RollStatus[]> = {
  1: ["In Production"],
  2: ["In Production"],
  3: ["In Production", "Hold"],
  4: ["In Production"],
  5: ["Pending QC", "QC Pass", "QC Fail", "Rework", "Hold"],
  6: ["QC Pass", "Packed"],
  7: ["Packed", "Dispatched"],
};

function pad(n: number, w: number) {
  return String(n).padStart(w, "0");
}

function epcFor(i: number) {
  return `E280 6894 0000 40${pad(1000 + i, 4)} A${pad(i % 256, 2)}`.toUpperCase();
}

function ts(day: number, hour: number, min: number) {
  // September 2026 dates, day 1..18
  return `2026-09-${pad(day, 2)} ${pad(hour, 2)}:${pad(min, 2)}`;
}

// ---------------------------------------------------------------- rolls
const machines = ["Loom W-01", "Loom W-02", "Loom W-03", "Loom W-04", "Printer P-01", "Laminator L-01"];
const operators = ["Arjun Das", "Prakash Singh", "Rina Mondal"];

export const rolls: FabricRoll[] = [];
export const movements: RollMovement[] = [];

let movementId = 1;
for (let i = 1; i <= 42; i++) {
  // Distribute rolls across the pipeline; later rolls are earlier in the flow
  const stage = i <= 8 ? 7 : i <= 14 ? 6 : i <= 20 ? 5 : i <= 27 ? 4 : i <= 33 ? 3 : i <= 38 ? 2 : 1;
  const dept = deptNames[stage - 1]!;
  const statusPool = statusesByStage[stage]!;
  const status = statusPool[i % statusPool.length];
  const dayCreated = Math.max(1, 18 - stage * 2 - (i % 3));
  const rollId = i;

  const roll: FabricRoll = {
    id: rollId,
    rollNumber: `FR-26-${pad(1000 + i, 4)}`,
    rfidEpc: epcFor(i),
    batchNo: `B-26${pad(40 + (i % 9), 3)}`,
    gsm: 60 + ((i * 7) % 120),
    width: 120 + ((i * 13) % 100),
    length: 800 + ((i * 97) % 1400),
    weight: 45 + ((i * 11) % 160),
    machine: machines[i % 4]!,
    operator: operators[i % operators.length]!,
    productionDate: `2026-09-${pad(dayCreated, 2)}`,
    currentDepartment: dept,
    currentStatus: status,
    location: `${dept} Zone ${String.fromCharCode(65 + (i % 3))}`,
    lastScanTime: ts(Math.min(18, dayCreated + stage), 6 + (i % 12), (i * 7) % 60),
  };
  rolls.push(roll);

  // movement history: one record per completed stage transition
  for (let s = 1; s <= stage; s++) {
    const from = s === 1 ? "—" : deptNames[s - 2]!;
    const to = deptNames[s - 1]!;
    movements.push({
      id: movementId++,
      rollId,
      sourceDept: from,
      destinationDept: to,
      status: (s === stage ? status : s === 5 ? "Pending QC" : "In Production") as string,
      user: s === 1 ? roll.operator : users[1 + (i % 2)]!.fullName,
      timestamp: ts(Math.min(18, dayCreated + s), 6 + ((i + s) % 12), (i * 13 + s * 7) % 60),
      device: s === 1 ? `HH-0${(i % 6) + 1}` : i % 3 === 0 ? `GATE-${s === 7 ? "DSP" : deptNames[s - 1]!.slice(0, 3).toUpperCase()}-01` : `HH-0${((i + s) % 6) + 1}`,
      machine: s === 1 ? roll.machine : "—",
      remarks: s === 1 ? "Roll created" : s === 5 ? "Sent for inspection" : "Stage transfer",
      viaGate: i % 3 === 0 && s > 1 ? `Gate ${deptNames[s - 1]} ${i % 2 === 0 ? "Entry" : "Exit"}` : undefined,
    });
  }
}

// ---------------------------------------------------------------- rfid tags
export const rfidTags: RFIDTag[] = rolls.map((r, idx) => ({
  id: idx + 1,
  epc: r.rfidEpc,
  status: idx === 40 ? "Damaged" : idx === 41 ? "Replaced" : "Active",
  assignedRollId: r.id,
  registeredDate: r.productionDate,
}));
// unassigned inventory tags
for (let i = 43; i <= 55; i++) {
  rfidTags.push({
    id: i,
    epc: epcFor(i),
    status: i > 52 ? "Inactive" : "Active",
    assignedRollId: null,
    registeredDate: "2026-09-01",
  });
}

// ---------------------------------------------------------------- audit logs
export const auditLogs: AuditLog[] = [
  { id: 1, user: "Rajesh Verma", action: "Login", detail: "Web session started", timestamp: "2026-09-18 06:42", deviceId: "WEB-CHROME" },
  { id: 2, user: "Arjun Das", action: "Login", detail: "Handheld login HH-03", timestamp: "2026-09-18 08:03", deviceId: "HH-03" },
  { id: 3, user: "Arjun Das", action: "Roll Creation", detail: "Created roll FR-26-1042 (Weaving)", timestamp: "2026-09-18 08:20", deviceId: "HH-03" },
  { id: 4, user: "Suresh Iyer", action: "Roll Movement", detail: "FR-26-1031 Lamination → Cutting", timestamp: "2026-09-18 08:47", deviceId: "HH-01" },
  { id: 5, user: "Mina Khatun", action: "Status Change", detail: "FR-26-1017 set to QC Fail", timestamp: "2026-09-18 09:05", deviceId: "HH-02" },
  { id: 6, user: "Prakash Singh", action: "Roll Movement", detail: "FR-26-1025 Cutting → Quality Check", timestamp: "2026-09-18 09:31", deviceId: "HH-04" },
  { id: 7, user: "Rajesh Verma", action: "RFID Replacement", detail: "Re-mapped tag on FR-26-1041", timestamp: "2026-09-18 09:58", deviceId: "WEB-CHROME" },
  { id: 8, user: "Rina Mondal", action: "Roll Movement", detail: "FR-26-1013 Packing → Dispatch", timestamp: "2026-09-18 10:12", deviceId: "GATE-DSP-01" },
  { id: 9, user: "Suresh Iyer", action: "User Management", detail: "Disabled user k.bose", timestamp: "2026-09-18 10:20", deviceId: "WEB-EDGE" },
  { id: 10, user: "Debasish Ghosh", action: "Logout", detail: "Web session ended", timestamp: "2026-09-17 18:05", deviceId: "WEB-SAFARI" },
  { id: 11, user: "Mina Khatun", action: "Status Change", detail: "FR-26-1019 set to Rework", timestamp: "2026-09-17 16:44", deviceId: "HH-02" },
  { id: 12, user: "Arjun Das", action: "Roll Creation", detail: "Created roll FR-26-1041 (Weaving)", timestamp: "2026-09-17 15:10", deviceId: "HH-03" },
];

// ---------------------------------------------------------------- gates
export const gates: Gate[] = [
  { id: "GATE-PRT-01", name: "Gate Printing Entry", department: "Printing", direction: "Entry", readerIp: "10.10.2.21", readZone: "Zone A — Conveyor 1", sensitivity: -65, dedupeIntervalSec: 30, status: "Online" },
  { id: "GATE-LAM-01", name: "Gate Lamination Entry", department: "Lamination", direction: "Entry", readerIp: "10.10.3.21", readZone: "Zone B — Conveyor 2", sensitivity: -65, dedupeIntervalSec: 30, status: "Online" },
  { id: "GATE-CUT-01", name: "Gate Cutting Entry", department: "Cutting", direction: "Entry", readerIp: "10.10.4.21", readZone: "Zone C — Roller Bed", sensitivity: -60, dedupeIntervalSec: 45, status: "Online" },
  { id: "GATE-PCK-01", name: "Gate Packing Entry", department: "Packing", direction: "Entry", readerIp: "10.10.6.21", readZone: "Zone D — Packing Line", sensitivity: -70, dedupeIntervalSec: 30, status: "Offline" },
  { id: "GATE-DSP-01", name: "Gate Dispatch Exit", department: "Dispatch", direction: "Exit", readerIp: "10.10.7.21", readZone: "Zone E — Dock Door 1", sensitivity: -60, dedupeIntervalSec: 60, status: "Online" },
];

export const gateEvents: GateEvent[] = [
  { id: 1, gate: "GATE-DSP-01", epc: rolls[12]!.rfidEpc, rollNumber: rolls[12]!.rollNumber, direction: "Exit", signalStrength: -58, timestamp: "2026-09-18 10:12:04", result: "Movement Created" },
  { id: 2, gate: "GATE-DSP-01", epc: rolls[12]!.rfidEpc, rollNumber: rolls[12]!.rollNumber, direction: "Exit", signalStrength: -59, timestamp: "2026-09-18 10:12:11", result: "Duplicate Ignored" },
  { id: 3, gate: "GATE-CUT-01", epc: rolls[24]!.rfidEpc, rollNumber: rolls[24]!.rollNumber, direction: "Entry", signalStrength: -62, timestamp: "2026-09-18 10:05:48", result: "Movement Created" },
  { id: 4, gate: "GATE-LAM-01", epc: "E280 6894 0000 40999 FF", rollNumber: null, direction: "Entry", signalStrength: -71, timestamp: "2026-09-18 09:52:17", result: "Unknown Tag Alert" },
  { id: 5, gate: "GATE-PRT-01", epc: rolls[35]!.rfidEpc, rollNumber: rolls[35]!.rollNumber, direction: "Entry", signalStrength: -64, timestamp: "2026-09-18 09:40:02", result: "Movement Created" },
  { id: 6, gate: "GATE-CUT-01", epc: rolls[22]!.rfidEpc, rollNumber: rolls[22]!.rollNumber, direction: "Entry", signalStrength: -61, timestamp: "2026-09-18 09:18:33", result: "Movement Created" },
];

// ---------------------------------------------------------------- charts
export const productionTrend = [
  { date: "Sep 12", rolls: 312 },
  { date: "Sep 13", rolls: 388 },
  { date: "Sep 14", rolls: 402 },
  { date: "Sep 15", rolls: 460 },
  { date: "Sep 16", rolls: 441 },
  { date: "Sep 17", rolls: 512 },
  { date: "Sep 18", rolls: 236 },
];

export const dailyDispatch = [
  { date: "Sep 12", dispatched: 148 },
  { date: "Sep 13", dispatched: 171 },
  { date: "Sep 14", dispatched: 190 },
  { date: "Sep 15", dispatched: 165 },
  { date: "Sep 16", dispatched: 210 },
  { date: "Sep 17", dispatched: 224 },
  { date: "Sep 18", dispatched: 96 },
];

export const userActivity = [
  { user: "A. Das", scans: 214 },
  { user: "P. Singh", scans: 187 },
  { user: "R. Mondal", scans: 163 },
  { user: "S. Iyer", scans: 96 },
  { user: "M. Khatun", scans: 88 },
];

// ---------------------------------------------------------------- derived KPIs
export function getKpis() {
  const total = 2184; // lifetime incl. archived
  const active = rolls.filter((r) => r.currentStatus !== "Dispatched").length + 380;
  const today = productionTrend[productionTrend.length - 1]!.rolls;
  const delayed = rolls.filter((r) => ["Hold", "Rework", "QC Fail"].includes(r.currentStatus)).length + 14;
  const pendingQc = rolls.filter((r) => r.currentStatus === "Pending QC").length + 22;
  const dispatched = dailyDispatch[dailyDispatch.length - 1]!.dispatched;
  return { total, active, today, delayed, pendingQc, dispatched };
}

export function rollsByDepartment() {
  return departments.map((d) => ({
    department: d.code,
    name: d.name,
    rolls: rolls.filter((r) => r.currentDepartment === d.name).length + ((d.sequenceNo * 17) % 60),
  }));
}

export function qcStatusBreakdown() {
  const base = [
    { name: "QC Pass", value: 0 },
    { name: "Pending QC", value: 0 },
    { name: "QC Fail", value: 0 },
    { name: "Rework", value: 0 },
    { name: "Hold", value: 0 },
  ];
  for (const r of rolls) {
    const b = base.find((x) => x.name === (r.currentStatus as string));
    if (b) b.value++;
  }
  base[0]!.value += 260;
  base[1]!.value += 22;
  base[2]!.value += 6;
  base[3]!.value += 5;
  base[4]!.value += 3;
  return base;
}

export function movementsForRoll(rollId: number) {
  return movements
    .filter((m) => m.rollId === rollId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
