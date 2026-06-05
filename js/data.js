import { QUIZ_CONFIG } from "./config.js";

export const cargarPreguntasDesdeFuente = async (dataUrl = QUIZ_CONFIG.dataUrlEnfermeria) => {
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Formato de preguntas invalido");
  }

  return data;
};
