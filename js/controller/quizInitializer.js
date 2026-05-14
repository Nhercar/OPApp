import { ui } from "../dom.js";
import { QUIZ_CONFIG, START_ERROR_TEXT, START_LOADING_TEXT, START_READY_TEXT } from "../config.js";
import { state } from "../state.js";
import { cargarPreguntasDesdeFuente } from "../data.js";
import {
  renderErrorInicio,
  renderInicioCargando,
  renderInicioListo,
} from "../render/renderUI.js";
import {
  leerPreguntasFalladas,
  leerPreguntasVistas,
  actualizarLabelRepasoInicio,
  actualizarIndicadorVistasInicio,
  leerAjustes,
  guardarAjustes,
} from "./storageManager.js";
import { iniciarIntentoConPreguntas, avanzarConBoton } from "./quizFlow.js";

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

export const cargarPreguntas = async () => {
  console.log("🔄 Iniciando carga de preguntas...");
  renderInicioCargando(START_LOADING_TEXT);

  try {
    console.log("📡 Fetching desde:", QUIZ_CONFIG.dataUrl);
    const data = await cargarPreguntasDesdeFuente();
    console.log("✅ Preguntas cargadas:", data.length, "preguntas");

    state.bancoPreguntas = data;
    state.preguntas = [];
    state.cargado = true;
    actualizarLabelRepasoInicio();
    actualizarIndicadorVistasInicio(state.bancoPreguntas.length);
      // Aplicar ajustes guardados (si hay rango) para mostrar el porcentaje relativo al banco seleccionado
      const ajustes = leerAjustes();
      if (ajustes && ajustes.rangeStart && ajustes.rangeEnd) {
        const totalEnRango = state.bancoPreguntas.filter(p => {
          const id = Number(p.id);
          return id >= Number(ajustes.rangeStart) && id <= Number(ajustes.rangeEnd);
        }).length;
        actualizarIndicadorVistasInicio(totalEnRango);
      }
    console.log("✅ Estado actualizado, renderizando pantalla lista");
    renderInicioListo(START_READY_TEXT);
  } catch (error) {
    console.error("❌ Error en carga de preguntas:", error);
    state.cargado = false;
    renderErrorInicio(START_ERROR_TEXT);
  }
};

export const iniciarTest = () => {
  if (!state.cargado || state.bancoPreguntas.length === 0) {
    return;
  }

  state.modoTest = ui.modoTestSwitch.checked;

  let bancoParaSeleccion = state.bancoPreguntas;
  if (ui.soloNoVistasSwitch.checked) {
    const idsVistas = new Set(leerPreguntasVistas().map(String));
    bancoParaSeleccion = state.bancoPreguntas.filter(
      (pregunta) => !idsVistas.has(String(pregunta.id))
    );

    if (bancoParaSeleccion.length === 0) {
      alert("Ya has visto todas las preguntas disponibles.");
      return;
    }
  }
    // Aplicar rango si hay ajustes
    const ajustes = leerAjustes();
    if (ajustes && ajustes.rangeStart && ajustes.rangeEnd) {
      const start = Number(ajustes.rangeStart);
      const end = Number(ajustes.rangeEnd);
      bancoParaSeleccion = bancoParaSeleccion.filter((p) => {
        const id = Number(p.id);
        return id >= start && id <= end;
      });
    }

  const preguntasAleatorias = seleccionarPreguntasAleatorias(
    bancoParaSeleccion,
    QUIZ_CONFIG.preguntasPorTest
  );

  iniciarIntentoConPreguntas(preguntasAleatorias);
};

export const iniciarRepasoFallos = () => {
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

export const initQuizApp = () => {
  console.log("🚀 Inicializando aplicación de quiz...");
  actualizarLabelRepasoInicio();
  actualizarIndicadorVistasInicio(state.bancoPreguntas.length);
  // Inicializar controles de rango con ajustes guardados
  const ajustes = leerAjustes();
  if (ajustes) {
    if (ajustes.rangeStart && ui.rangeStart) ui.rangeStart.value = ajustes.rangeStart;
    if (ajustes.rangeEnd && ui.rangeEnd) ui.rangeEnd.value = ajustes.rangeEnd;
  }

  // Manejador para "Guardar ajustes"
  if (ui.guardarAjustesBtn) {
    ui.guardarAjustesBtn.addEventListener('click', () => {
      const start = Number(ui.rangeStart.value) || null;
      const end = Number(ui.rangeEnd.value) || null;
      if (start && end && start > end) {
        alert('El valor "Desde" debe ser menor o igual que "Hasta"');
        return;
      }
      const nuevos = { ...(leerAjustes() || {}), rangeStart: start, rangeEnd: end };
      guardarAjustes(nuevos);
      // actualizar indicador en base al rango nuevo
      if (state.bancoPreguntas.length > 0 && start && end) {
        const totalEnRango = state.bancoPreguntas.filter(p => {
          const id = Number(p.id);
          return id >= start && id <= end;
        }).length;
        actualizarIndicadorVistasInicio(totalEnRango);
      } else {
        actualizarIndicadorVistasInicio(state.bancoPreguntas.length);
      }
      // Cerrar el accordion
      if (ui.ajustesAccordion) {
        ui.ajustesAccordion.open = false;
      }
    });
  }

  // Manejador para "Limpiar rango"
  if (ui.limpiarRangoBtn) {
    ui.limpiarRangoBtn.addEventListener('click', () => {
      const actuales = leerAjustes() || {};
      delete actuales.rangeStart;
      delete actuales.rangeEnd;
      guardarAjustes(actuales);
      if (ui.rangeStart) ui.rangeStart.value = '';
      if (ui.rangeEnd) ui.rangeEnd.value = '';
      actualizarIndicadorVistasInicio(state.bancoPreguntas.length);
    });
  }
  ui.iniciarBtn.addEventListener("click", iniciarTest);
  ui.siguienteBtn.addEventListener("click", avanzarConBoton);
  ui.repasarFallosBtn.addEventListener("click", iniciarRepasoFallos);
  console.log("✅ Event listeners agregados");
  cargarPreguntas();
};
