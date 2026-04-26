import { ui } from "../dom.js";
import { state, resetearEstadoTest } from "../state.js";

// Importar render functions directamente para evitar ciclos
import { renderPregunta } from "../render/renderQuestion.js";
import {
  renderFinal,
  renderBotonesAccionFinal,
  renderResumenFinal,
  renderRevisionPregunta,
} from "../render/renderResults.js";
import {
  setPuntuacion,
  mostrarQuiz,
  ocultarBotonSiguiente,
  setEstado,
  mostrarInicio,
  limpiarAccionPregunta,
  ocultarResumen,
} from "../render/renderUI.js";

import {
  leerPreguntasFalladas,
  actualizarLabelRepasoInicio,
  registrarPreguntasVistas,
  actualizarIndicadorVistasInicio,
} from "./storageManager.js";
import { validarRespuestaModoTest, registrarOmitidaActual, manejarRespuesta } from "./answerValidator.js";

const construirLabelReintento = (totalFalladasStorage) =>
  `Realizar preguntas fallidas (${totalFalladasStorage})`;

export const obtenerPreguntasFallidasDelIntento = () => {
  const fallidasIds = new Set(
    state.respuestas.filter((respuesta) => !respuesta.isCorrect).map((respuesta) => respuesta.questionId)
  );

  return state.preguntas.filter((pregunta) => fallidasIds.has(pregunta.id));
};

export const avanzarPregunta = () => {
  state.preguntaActual += 1;

  if (state.preguntaActual >= state.preguntas.length) {
    renderFinalCompleto();
    return;
  }

  renderPreguntaActual();
};

export const renderPreguntaActual = () => {
  const pregunta = state.preguntas[state.preguntaActual];

  renderPregunta({
    pregunta,
    preguntaActual: state.preguntaActual,
    totalPreguntas: state.preguntas.length,
    onOptionClick: manejarRespuesta,
    modoTest: state.modoTest,
  });
};

export const renderFinalCompleto = () => {
  const totalFalladasStorage = leerPreguntasFalladas().length;

  renderFinal({
    puntuacion: state.puntuacion,
    totalPreguntas: state.preguntas.length,
  });

  renderBotonesAccionFinal({
    onRetryFailed: realizarPreguntasFallidas,
    onBackHome: volverAlInicio,
    disableRetry: totalFalladasStorage === 0,
    retryLabel:
      totalFalladasStorage > 0
        ? construirLabelReintento(totalFalladasStorage)
        : "Has acertado todas!",
  });

  renderResumenFinal({
    respuestas: state.respuestas,
    onReview: revisarPreguntaPorOrden,
  });
};

export const avanzarConBoton = () => {
  if (state.preguntaActual >= state.preguntas.length) {
    return;
  }

  if (state.modoTest) {
    validarRespuestaModoTest();
    state.seleccionActual = null;
    avanzarPregunta();
    return;
  }

  if (!state.respuestas[state.preguntaActual]) {
    registrarOmitidaActual();
  }

  state.bloqueado = false;
  avanzarPregunta();
};

export const revisarPreguntaPorOrden = (orderIndex) => {
  const registro = state.respuestas.find((respuesta) => respuesta.orderIndex === orderIndex);
  if (!registro) {
    return;
  }

  const pregunta = state.preguntas.find((item) => item.id === registro.questionId);
  if (!pregunta) {
    return;
  }

  renderRevisionPregunta({
    pregunta,
    registro,
    totalPreguntas: state.preguntas.length,
    onRetryFailed: realizarPreguntasFallidas,
    onBackHome: volverAlInicio,
    disableRetry: leerPreguntasFalladas().length === 0,
    retryLabel:
      leerPreguntasFalladas().length > 0
        ? construirLabelReintento(leerPreguntasFalladas().length)
        : "Has acertado todas!",
  });
};

export const realizarPreguntasFallidas = () => {
  const idsFalladas = new Set(leerPreguntasFalladas().map(String));
  const fallidas = state.bancoPreguntas.filter((pregunta) => idsFalladas.has(String(pregunta.id)));

  if (fallidas.length === 0) {
    setEstado("No hay preguntas fallidas pendientes");
    return;
  }

  state.modoTest = ui.modoTestSwitch.checked;
  iniciarIntentoConPreguntas(fallidas);
};

export const iniciarIntentoConPreguntas = (preguntasIntento) => {
  resetearEstadoTest();
  state.preguntas = preguntasIntento;
  registrarPreguntasVistas(state.preguntas.map((pregunta) => pregunta.id));
  setPuntuacion(state.puntuacion);
  mostrarQuiz();

  if (state.preguntas.length === 0) {
    ui.opciones.innerHTML = "";
    ui.pregunta.textContent = "No hay preguntas disponibles para este intento.";
    ocultarBotonSiguiente();
    setEstado("Sin preguntas");
    return;
  }

  renderPreguntaActual();
};

export const volverAlInicio = () => {
  resetearEstadoTest();
  state.modoTest = false;
  ui.modoTestSwitch.checked = false;
  ui.soloNoVistasSwitch.checked = false;
  actualizarLabelRepasoInicio();
  actualizarIndicadorVistasInicio(state.bancoPreguntas.length);
  setPuntuacion(state.puntuacion);
  ui.pregunta.textContent = "Preparando quiz...";
  ui.opciones.innerHTML = "";
  limpiarAccionPregunta();
  ocultarResumen();
  ocultarBotonSiguiente();
  setEstado(state.cargado ? "Listo para iniciar" : "Error de carga");
  mostrarInicio();
};
