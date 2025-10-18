// background.js

// --- 1. Funciones para buscar datos ---

async function fetchDolarTarjeta() {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/tarjeta');
    if (!response.ok) throw new Error('Falló la API de DolarAPI');
    const data = await response.json();
    
    // Guardamos el valor en el almacenamiento de Chrome
    await chrome.storage.local.set({ dolarTarjeta: data.venta });
    console.log('Dólar Tarjeta actualizado:', data.venta);
  } catch (error) {
    console.error('Error al buscar el dólar:', error);
  }
}

async function fetchOfertas() {
  try {
    // Buscamos ofertas de Steam (storeID=1) y Epic (storeID=7)
    const response = await fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1,7&pageSize=5');
    if (!response.ok) throw new Error('Falló la API de CheapShark');
    const data = await response.json();
    
    // Guardamos las ofertas
    await chrome.storage.local.set({ ofertasJuegos: data });
    console.log('Ofertas actualizadas:', data);
  } catch (error) {
    console.error('Error al buscar ofertas:', error);
  }
}

// --- 2. Tareas programadas ---

// Al instalar la extensión, ejecuta todo por primera vez.
chrome.runtime.onInstalled.addListener(() => {
  fetchDolarTarjeta();
  fetchOfertas();
  
  // Crea una "alarma" que se disparará cada 30 minutos
  chrome.alarms.create('actualizarDatos', {
    periodInMinutes: 30
  });
});

// Cuando la alarma se dispare, vuelve a buscar los datos
// AQUÍ ESTABA EL ERROR:
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'actualizarDatos') {
    fetchDolarTarjeta();
    fetchOfertas();
  }
});