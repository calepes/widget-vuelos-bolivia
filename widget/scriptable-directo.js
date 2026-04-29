// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane-departure;

const HOURS_AHEAD = 12;
const MAX_FLIGHTS = 15;
const AIRPORT_PARAM = (args.widgetParameter || "VVI").toUpperCase();

const AIRPORTS = {
  VVI: { name: "Viru Viru (VVI)", city: "Santa Cruz", query: "Viru%20Viru" },
  LPB: { name: "El Alto (LPB)", city: "La Paz", query: "El%20Alto" },
  CBB: { name: "Cochabamba (CBB)", city: "Cochabamba", query: "Jorge%20Wilstermann" },
  TJA: { name: "Tarija (TJA)", city: "Tarija", query: "Tarija" },
  SRE: { name: "Sucre (SRE)", city: "Sucre", query: "Sucre" },
  ORU: { name: "Oruro (ORU)", city: "Oruro", query: "Oruro" },
  UYU: { name: "Uyuni (UYU)", city: "Uyuni", query: "Uyuni" },
  CIJ: { name: "Cobija (CIJ)", city: "Cobija", query: "Cobija" },
  RIB: { name: "Riberalta (RIB)", city: "Riberalta", query: "Riberalta" },
  RBQ: { name: "Rurrenabaque (RBQ)", city: "Rurrenabaque", query: "Rurrenabaque" },
  TDD: { name: "Trinidad (TDD)", city: "Trinidad", query: "Trinidad" },
  GYA: { name: "Guayaramerín (GYA)", city: "Guayaramerín", query: "Guayaramerin" }
};

const AIRPORT = AIRPORTS[AIRPORT_PARAM] || AIRPORTS.VVI;

const PROXY = "https://aeropuertos-proxy.carlos-cb4.workers.dev/?url=";
const BASE_ITIN = `https://fids.naabol.gob.bo/Fids/itin/vuelos?aero=${AIRPORT.query}&tipo=S`;
const BASE_OPS = `https://fids.naabol.gob.bo/Fids/operativo/vuelos?aero=${AIRPORT.query}&tipo=S`;
const URL_ITIN = PROXY + encodeURIComponent(BASE_ITIN);
const URL_OPS = PROXY + encodeURIComponent(BASE_OPS);

const BOARD_BG = new Color("#0A0A0A");
const CARD_BG = new Color("#1C1C1E");
const HEADER_COLOR = new Color("#FFFFFF");
const COL_HEADER_COLOR = new Color("#CCCCCC");
const TEXT_COLOR = new Color("#FFD600");
const PRE_COLOR = new Color("#FFD600");
const EMB_COLOR = new Color("#4CAF50");
const DEM_COLOR = new Color("#FF3D00");
const CAN_COLOR = new Color("#FF3D00");
const OK_COLOR = new Color("#FFFFFF");
const UPD_COLOR = new Color("#FF9800");
const MUTED_COLOR = new Color("#555555");

const AIRLINE_IATA = {
  "BOLIVIANA DE AVIACION": "OB", "BOLIVIANA DE AVIACIÓN": "OB", "BOA": "OB",
  "ECOJET": "EO", "ECO JET": "EO", "AMASZONAS": "Z8",
  "LATAM": "LA", "LATAM AIRLINES": "LA", "LATAM AIRLINES GROUP": "LA",
  "LAN": "LA", "LAN AIRLINES": "LA", "SKY": "H2",
  "AVIANCA": "AV", "COPA": "CM", "AMERICAN AIRLINES": "AA",
  "UNITED": "UA", "IBERIA": "IB", "FLYBONDI": "FU"
};

const AIRLINE_BACKUP = {
  "PARANAIR": "PZ", "PARANAIR S.A.": "PZ", "PARANA AIR": "PZ",
  "GOL": "G3", "GOL LINHAS AEREAS": "G3", "GOL LINHAS AÉREAS": "G3",
  "MINERA SAN CRISTOBAL": "MSC", "MINERA SAN CRISTÓBAL": "MSC",
  "AIR EUROPA": "UX", "AIR EUROPA LINEAS AEREAS": "UX", "AIR EUROPA LÍNEAS AÉREAS": "UX"
};

function airlineCode(name) {
  const key = (name || "").toUpperCase().trim();
  return AIRLINE_IATA[key] || AIRLINE_BACKUP[key] || null;
}

