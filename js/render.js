import { ui } from "./dom.js";

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


const marcarBotonResumenActivo = (orderIndex) => {
  const botones = ui.resumenBotones.querySelectorAll("button");
  botones.forEach((boton) => {
    boton.classList.toggle("activo", Number(boton.dataset.order) === orderIndex);
  });
};

export const revelarCorrecta = (indiceCorrecto) => {
  const botonCorrecto = ui.opciones.querySelector(`[data-index="${indiceCorrecto}"]`);
  if (botonCorrecto && !botonCorrecto.classList.contains("correcto")) {
    botonCorrecto.classList.add("revelada");
  }
};

export const renderBotonesAccionFinal = ({
  onRetryFailed,
  onBackHome,
  retryLabel = "Realizar preguntas fallidas",
  disableRetry = false,
}) => {
  limpiarAccionPregunta();

  const botonReintentar = document.createElement("button");
  botonReintentar.type = "button";
  botonReintentar.className = "accion-btn";
  botonReintentar.textContent = retryLabel;
  botonReintentar.disabled = disableRetry;
  botonReintentar.addEventListener("click", onRetryFailed);

  const botonInicio = document.createElement("button");
  botonInicio.type = "button";
  botonInicio.className = "accion-btn secundario";
  botonInicio.textContent = "Volver al inicio";
  botonInicio.addEventListener("click", onBackHome);

  ui.preguntaAccion.appendChild(botonReintentar);
  ui.preguntaAccion.appendChild(botonInicio);
  ui.preguntaAccion.hidden = false;
};

const construirContenidoOpcion = (texto, indice) => {
  const letra = String.fromCharCode(65 + indice);

  const clave = document.createElement("span");
  clave.className = "opcion-clave";
  clave.textContent = letra;

  const contenido = document.createElement("span");
  contenido.className = "opcion-texto";
  contenido.textContent = texto;

  return { clave, contenido };
};

export const renderPregunta = ({
  pregunta,
  preguntaActual,
  totalPreguntas,
  onOptionClick,
  modoTest = false,
}) => {
  ui.pregunta.textContent = pregunta.texto;
  ui.opciones.innerHTML = "";
  limpiarAccionPregunta();
  ocultarResumen();
  actualizarBotonSiguiente(false);
  setEstado(
    modoTest
      ? `Pregunta ${preguntaActual + 1} de ${totalPreguntas} · Modo test`
      : `Pregunta ${preguntaActual + 1} de ${totalPreguntas}`
  );

  pregunta.opciones.forEach((opcion, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-btn";
    boton.dataset.index = String(indice);
    const { clave, contenido } = construirContenidoOpcion(opcion, indice);
    boton.append(clave, contenido);
    boton.addEventListener("click", () => onOptionClick(indice, boton));

    ui.opciones.appendChild(boton);
  });
};

export const renderFinal = ({ puntuacion, totalPreguntas }) => {
  ui.opciones.innerHTML = "";
  ocultarBotonSiguiente();
  ui.pregunta.textContent = "Quiz finalizado";
  setEstado("Completado");
  ui.puntuacion.textContent = `Has acertado ${puntuacion} de ${totalPreguntas}`;
};

export const renderResumenFinal = ({ respuestas, onReview }) => {
  ui.resumen.hidden = false;
  ui.resumenBotones.innerHTML = "";

  respuestas
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .forEach((registro) => {
      const estadoClase = registro.omitted
        ? "omitida"
        : registro.isCorrect
          ? "correcto"
          : "incorrecto";
      const botonResumen = document.createElement("button");
      botonResumen.type = "button";
      botonResumen.className = `resumen-btn ${estadoClase}`;
      botonResumen.textContent = String(registro.orderIndex + 1);
      botonResumen.dataset.order = String(registro.orderIndex);
      botonResumen.setAttribute("aria-label", `Pregunta ${registro.orderIndex + 1}`);
      botonResumen.addEventListener("click", () => onReview(registro.orderIndex));

      ui.resumenBotones.appendChild(botonResumen);
    });
};

export const renderRevisionPregunta = ({
  pregunta,
  registro,
  totalPreguntas,
  onRetryFailed,
  onBackHome,
  disableRetry,
}) => {
  ui.pregunta.textContent = pregunta.texto;
  ui.opciones.innerHTML = "";
  ocultarBotonSiguiente();
  renderBotonesAccionFinal({ onRetryFailed, onBackHome, disableRetry });
  setEstado(`Completado · Revision pregunta ${registro.orderIndex + 1} de ${totalPreguntas}`);

  pregunta.opciones.forEach((opcion, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-btn";
    const { clave, contenido } = construirContenidoOpcion(opcion, indice);
    boton.append(clave, contenido);
    boton.disabled = true;

    if (!registro.omitted && indice === registro.selectedOptionIndex) {
      boton.classList.add(registro.isCorrect ? "correcto" : "incorrecto");
    }

    if (!registro.omitted && !registro.isCorrect && indice === pregunta.correcta) {
      boton.classList.add("revelada");
    }

    ui.opciones.appendChild(boton);
  });

  marcarBotonResumenActivo(registro.orderIndex);
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

export const actualizarBotonSiguiente = (hayRespuesta) => {
    ui.siguienteBtn.hidden = false;
    ui.siguienteBtn.classList.toggle("quiz-next--activo", hayRespuesta);
    ui.siguienteBtn.textContent = hayRespuesta
    ? "Pasar a la siguiente pregunta"
    : "Saltar pregunta actual";
};