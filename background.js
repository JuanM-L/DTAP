// background.js

// --- CONFIGURACIÓN ---
const API_DOLAR_TARJETA = 'https://dolarapi.com/v1/dolares/tarjeta';
const API_OFERTAS = 'https://www.cheapshark.com/api/1.0/deals?storeID=1,7&pageSize=5'; // Steam (1), Epic (7)
const ALARM_NAME = 'actualizarDatos';
const REFRESH_INTERVAL_MINUTES = 30; // Actualizar datos cada 30 minutos

// --- 1. Funciones para buscar datos (Robustas) ---

/**
 * Busca el Dólar Tarjeta y lo guarda en el almacenamiento.
 * En caso de fallo, intenta calcular un valor de fallback o usa el último guardado.
 */
async function fetchDolarTarjeta() {
  console.log('Buscando cotización del Dólar Tarjeta...');
  try {
    const response = await fetch(API_DOLAR_TARJETA);
    if (!response.ok) {
      throw new Error(`Fallo de red al buscar el dólar. Status: ${response.status}`);
    }
    const data = await response.json();
    
    // Aseguramos que tenemos un valor numérico válido
    const valorVenta = parseFloat(data.venta);
    if (isNaN(valorVenta) || valorVenta <= 0) {
        throw new Error('Valor de venta inválido recibido de la API.');
    }

    // Guardamos el valor
    await chrome.storage.local.set({ dolarTarjeta: valorVenta });
    console.log(`✅ Dólar Tarjeta actualizado: ${valorVenta.toFixed(2)} ARS`);

  } catch (error) {
    console.error(`❌ Error al buscar el dólar. Usando el último valor guardado.`, error);
    // Podríamos añadir una lógica de fallback aquí si la API oficial falla
  }
}

/**
 * Busca ofertas de CheapShark para Steam y Epic Games y las guarda.
 */
async function fetchOfertas() {
  console.log('Buscando ofertas de juegos...');
  try {
    const response = await fetch(API_OFERTAS);
    if (!response.ok) {
        throw new Error(`Fallo de red al buscar ofertas. Status: ${response.status}`);
    }
    const data = await response.json();
    
    await chrome.storage.local.set({ ofertasJuegos: data });
    console.log(`✅ Ofertas actualizadas. Total encontradas: ${data.length}`);
  } catch (error) {
    console.error('❌ Error al buscar ofertas:', error);
  }
}

// --- 2. Control de Tareas Programadas (Service Worker) ---

/**
 * Función que se ejecuta cada vez que se necesita actualizar la data.
 */
function actualizarTodaData() {
    fetchDolarTarjeta();
    fetchOfertas();
}

/**
 * Configura la alarma para la actualización periódica.
 */
function configurarAlarma() {
  // Solo crea la alarma si no existe para evitar duplicados
  chrome.alarms.get(ALARM_NAME, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: REFRESH_INTERVAL_MINUTES
      });
      console.log(`Alarma configurada para cada ${REFRESH_INTERVAL_MINUTES} minutos.`);
    }
  });
}

// --- 3. Event Listeners ---

// 3.1. Al instalar/actualizar la extensión:
chrome.runtime.onInstalled.addListener(() => {
  actualizarTodaData(); // Ejecuta la primera búsqueda
  configurarAlarma();   // Configura la periodicidad
});

// 3.2. Cuando la alarma se dispara:
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('🔔 Alarma disparada: Actualizando datos...');
    actualizarTodaData();
  }
});
