// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: plane-departure;

const REPO = "calepes/Aeropuertos-Bolivia";
const BRANCH = "main";
const FILE = "widget/widget-vuelos-naabol.js";
const RAW_URL = "https://raw.githubusercontent.com/" + REPO + "/" + BRANCH + "/" + FILE;

const SCRIPT_NAME = "Vuelos-NAABOL-Widget";
const fm = FileManager.iCloud();
const scriptPath = fm.joinPath(fm.documentsDirectory(), SCRIPT_NAME + ".js");

// 1. Descargar widget desde GitHub y guardarlo como script
try {
  const req = new Request(RAW_URL);
  req.timeoutInterval = 10;
  const resp = await req.loadString();
  if (resp && resp.length > 100 && !resp.includes('"message"')) {
    fm.writeString(scriptPath, resp);
    console.log("Widget actualizado desde GitHub");
  } else {
    console.log("Respuesta invalida, usando version local");
  }
} catch (e) {
  console.log("Sin conexion: " + e.message);
}

// 2. Ejecutar widget guardado
if (fm.fileExists(scriptPath)) {
  if (fm.isFileStoredIniCloud(scriptPath) && !fm.isFileDownloaded(scriptPath)) {
    await fm.downloadFileFromiCloud(scriptPath);
  }
  importModule(SCRIPT_NAME);
} else {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0A0A0A");
  const msg = w.addText("Ejecuta primero desde la app");
  msg.font = Font.mediumSystemFont(13);
  msg.textColor = new Color("#FF3D00");
  msg.centerAlignText();
  Script.setWidget(w);
  Script.complete();
}
