import { ui } from "../dom.js";
import {
  limpiarAccionPregunta,
  ocultarBotonSiguiente,
  ocultarBotonVolverInicio,
  setEstado,
} from "./renderUI.js";

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

const marcarBotonResumenActivo = (orderIndex) => {
  const botones = ui.resumenBotones.querySelectorAll("button");
  botones.forEach((boton) => {
    boton.classList.toggle("activo", Number(boton.dataset.order) === orderIndex);
  });
};

const obtenerEstadoPregunta = (registro) => {
  if (!registro) {
    return "Pendiente";
  }

  if (registro.omitted) {
    return "Omitida";
  }

  return registro.isCorrect ? "Correcta" : "Incorrecta";
};

const actualizarTituloResumen = (texto) => {
  const titulo = ui.resumen.querySelector(".resumen__titulo");
  if (titulo) {
    titulo.textContent = texto;
  }
};

export const renderFinal = ({ puntuacion, totalPreguntas }) => {
  ui.opciones.innerHTML = "";
  ocultarBotonSiguiente();
  ocultarBotonVolverInicio();
  ui.pregunta.textContent = "Quiz finalizado";
  setEstado("Completado");
  ui.puntuacion.textContent = `Has acertado ${puntuacion} de ${totalPreguntas}`;
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

export const renderResumenFinal = ({ respuestas, onReview }) => {
  ui.resumen.hidden = false;
  actualizarTituloResumen("Resumen por pregunta");
  // Remove any standalone acciones block placed under puntuacion
  const accionesExistentes = document.querySelector(".resumen-mapa__acciones");
  if (accionesExistentes) accionesExistentes.remove();
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

    const botonInicio = document.createElement("button");
    botonInicio.type = "button";
    botonInicio.className = "accion-btn secundario quiz-back";
    botonInicio.textContent = "Volver al inicio";
    botonInicio.addEventListener("click", onBackHome);

    ui.resumenBotoones.appendChild(botonInicio);
    });
};

export const renderMapaPreguntasEjecucion = ({
  preguntas,
  respuestas,
  preguntaActual,
  onNavigateQuestion,
  onBackHome,
}) => {
  ui.resumen.hidden = false;
  actualizarTituloResumen("Mapa de preguntas");
  ui.resumenBotones.innerHTML = "";
  // Ensure no leftover acciones elsewhere
  const existingAcciones = document.querySelector(".resumen-mapa__acciones");
  if (existingAcciones) existingAcciones.remove();

  const acciones = document.createElement("div");
  acciones.className = "resumen-mapa__acciones";

  const botonInicio = document.createElement("button");
  botonInicio.type = "button";
  botonInicio.className = "accion-btn secundario quiz-back";
  botonInicio.textContent = "Volver al inicio";
  botonInicio.addEventListener("click", onBackHome);

  acciones.appendChild(botonInicio);
  Insert acciones below the puntuacion element (before the resumen section)
  const footer = ui.puntuacion?.parentNode || document.querySelector('footer');
  if (footer && ui.resumen) {
    footer.insertBefore(acciones, ui.resumen);
  } else {
    // Fallback: append into resumen botones
    ui.resumenBotones.appendChild(acciones);
  }

  const contenedor = document.createElement("details");
  contenedor.className = "resumen-mapa resumen-mapa--desplegable";
  contenedor.open = true;

  const resumen = document.createElement("summary");
  resumen.className = "resumen-mapa__summary";
  resumen.textContent = "Navegación del test";

  const barra = document.createElement("div");
  barra.className = "resumen-mapa__barra";

  preguntas.forEach((pregunta, index) => {
    const registro = respuestas[index];
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = `resumen-mapa__boton ${
      registro?.omitted ? "omitida" : registro?.isCorrect ? "correcto" : registro ? "incorrecto" : "pendiente"
    }`;
    boton.textContent = String(index + 1);
    boton.title = `${index + 1}. ${obtenerEstadoPregunta(registro)}`;
    boton.setAttribute("aria-label", `Ir a la pregunta ${index + 1}, ${obtenerEstadoPregunta(registro)}`);

    if (index === preguntaActual) {
      boton.classList.add("activo");
    }

    boton.addEventListener("click", () => onNavigateQuestion(index));
    barra.appendChild(boton);
  });

  contenedor.append(resumen, barra);
  ui.resumenBotones.appendChild(contenedor);
};

export const renderRevisionPregunta = ({
  pregunta,
  registro,
  totalPreguntas,
  onRetryFailed,
  onBackHome,
  disableRetry,
  retryLabel,
}) => {
  ui.pregunta.textContent = pregunta.texto;
  ui.opciones.innerHTML = "";
  ocultarBotonSiguiente();
  renderBotonesAccionFinal({ onRetryFailed, onBackHome, disableRetry, retryLabel });
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
