import { ui } from "../dom.js";

export const setEstado = (texto) => {
  ui.estado.textContent = texto;
};

export const setPuntuacion = (puntuacion) => {
  ui.puntuacion.textContent = `Puntuacion: ${puntuacion}`;
};

export const mostrarInicio = () => {
  ui.inicio.hidden = false;
  ui.quiz.hidden = true;
  ui.resultado.hidden = true;
};

export const mostrarQuiz = () => {
  ui.inicio.hidden = true;
  ui.quiz.hidden = false;
  ui.resultado.hidden = false;
};

export const limpiarAccionPregunta = () => {
  ui.preguntaAccion.hidden = true;
  ui.preguntaAccion.innerHTML = "";
};

export const ocultarResumen = () => {
  ui.resumen.hidden = true;
  ui.resumenBotones.innerHTML = "";
};

export const deshabilitarOpciones = () => {
  const botones = ui.opciones.querySelectorAll("button");
  botones.forEach((boton) => {
    boton.disabled = true;
  });
};

export const marcarSeleccionTemporal = (indiceSeleccionado) => {
  const botones = ui.opciones.querySelectorAll(".opcion-btn");
  botones.forEach((boton) => {
    const indiceBoton = Number(boton.dataset.index);
    boton.classList.toggle("seleccionada", indiceBoton === indiceSeleccionado);
  });
};

export const mostrarBotonSiguiente = () => {
  ui.siguienteBtn.hidden = false;
};

export const ocultarBotonSiguiente = () => {
  ui.siguienteBtn.hidden = true;
};

export const revelarCorrecta = (indiceCorrecto) => {
  const botonCorrecto = ui.opciones.querySelector(`[data-index="${indiceCorrecto}"]`);
  if (botonCorrecto && !botonCorrecto.classList.contains("correcto")) {
    botonCorrecto.classList.add("revelada");
  }
};

export const actualizarBotonSiguiente = (hayRespuesta) => {
  ui.siguienteBtn.hidden = false;
  ui.siguienteBtn.classList.toggle("quiz-next--activo", hayRespuesta);
  ui.siguienteBtn.textContent = hayRespuesta
    ? "Pasar a la siguiente pregunta"
    : "Saltar pregunta actual";
};

export const renderErrorInicio = (mensaje) => {
  mostrarInicio();
  ui.inicioTexto.textContent = mensaje;
  ui.iniciarBtn.disabled = true;
  setEstado("Error de carga");
};

export const renderInicioCargando = (textoCarga) => {
  mostrarInicio();
  ui.inicioTexto.textContent = textoCarga;
  ui.iniciarBtn.disabled = true;
  setEstado("Cargando preguntas...");
};

export const renderInicioListo = (textoListo) => {
  ui.inicioTexto.textContent = textoListo;
  ui.iniciarBtn.disabled = false;
  setEstado("Listo para iniciar");
};
