export {
  setEstado,
  setPuntuacion,
  mostrarInicio,
  mostrarQuiz,
  limpiarAccionPregunta,
  ocultarResumen,
  deshabilitarOpciones,
  marcarSeleccionTemporal,
  mostrarBotonSiguiente,
  ocultarBotonSiguiente,
  revelarCorrecta,
  actualizarBotonSiguiente,
  renderErrorInicio,
  renderInicioCargando,
  renderInicioListo,
} from "./renderUI.js";

export { renderPregunta } from "./renderQuestion.js";

export {
  renderFinal,
  renderBotonesAccionFinal,
  renderResumenFinal,
  renderRevisionPregunta,
} from "./renderResults.js";
