import { ui } from "../dom.js";
import {
  limpiarAccionPregunta,
  ocultarResumen,
  actualizarBotonSiguiente,
  setEstado,
} from "./renderUI.js";
import { renderMapaPreguntasEjecucion } from "./renderResults.js";

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
  preguntas = [],
  respuestas = [],
  onOptionClick,
  onNavigateQuestion,
  modoTest = false,
  mostrarMapaPreguntas = false,
  registroActual = null,
  onBackHome,
}) => {
  const numeroPregunta = pregunta.id ?? preguntaActual + 1;
  ui.pregunta.textContent = `${numeroPregunta}. ${pregunta.texto}`;
  ui.opciones.innerHTML = "";
  limpiarAccionPregunta();
  if (mostrarMapaPreguntas) {
    renderMapaPreguntasEjecucion({
      preguntas,
      respuestas,
      preguntaActual,
      onNavigateQuestion,
      onBackHome,
    });
  } else {
    ocultarResumen();
  }

  const hayRespuestaGuardada = Boolean(registroActual && !registroActual.omitted);
  actualizarBotonSiguiente(hayRespuestaGuardada);
  setEstado(
    modoTest
      ? `Pregunta ${numeroPregunta} de ${totalPreguntas} · Modo test`
      : `Pregunta ${numeroPregunta} de ${totalPreguntas}`
  );

  pregunta.opciones.forEach((opcion, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "opcion-btn";
    boton.dataset.index = String(indice);
    const { clave, contenido } = construirContenidoOpcion(opcion, indice);
    boton.append(clave, contenido);
    boton.addEventListener("click", () => onOptionClick(indice, boton));

    if (hayRespuestaGuardada) {
      boton.disabled = true;
      if (indice === registroActual.selectedOptionIndex) {
        boton.classList.add(registroActual.isCorrect ? "correcto" : "incorrecto");
      }

      if (!registroActual.isCorrect && indice === pregunta.correcta) {
        boton.classList.add("revelada");
      }
    }

    ui.opciones.appendChild(boton);
  });
};
