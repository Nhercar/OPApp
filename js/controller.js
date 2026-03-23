import { ui } from "./dom.js";
import { START_ERROR_TEXT, START_LOADING_TEXT, START_READY_TEXT } from "./config.js";
import { state, resetearEstadoTest } from "./state.js";
import { cargarPreguntasDesdeFuente } from "./data.js";
import {
  deshabilitarOpciones,
  mostrarQuiz,
  ocultarResumen,
  ocultarBotonSiguiente,
  renderBotonesAccionFinal,
  renderErrorInicio,
  renderFinal,
  renderInicioCargando,
  renderInicioListo,
  renderPregunta,
  renderRevisionPregunta,
  renderResumenFinal,
  setEstado,
  setPuntuacion,
  revelarCorrecta,
  limpiarAccionPregunta,
  mostrarInicio,
  actualizarBotonSiguiente,
} from "./render.js";

const renderFinalCompleto = () => {
  renderFinal({
    puntuacion: state.puntuacion,
    totalPreguntas: state.preguntas.length,
  });

  renderBotonesAccionFinal({
    onRestart: iniciarTest,
    onBackHome: volverAlInicio,
  });

  renderResumenFinal({
    respuestas: state.respuestas,
    onReview: revisarPreguntaPorOrden,
  });
};

const avanzarPregunta = () => {
  state.preguntaActual += 1;

  if (state.preguntaActual >= state.preguntas.length) {
    renderFinalCompleto();
    return;
  }

  renderPreguntaActual();
};

const registrarOmitidaActual = () => {
  const pregunta = state.preguntas[state.preguntaActual];

  state.respuestas[state.preguntaActual] = {
    questionId: pregunta.id,
    orderIndex: state.preguntaActual,
    selectedOptionIndex: null,
    isCorrect: false,
    omitted: true,
  };
};

const avanzarConBoton = () => {
  if (state.preguntaActual >= state.preguntas.length) {
    return;
  }

  if (!state.respuestas[state.preguntaActual]) {
    registrarOmitidaActual();
  }

  state.bloqueado = false;
  avanzarPregunta();
};

const manejarRespuesta = (indiceSeleccionado, botonSeleccionado) => {
  // Protege la logica de eventos para que una pregunta solo se evalue una vez.
  if (state.bloqueado) {
    return;
  }

  state.bloqueado = true;

  const pregunta = state.preguntas[state.preguntaActual];
  const esCorrecta = indiceSeleccionado === pregunta.correcta;

  state.respuestas[state.preguntaActual] = {
    questionId: pregunta.id,
    orderIndex: state.preguntaActual,
    selectedOptionIndex: indiceSeleccionado,
    isCorrect: esCorrecta,
    omitted: false,
  };

  if (esCorrecta) {
    state.puntuacion += 1;
    botonSeleccionado.classList.add("correcto");
  } else {
    botonSeleccionado.classList.add("incorrecto");
    revelarCorrecta(pregunta.correcta);
  }

  setPuntuacion(state.puntuacion);
  deshabilitarOpciones();
  actualizarBotonSiguiente(true);
};

const renderPreguntaActual = () => {
  const pregunta = state.preguntas[state.preguntaActual];

  renderPregunta({
    pregunta,
    preguntaActual: state.preguntaActual,
    totalPreguntas: state.preguntas.length,
    onOptionClick: manejarRespuesta,
  });
};

const revisarPreguntaPorOrden = (orderIndex) => {
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
    onRestart: iniciarTest,
    onBackHome: volverAlInicio,
  });
};

const iniciarTest = () => {
  if (!state.cargado) {
    return;
  }

  resetearEstadoTest();
  setPuntuacion(state.puntuacion);
  mostrarQuiz();
  renderPreguntaActual();
};

const volverAlInicio = () => {
  resetearEstadoTest();
  setPuntuacion(state.puntuacion);
  ui.pregunta.textContent = "Preparando quiz...";
  ui.opciones.innerHTML = "";
  limpiarAccionPregunta();
  ocultarResumen();
  ocultarBotonSiguiente();
  setEstado(state.cargado ? "Listo para iniciar" : "Error de carga");
  mostrarInicio();
};

const cargarPreguntas = async () => {
  renderInicioCargando(START_LOADING_TEXT);

  try {
    const data = await cargarPreguntasDesdeFuente();

    state.preguntas = data;
    state.cargado = true;
    resetearEstadoTest();
    renderInicioListo(START_READY_TEXT);
  } catch (error) {
    console.error("No fue posible cargar el quiz:", error);
    state.cargado = false;
    renderErrorInicio(START_ERROR_TEXT);
  }
};

export const initQuizApp = () => {
  ui.iniciarBtn.addEventListener("click", iniciarTest);
  ui.siguienteBtn.addEventListener("click", avanzarConBoton);
  cargarPreguntas();
};
