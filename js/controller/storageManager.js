import { ui } from "../dom.js";

const FALLADAS_STORAGE_KEY = "preguntasFalladas";

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
