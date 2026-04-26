import { ui } from "../dom.js";

const FALLADAS_STORAGE_KEY = "preguntasFalladas";
const VISTAS_STORAGE_KEY = "preguntasVistas";

export const leerPreguntasFalladas = () => {
  try {
    const raw = localStorage.getItem(FALLADAS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const guardarPreguntasFalladas = (ids) => {
  localStorage.setItem(FALLADAS_STORAGE_KEY, JSON.stringify(ids));
};

export const leerPreguntasVistas = () => {
  try {
    const raw = localStorage.getItem(VISTAS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const guardarPreguntasVistas = (ids) => {
  localStorage.setItem(VISTAS_STORAGE_KEY, JSON.stringify(ids));
};

export const registrarPreguntasVistas = (idsPreguntas) => {
  const actuales = new Set(leerPreguntasVistas().map(String));
  idsPreguntas.forEach((id) => actuales.add(String(id)));
  guardarPreguntasVistas(Array.from(actuales));
};

export const actualizarIndicadorVistasInicio = (totalBanco = 0) => {
  const totalVistas = leerPreguntasVistas().length;
  const porcentaje = totalBanco > 0 ? Math.round((totalVistas / totalBanco) * 100) : 0;
  ui.porcentajeVistas.textContent = `Preguntas vistas: ${porcentaje}% (${totalVistas}/${totalBanco})`;
};

export const registrarPreguntaFallada = (preguntaId) => {
  const actuales = leerPreguntasFalladas().map(String);
  const id = String(preguntaId);

  if (!actuales.includes(id)) {
    actuales.push(id);
    guardarPreguntasFalladas(actuales);
  }
};

export const quitarPreguntaDeFalladas = (preguntaId) => {
  const id = String(preguntaId);
  const filtradas = leerPreguntasFalladas().map(String).filter((x) => x !== id);
  guardarPreguntasFalladas(filtradas);
};

export const actualizarLabelRepasoInicio = () => {
  const totalFalladas = leerPreguntasFalladas().length;
  ui.repasarFallosBtn.textContent = `Repasar Fallos (${totalFalladas})`;
};

export const sincronizarResultadoEnStorage = (preguntaId, esCorrecta) => {
  if (esCorrecta) {
    quitarPreguntaDeFalladas(preguntaId);
  } else {
    registrarPreguntaFallada(preguntaId);
  }

  actualizarLabelRepasoInicio();
};
