import { ui } from "./dom.js";
import { QUIZ_CONFIG, START_ERROR_TEXT, START_LOADING_TEXT, START_READY_TEXT } from "./config.js";
import { state, resetearEstadoTest } from "./state.js";
import { cargarPreguntasDesdeFuente } from "./data.js";
import {
  deshabilitarOpciones,
  marcarSeleccionTemporal,
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

const obtenerPreguntasFallidasDelIntento = () => {
  const fallidasIds = new Set(
    state.respuestas.filter((respuesta) => !respuesta.isCorrect).map((respuesta) => respuesta.questionId)
  );

  return state.preguntas.filter((pregunta) => fallidasIds.has(pregunta.id));
};

const iniciarIntentoConPreguntas = (preguntasIntento) => {
  resetearEstadoTest();
  state.preguntas = preguntasIntento;
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

const realizarPreguntasFallidas = () => {
  const fallidas = obtenerPreguntasFallidasDelIntento();

  if (fallidas.length === 0) {
    setEstado("No hay preguntas fallidas en este intento");
    return;
  }

  iniciarIntentoConPreguntas(fallidas);
};

const renderFinalCompleto = () => {
  const tieneFallidas = obtenerPreguntasFallidasDelIntento().length > 0;

  renderFinal({
    puntuacion: state.puntuacion,
    totalPreguntas: state.preguntas.length,
  });

  renderBotonesAccionFinal({
    onRetryFailed: realizarPreguntasFallidas,
    onBackHome: volverAlInicio,
    disableRetry: !tieneFallidas,
    retryLabel: tieneFallidas ? "Realizar preguntas fallidas" : "Has acertado todas!",
    
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

const validarRespuestaModoTest = () => {
  if (state.seleccionActual === null) {
    registrarOmitidaActual();
    return;
  }

  const pregunta = state.preguntas[state.preguntaActual];
  const esCorrecta = state.seleccionActual === pregunta.correcta;

  sincronizarResultadoEnStorage(pregunta.id, esCorrecta);

  state.respuestas[state.preguntaActual] = {
    questionId: pregunta.id,
    orderIndex: state.preguntaActual,
    selectedOptionIndex: state.seleccionActual,
    isCorrect: esCorrecta,
    omitted: false,
  };

  if (esCorrecta) {
    state.puntuacion += 1;
  }
};

const avanzarConBoton = () => {
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

const manejarRespuesta = (indiceSeleccionado, botonSeleccionado) => {
  if (state.modoTest) {
    state.seleccionActual = indiceSeleccionado;
    marcarSeleccionTemporal(indiceSeleccionado);
    actualizarBotonSiguiente(true);
    return;
  }

  // Protege la logica de eventos para que una pregunta solo se evalue una vez.
  if (state.bloqueado) {
    return;
  }

  state.bloqueado = true;

  const pregunta = state.preguntas[state.preguntaActual];
  const esCorrecta = indiceSeleccionado === pregunta.correcta;

  sincronizarResultadoEnStorage(pregunta.id, esCorrecta);

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
    modoTest: state.modoTest,
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
    onRetryFailed: realizarPreguntasFallidas,
    onBackHome: volverAlInicio,
    disableRetry: obtenerPreguntasFallidasDelIntento().length === 0,
  });
};

const iniciarTest = () => {
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

const iniciarRepasoFallos = () => {
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

const FALLADAS_STORAGE_KEY = "preguntasFalladas";

const leerPreguntasFalladas = () => {
  try {
    const raw = localStorage.getItem(FALLADAS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const guardarPreguntasFalladas = (ids) => {
  localStorage.setItem(FALLADAS_STORAGE_KEY, JSON.stringify(ids));
};

const registrarPreguntaFallada = (preguntaId) => {
  const actuales = leerPreguntasFalladas().map(String);
  const id = String(preguntaId);

  if (!actuales.includes(id)) {
    actuales.push(id);
    guardarPreguntasFalladas(actuales);
  }
};

const quitarPreguntaDeFalladas = (preguntaId) => {
  const id = String(preguntaId);
  const filtradas = leerPreguntasFalladas().map(String).filter((x) => x !== id);
  guardarPreguntasFalladas(filtradas);
};

const sincronizarResultadoEnStorage = (preguntaId, esCorrecta) => {
  if (esCorrecta) {
    quitarPreguntaDeFalladas(preguntaId);
  } else {
    registrarPreguntaFallada(preguntaId);
  }
};

const volverAlInicio = () => {
  resetearEstadoTest();
  state.modoTest = false;
  ui.modoTestSwitch.checked = false;
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

    state.bancoPreguntas = data;
    state.preguntas = [];
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
  ui.repasarFallosBtn.addEventListener("click", iniciarRepasoFallos);
  cargarPreguntas();
};
