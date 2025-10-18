// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const dolarDiv = document.getElementById('dolar-info');
  const ofertasDiv = document.getElementById('ofertas-lista');

  // --- 1. Cargar el Dólar (sin cambios) ---
  chrome.storage.local.get('dolarTarjeta', (data) => {
    if (data.dolarTarjeta) {
      const formatoARS = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      });

      dolarDiv.innerHTML = `
        <p>${formatoARS.format(data.dolarTarjeta)}</p>
        <span>(Dólar Tarjeta)</span>
      `;
    } else {
      dolarDiv.innerHTML = '<p>Actualizando...</p>';
    }
  });

  // --- 2. Cargar las Ofertas (MODIFICADO) ---
  chrome.storage.local.get('ofertasJuegos', (data) => {
    if (data.ofertasJuegos && data.ofertasJuegos.length > 0) {
      ofertasDiv.innerHTML = ''; // Limpiamos el "Cargando..."
      
      data.ofertasJuegos.forEach(oferta => {
        // La URL de CheapShark redirige a la tienda correcta
        const urlJuego = `https://www.cheapshark.com/redirect?dealID=${oferta.dealID}`;
        
        const item = document.createElement('a');
        item.href = urlJuego;
        item.target = '_blank'; // Abrir en pestaña nueva
        item.className = 'oferta-item';

        // 1. Elemento de la Portada
        const img = document.createElement('img');
        img.src = oferta.thumb; // 'thumb' es la URL de la miniatura del juego
        img.alt = oferta.title;
        item.appendChild(img);

        // 2. Elemento de Detalles (Título y Precio)
        const details = document.createElement('div');
        details.className = 'oferta-details';
        
        details.innerHTML = `
          <strong>${oferta.title}</strong> 
          <span>$${oferta.salePrice} USD (${oferta.metacriticScore}% OFF)</span>
        `;
        item.appendChild(details);

        ofertasDiv.appendChild(item);
      });

    } else {
      ofertasDiv.innerHTML = '<p>No se encontraron ofertas de Steam/Epic.</p>';
    }
  });
});