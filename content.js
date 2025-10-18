// content.js (Modificado)

async function convertirPrecios() {
  
  // ¡YA NO HACEMOS FETCH! Solo leemos del almacenamiento local
  const data = await chrome.storage.local.get('dolarTarjeta');
  
  if (!data.dolarTarjeta) {
    console.log("Esperando cotización del dólar del script de fondo...");
    return;
  }

  const precioDolarTarjeta = data.dolarTarjeta;

  // El resto del código es idéntico al que ya tenías
  const selectoresDePrecio = [
      '.game_purchase_price',       // Posible selector de Steam
      '[data-testid="offer-price"]', // Posible selector de Epic Games
      '.VfPp0'                      // Posible selector de Google Play
      // ...añadir más si encuentras
  ];

  const elementos = document.querySelectorAll(selectoresDePrecio.join(','));

  elementos.forEach(el => {
    if (el.dataset.convertido) return;

    const textoOriginal = el.innerText;
    const precioEnUSD = parseFloat(textoOriginal.replace(/[^0-9.,]+/g, '').replace(',', '.'));

    if (!isNaN(precioEnUSD) && precioEnUSD > 0) {
      const precioEnARS = precioEnUSD * precioDolarTarjeta;

      const formatoARS = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
      });

      el.innerText = formatoARS.format(precioEnARS);
      el.title = `Precio original: ${textoOriginal}`;
      el.dataset.convertido = "true";
    }
  });
}

// --- Ejecución ---
convertirPrecios();

// El MutationObserver sigue igual
const observer = new MutationObserver((mutations) => {
  clearTimeout(window.miTimerDeConversion);
  window.miTimerDeConversion = setTimeout(convertirPrecios, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});