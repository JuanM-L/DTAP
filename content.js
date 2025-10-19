// content.js

async function convertirPrecios() {
  
  // 1. Obtener la cotización del Dólar Tarjeta del almacenamiento local
  const data = await chrome.storage.local.get('dolarTarjeta');
  
  if (!data.dolarTarjeta) {
    console.log("[Conversor ARS] Esperando cotización del dólar del script de fondo.");
    // Si no hay cotización, salimos y el MutationObserver volverá a intentar.
    return;
  }

  const precioDolarTarjeta = data.dolarTarjeta;

  // 2. DEFINIR LOS SELECTORES DE PRECIO 
  // ¡CRUCIAL! Asegúrate de que los selectores de Play Store sean correctos
  const selectoresDePrecio = [
      // === STEAM (Selectores estables) ===
      '.game_purchase_price',       
      '.discount_original_price',   
      '.price',                     
      
      // === EPIC GAMES (Selector confirmado: usa la etiqueta <strong>) ===
      'strong', // Ojo: Amplio, pero funciona si el precio es el único <strong> relevante
      '[data-testid="offer-price"]', 
      
      // === ROBLOX (Selector confirmado) ===
      '.price-tag.font-header-1', // Precio de Robux/Premium
      
      // === GOOGLE PLAY STORE (Selectores probables - REQUIERE VERIFICACIÓN) ===
      '.VfPp0',                     
      '.display-price',
      '.SUZt4c' 
  ];
  
  const elementos = document.querySelectorAll(selectoresDePrecio.join(','));
  
  console.log(`[Conversor ARS] Dólar Tarjeta: ${precioDolarTarjeta.toFixed(2)}. Elementos encontrados: ${elementos.length}`);

  // 3. Iterar y convertir cada precio
  elementos.forEach(el => {
    // Evitar reconversiones o elementos vacíos
    if (el.dataset.convertido || el.innerText.trim() === '') return;

    const textoOriginal = el.innerText;
    
    // Limpieza: Aísla el número. Reemplaza comas por puntos (para decimales) y quita símbolos ($, US$, etc.).
    const precioEnUSD = parseFloat(textoOriginal.replace(/[^0-9.,]+/g, '').replace(',', '.'));

    if (!isNaN(precioEnUSD) && precioEnUSD > 0) {
      const precioEnARS = precioEnUSD * precioDolarTarjeta;

      // Formateo a moneda argentina
      const formatoARS = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      });

      // Reemplazamos el contenido
      el.innerText = formatoARS.format(precioEnARS);
      
      // Marcamos como convertido y añadimos el tooltip
      el.dataset.convertido = "true";
      el.title = `Precio original: ${textoOriginal} | (Dólar Tarjeta usado: ${precioDolarTarjeta.toFixed(2)})`;
    }
  });
}

// 4. Ejecutar la función y monitorear cambios
convertirPrecios();

// MutationObserver para capturar contenido que carga de forma dinámica (scroll, pestañas)
const observer = new MutationObserver((mutations) => {
  // Pequeño retraso para no ejecutar la función miles de veces por segundo (debounce)
  clearTimeout(window.miTimerDeConversion);
  window.miTimerDeConversion = setTimeout(convertirPrecios, 500);
});

// Observamos todo el body del documento
observer.observe(document.body, {
  childList: true,
  subtree: true
});
