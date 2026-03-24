import { ui } from "../dom.js";
import { QUIZ_CONFIG, START_ERROR_TEXT, START_LOADING_TEXT, START_READY_TEXT } from "../config.js";
import { state } from "../state.js";
import { cargarPreguntasDesdeFuente } from "../data.js";
import {
  renderErrorInicio,
  renderInicioCargando,
  renderInicioListo,
} from "../render/renderUI.js";
import { leerPreguntasFalladas, actualizarLabelRepasoInicio } from "./storageManager.js";
import { iniciarIntentoConPreguntas, avanzarConBoton } from "./quizFlow.js";

const mezclarPreguntas = (preguntas) => {
  const copia = [...preguntas];

  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
};

const seleccionarPreguntasAleatorias = (banco, cantidad) => {
  const total = Math.min(cantidad, banco.length);
  return mezclarPreguntas(banco).slice(0, total);
};

export const cargarPreguntas = async () => {
  console.log("🔄 Iniciando carga de preguntas...");
  renderInicioCargando(START_LOADING_TEXT);

  try {
    console.log("📡 Fetching desde:", QUIZ_CONFIG.dataUrl);
    const data = await cargarPreguntasDesdeFuente();
    console.log("✅ Preguntas cargadas:", data.length, "preguntas");

    state.bancoPreguntas = data;
    state.preguntas = [];
    state.cargado = true;
    actualizarLabelRepasoInicio();
    console.log("✅ Estado actualizado, renderizando pantalla lista");
    renderInicioListo(START_READY_TEXT);
  } catch (error) {
    console.error("❌ Error en carga de preguntas:", error);
    state.cargado = false;
    renderErrorInicio(START_ERROR_TEXT);
  }
};

export const iniciarTest = () => {
  if (!state.cargado || state.bancoPreguntas.length === 0) {
    return;
  }

  state.modoTest = ui.modoTestSwitch.checked;

  const preguntasAleatorias = seleccionarPreguntasAleatorias(
    state.bancoPreguntas,
    QUIZ_CONFIG.preguntasPorTest
  );

  iniciarIntentoConPreguntas(preguntasAleatorias);
};

export const iniciarRepasoFallos = () => {
  if (!state.cargado || state.bancoPreguntas.length === 0) {
    return;
  }

  const idsFalladas = new Set(leerPreguntasFalladas().map(String));

  if (idsFalladas.size === 0) {
    alert("¡Genial! No tienes ninguna pregunta fallada pendiente de repasar.");
    return;
  }

  const preguntasFiltradas = state.bancoPreguntas.filter((pregunta) =>
    idsFalladas.has(String(pregunta.id))
  );

  if (preguntasFiltradas.length === 0) {
    alert("¡Genial! No tienes ninguna pregunta fallada pendiente de repasar.");
    return;
  }

  state.modoTest = ui.modoTestSwitch.checked;
  iniciarIntentoConPreguntas(preguntasFiltradas);
};

export const initQuizApp = () => {
  console.log("🚀 Inicializando aplicación de quiz...");
  actualizarLabelRepasoInicio();
  ui.iniciarBtn.addEventListener("click", iniciarTest);
  ui.siguienteBtn.addEventListener("click", avanzarConBoton);
  ui.repasarFallosBtn.addEventListener("click", iniciarRepasoFallos);
  console.log("✅ Event listeners agregados");
  cargarPreguntas();
};
