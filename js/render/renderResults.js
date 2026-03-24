import { ui } from "../dom.js";
import { limpiarAccionPregunta, ocultarBotonSiguiente, setEstado } from "./renderUI.js";

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

export const renderFinal = ({ puntuacion, totalPreguntas }) => {
  ui.opciones.innerHTML = "";
  ocultarBotonSiguiente();
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
