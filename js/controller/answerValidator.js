import { state } from "../state.js";
import {
  marcarSeleccionTemporal,
  deshabilitarOpciones,
  actualizarBotonSiguiente,
  revelarCorrecta,
  setPuntuacion,
} from "../render/renderUI.js";
import { sincronizarResultadoEnStorage } from "./storageManager.js";

export const registrarOmitidaActual = () => {
  const pregunta = state.preguntas[state.preguntaActual];

  state.respuestas[state.preguntaActual] = {
    questionId: pregunta.id,
    orderIndex: state.preguntaActual,
    selectedOptionIndex: null,
    isCorrect: false,
    omitted: true,
  };
};

export const validarRespuestaModoTest = () => {
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

export const manejarRespuesta = (indiceSeleccionado, botonSeleccionado) => {
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
