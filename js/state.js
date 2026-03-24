export const state = {
  bancoPreguntas: [],
  preguntas: [],
  preguntaActual: 0,
  puntuacion: 0,
  bloqueado: false,
  respuestas: [],
  cargado: false,
};

export const resetearEstadoTest = () => {
  state.preguntaActual = 0;
  state.puntuacion = 0;
  state.bloqueado = false;
  state.respuestas = [];
};
