import { ui } from "../dom.js";
import { limpiarAccionPregunta, ocultarResumen, actualizarBotonSiguiente, setEstado } from "./renderUI.js";

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
