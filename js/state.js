export const state = {
  bancoPreguntas: [],
  preguntas: [],
  preguntaActual: 0,
  puntuacion: 0,
  bloqueado: false,
  modoTest: false,
  seleccionActual: null,
  respuestas: [],
  cargado: false,
};

export const resetearEstadoTest = () => {
  state.preguntaActual = 0;
  state.puntuacion = 0;
  state.bloqueado = false;
  state.seleccionActual = null;
  state.respuestas = [];
};
