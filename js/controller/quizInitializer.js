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

const leerNumeroONull = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
};

const obtenerAjustesDesdeUI = () => ({
  modoTest: ui.modoTestSwitch.checked,
  soloNoVistas: ui.soloNoVistasSwitch.checked,
  rangeStart: leerNumeroONull(ui.rangeStart?.value),
  rangeEnd: leerNumeroONull(ui.rangeEnd?.value),
});

const aplicarAjustesALaUI = (ajustes = {}) => {
  if (ui.modoTestSwitch) {
    ui.modoTestSwitch.checked = Boolean(ajustes.modoTest);
  }

  if (ui.soloNoVistasSwitch) {
    ui.soloNoVistasSwitch.checked = Boolean(ajustes.soloNoVistas);
  }

  if (ui.rangeStart) {
    ui.rangeStart.value = ajustes.rangeStart ?? "";
  }

  if (ui.rangeEnd) {
    ui.rangeEnd.value = ajustes.rangeEnd ?? "";
  }
};

const filtrarBancoPorRango = (bancoPreguntas, ajustes = leerAjustes()) => {
  if (ajustes.rangeStart == null || ajustes.rangeEnd == null) {
    return bancoPreguntas;
  }

  const start = Number(ajustes.rangeStart);
  const end = Number(ajustes.rangeEnd);

  return bancoPreguntas.filter((pregunta) => {
    const id = Number(pregunta.id);
    return id >= start && id <= end;
  });
};

const guardarAjustesActuales = () => {
  const ajustes = obtenerAjustesDesdeUI();
  guardarAjustes(ajustes);
  return ajustes;
};

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
    const ajustes = leerAjustes();
    actualizarIndicadorVistasInicio(filtrarBancoPorRango(state.bancoPreguntas, ajustes).length);
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

  const ajustes = guardarAjustesActuales();
  state.modoTest = ajustes.modoTest;

  let bancoParaSeleccion = filtrarBancoPorRango(state.bancoPreguntas, ajustes);
  if (ajustes.soloNoVistas) {
    const idsVistas = new Set(leerPreguntasVistas().map(String));
    bancoParaSeleccion = bancoParaSeleccion.filter(
      (pregunta) => !idsVistas.has(String(pregunta.id))
    );

    if (bancoParaSeleccion.length === 0) {
      alert("Ya has visto todas las preguntas disponibles.");
      return;
    }
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

  const ajustes = guardarAjustesActuales();
  const idsFalladas = new Set(leerPreguntasFalladas().map(String));

  if (idsFalladas.size === 0) {
    alert("¡Genial! No tienes ninguna pregunta fallada pendiente de repasar.");
    return;
  }

  const bancoEnRango = filtrarBancoPorRango(state.bancoPreguntas, ajustes);
  const preguntasFiltradas = bancoEnRango.filter((pregunta) => idsFalladas.has(String(pregunta.id)));

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
  aplicarAjustesALaUI(leerAjustes());

  // Manejador para "Guardar ajustes"
  if (ui.guardarAjustesBtn) {
    ui.guardarAjustesBtn.addEventListener('click', () => {
      const ajustes = obtenerAjustesDesdeUI();
      if (ajustes.rangeStart != null && ajustes.rangeEnd != null && ajustes.rangeStart > ajustes.rangeEnd) {
        alert('El valor "Desde" debe ser menor o igual que "Hasta"');
        return;
      }
      guardarAjustes(ajustes);
      actualizarIndicadorVistasInicio(filtrarBancoPorRango(state.bancoPreguntas, ajustes).length);
      // Cerrar el accordion
      if (ui.ajustesAccordion) {
        ui.ajustesAccordion.open = false;
      }
    });
  }

  // Manejador para "Limpiar rango"
  if (ui.limpiarRangoBtn) {
    ui.limpiarRangoBtn.addEventListener('click', () => {
      const ajustes = {
        ...(leerAjustes() || {}),
        rangeStart: null,
        rangeEnd: null,
      };
      guardarAjustes(ajustes);
      aplicarAjustesALaUI(ajustes);
      actualizarIndicadorVistasInicio(state.bancoPreguntas.length);
    });
  }
  ui.iniciarBtn.addEventListener("click", iniciarTest);
  ui.siguienteBtn.addEventListener("click", avanzarConBoton);
  ui.repasarFallosBtn.addEventListener("click", iniciarRepasoFallos);
  console.log("✅ Event listeners agregados");
  cargarPreguntas();
};