const DEST_IATA = {
  "SANTA CRUZ": "VVI", "VIRU VIRU": "VVI", "LA PAZ": "LPB", "EL ALTO": "LPB",
  "COCHABAMBA": "CBB", "SUCRE": "SRE", "TARIJA": "TJA", "ORURO": "ORU",
  "UYUNI": "UYU", "COBIJA": "CIJ", "RIBERALTA": "RIB", "RURRENABAQUE": "RBQ",
  "TRINIDAD": "TDD", "GUAYARAMERIN": "GYA", "GUAYARAMERÍN": "GYA",
  "LIMA": "LIM", "CUSCO": "CUZ", "CUZCO": "CUZ",
  "SANTIAGO": "SCL", "SANTIAGO DE CHILE": "SCL", "IQUIQUE": "IQQ",
  "BUENOS AIRES": "EZE", "SAO PAULO": "GRU", "SÃO PAULO": "GRU",
  "ASUNCION": "ASU", "ASUNCIÓN": "ASU", "PANAMA": "PTY", "PANAMÁ": "PTY",
  "MIAMI": "MIA", "MADRID": "MAD", "WASHINGTON": "IAD",
  "BOGOTA": "BOG", "BOGOTÁ": "BOG", "PUNTA DEL ESTE": "PDP",
  "TUCUMAN": "TUC", "TUCUMÁN": "TUC", "CUIABA": "CGB", "CUIABÁ": "CGB"
};

function normalizeHHMM(x) {
  const m = String(x || "").match(/(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null;
}

function todayWithHHMM(x) {
  const h = normalizeHHMM(x);
  if (!h) return null;
  const [hh, mm] = h.split(":").map(Number);
  const now = new Date();
  const d = new Date(now);
  d.setHours(hh, mm, 0, 0);
  if (d < now) d.setDate(d.getDate() + 1);
  return d;
}

function hhmm(d) {
  return d
    ? d.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "     ";
}

function destinationIATA(route) {
  if (!route) return "--- ";
  const parts = route.split("-").map(x => x.trim()).filter(Boolean);
  const first = parts[0].toUpperCase();
  const extra = parts.length - 1;
  const iata = DEST_IATA[first] || "---";
  return extra > 0 ? `${iata}+` : `${iata} `;
}

function statusInfo(obs) {
  const s = (obs || "").toUpperCase();
  if (s.includes("PRE")) return { text: "PRE", preBoarding: true };
  if (s.includes("EMBAR") || s.includes("ABORD")) return { text: "EMB", boarding: true };
  if (s.includes("DEMOR") || s.includes("DELAY")) return { text: "DEM", delayed: true };
  if (s.includes("CANCEL")) return { text: "CAN", canceled: true };
  return { text: "OK" };
}

function getHoraReal(op, f) {
  return f?.HORA_REAL || op?.HORA_REAL_SALIDA || op?.HORA_SALIDA_REAL || null;
}

async function load(url) {
  try {
    const r = new Request(url);
    r.timeoutInterval = 15;
    return await r.loadJSON();
  } catch {
    return [];
  }
}

const itin = await load(URL_ITIN);
const ops = await load(URL_OPS);

const opsMap = {};
for (const o of ops) {
  const code = airlineCode(o.NOMBRE_AEROLINEA);
  const num = String(o.NRO_VUELO || "").trim();
  const key = code ? `${code}${num}` : num;
  opsMap[key] = o;
}

const now = Date.now();
const max = now + HOURS_AHEAD * 3600 * 1000;

const seenFlights = new Set();
const flightsFromItin = (itin || [])
  .map(f => {
    const prog = todayWithHHMM(f.HORA_PROGRAMADA || f.HORA_ESTIMADA);
    if (!prog) return null;
    const code = airlineCode(f.NOMBRE_AEROLINEA);
    const num = String(f.NRO_VUELO || "").trim();
    const vuelo = code ? `${code}${num}` : num;
    seenFlights.add(vuelo);
    const op = opsMap[vuelo] || {};
    const est = statusInfo(op.ESTADO || op.COMENTARIOS || f.OBSERVACION);
    return {
      prog, real: todayWithHHMM(getHoraReal(op, f)),
      ts: prog.getTime(), vuelo, est,
      dest: destinationIATA(f.RUTA0 || f.RUTA || op.DESTINO)
    };
  })
  .filter(f => {
    if (!f) return false;
    const active = f.est.delayed || f.est.preBoarding || f.est.boarding;
    if (active) return true;
    return f.ts >= now && f.ts <= max;
  });

const flightsFromOps = (ops || [])
  .map(o => {
    const code = airlineCode(o.NOMBRE_AEROLINEA);
    const num = String(o.NRO_VUELO || "").trim();
    const vuelo = code ? `${code}${num}` : num;
    if (seenFlights.has(vuelo)) return null;
    const prog = todayWithHHMM(o.HORA_ESTIMADA || o.HORA_PROGRAMADA);
    if (!prog) return null;
    const est = statusInfo(o.ESTADO || o.COMENTARIOS);
    return {
      prog, real: todayWithHHMM(o.HORA_REAL || o.HORA_REAL_SALIDA),
      ts: prog.getTime(), vuelo, est,
      dest: destinationIATA(o.DESTINO || o.RUTA)
    };
  })
  .filter(f => {
    if (!f) return false;
    const active = f.est.delayed || f.est.preBoarding || f.est.boarding;
    if (active) return true;
    return f.ts >= now && f.ts <= max;
  });

const flights = [...flightsFromItin, ...flightsFromOps]
  .sort((a, b) => {
    const tA = a.real ? a.real.getTime() : a.ts;
    const tB = b.real ? b.real.getTime() : b.ts;
    return tA - tB;
  })
  .slice(0, MAX_FLIGHTS);

const w = new ListWidget();
w.backgroundColor = BOARD_BG;
w.setPadding(10, 12, 8, 12);

const hdr = w.addStack();
hdr.layoutHorizontally();
hdr.centerAlignContent();
const sym = SFSymbol.named("airplane.departure");
sym.applyBoldWeight();
const icon = hdr.addImage(sym.image);
icon.imageSize = new Size(22, 22);
icon.tintColor = HEADER_COLOR;
hdr.addSpacer(6);
const title = hdr.addText(`DEPARTURES - ${AIRPORT_PARAM}`);
title.font = Font.boldMonospacedSystemFont(16);
title.textColor = HEADER_COLOR;
title.lineLimit = 1;
hdr.addSpacer();
const clock = hdr.addText(hhmm(new Date()));
clock.font = Font.boldMonospacedSystemFont(16);
clock.textColor = new Color("#4CAF50");

w.addSpacer(10);

const CHAR_W = 14;
const FLAP_H = 20;
const FONT_SZ = 12;
const SEP_CARDS = 1;
const COLON_W = 6;

function addCard(parent, ch, color) {
  const isColon = ch === ":";
  const flap = parent.addStack();
  flap.size = new Size(isColon ? COLON_W : CHAR_W, FLAP_H);
  flap.backgroundColor = CARD_BG;
  flap.cornerRadius = 2;
  flap.centerAlignContent();
  if (ch && ch !== " ") {
    const t = flap.addText(ch);
    t.font = Font.boldMonospacedSystemFont(FONT_SZ);
    t.textColor = color;
  }
}

function addBoardRow(parent, segments) {
  const row = parent.addStack();
  row.layoutHorizontally();
  row.spacing = 1;
  segments.forEach((seg, i) => {
    if (i > 0) {
      for (let s = 0; s < SEP_CARDS; s++) addCard(row, " ", TEXT_COLOR);
    }
    for (const ch of seg.text) addCard(row, ch, seg.color);
  });
  addCard(row, " ", TEXT_COLOR);
}

const COL_CHARS = [5, 4, 6, 3];
const COL_COLONS = [1, 0, 0, 0];
const COL_LABELS = ["TIME", "DST", "FLIGHT", "RMKS"];

function colWidth(i) {
  const normal = COL_CHARS[i] - COL_COLONS[i];
  const colons = COL_COLONS[i];
  return normal * CHAR_W + colons * COLON_W + (COL_CHARS[i] - 1);
}

const th = w.addStack();
th.layoutHorizontally();
th.spacing = 1;
COL_LABELS.forEach((label, i) => {
  if (i > 0) {
    const sepW = SEP_CARDS * CHAR_W + (SEP_CARDS - 1);
    th.addSpacer(sepW + 1);
  }
  const s = th.addStack();
  s.size = new Size(colWidth(i), 0);
  s.centerAlignContent();
  const tx = s.addText(label);
  tx.font = Font.boldMonospacedSystemFont(8);
  tx.textColor = COL_HEADER_COLOR;
});

w.addSpacer(6);

if (flights.length === 0) {
  w.addSpacer(8);
  const noData = itin.length === 0 && ops.length === 0;
  const msg = w.addText(noData ? "⚠ Sin conexión a NAABOL" : "No hay vuelos programados");
  msg.font = Font.mediumSystemFont(13);
  msg.textColor = noData ? DEM_COLOR : MUTED_COLOR;
  msg.centerAlignText();
}

for (let i = 0; i < flights.length; i++) {
  const f = flights[i];
  const hasReal = !!f.real;
  const timeStr = hasReal ? hhmm(f.real) : hhmm(f.prog);
  const timeColor = hasReal ? UPD_COLOR : TEXT_COLOR;
  let estColor;
  if (f.est.preBoarding) estColor = PRE_COLOR;
  else if (f.est.boarding) estColor = EMB_COLOR;
  else if (f.est.delayed) estColor = DEM_COLOR;
  else if (f.est.canceled) estColor = CAN_COLOR;
  else estColor = OK_COLOR;
  addBoardRow(w, [
    { text: timeStr, color: timeColor },
    { text: f.dest.padEnd(4).slice(0, 4), color: TEXT_COLOR },
    { text: f.vuelo.padEnd(6).slice(0, 6), color: TEXT_COLOR },
    { text: f.est.text.padEnd(3).slice(0, 3), color: estColor }
  ]);
  w.addSpacer(2);
}

w.addSpacer();
Script.setWidget(w);
Script.complete();
