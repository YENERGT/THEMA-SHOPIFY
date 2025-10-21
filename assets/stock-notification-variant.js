// Stock Notification Variant Handler - CORREGIDO PARA MANEJAR VARIANT IDs
console.log('🔧 Stock Notification Variant Handler cargado - Maneja variant_id correctamente');

document.addEventListener('DOMContentLoaded', function() {
  // Escuchar cambios de variante
  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.variantChange, function(event) {
      console.log('📦 Cambio de variante detectado:', event.data.variant?.id);
      updateStockNotification(event.data);
    });
  }

  // Función para actualizar la notificación de stock
  function updateStockNotification(data) {
    const sectionId = data.sectionId;
    const variant = data.variant;
    const notificationContainer = document.getElementById(`stock-notification-${sectionId}`);
    
    if (!notificationContainer) return;

    // Buscar el contenedor de botones y el form de producto
    const productForm = document.querySelector(`[data-section="${sectionId}"] .product-form`);
    const buttonsContainer = productForm?.querySelector('.product-form__buttons');
    
    // Mostrar/ocultar el formulario según disponibilidad
    if (variant && !variant.available) {
      // Variante agotada - mostrar formulario y ocultar botones
      notificationContainer.style.display = 'block';
      
      // Ocultar los botones
      if (buttonsContainer) {
        buttonsContainer.style.display = 'none';
      }
      
      // Actualizar los valores del formulario con la variante seleccionada
      const variantIdInput = document.getElementById(`notification-variant-id-${sectionId}`);
      const priceInput = document.getElementById(`notification-price-${sectionId}`);
      
      if (variantIdInput && variant.id) {
        variantIdInput.value = variant.id;
        console.log('✅ Variant ID actualizado en el formulario:', variant.id);
      }
      if (priceInput && variant.price !== undefined) {
        priceInput.value = variant.price;
        console.log('💰 Precio actualizado en el formulario:', variant.price);
      }
    } else {
      // Variante disponible - ocultar formulario y mostrar botones
      notificationContainer.style.display = 'none';
      
      // Mostrar los botones
      if (buttonsContainer) {
        buttonsContainer.style.display = 'block';
      }
    }
  }

  // También manejar el caso cuando no hay variante seleccionada
  const productForms = document.querySelectorAll('product-info');
  productForms.forEach(function(productInfo) {
    productInfo.addEventListener('setUnavailable', function() {
      const sectionId = this.dataset.section;
      const notificationContainer = document.getElementById(`stock-notification-${sectionId}`);
      const productForm = document.querySelector(`[data-section="${sectionId}"] .product-form`);
      const buttonsContainer = productForm?.querySelector('.product-form__buttons');
      
      if (notificationContainer) {
        notificationContainer.style.display = 'block';
        // Ocultar botones cuando no hay variante disponible
        if (buttonsContainer) {
          buttonsContainer.style.display = 'none';
        }
      }
    });
  });
  
  // Verificar el estado inicial al cargar la página
  document.querySelectorAll('.stock-notification-container').forEach(function(container) {
    const sectionId = container.id.replace('stock-notification-', '');
    const productForm = document.querySelector(`[data-section="${sectionId}"] .product-form`);
    const buttonsContainer = productForm?.querySelector('.product-form__buttons');
    
    // Si el formulario de notificación está visible, ocultar botones
    if (container.style.display === 'block' && buttonsContainer) {
      buttonsContainer.style.display = 'none';
    }
  });
});

// Manejar el envío del formulario
document.addEventListener('submit', function(e) {
  if (e.target.classList.contains('stock-notification-form')) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const successMessage = form.nextElementSibling;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Deshabilitar el botón mientras se envía
    // En la función de envío del formulario
if (submitButton) {
  submitButton.disabled = true;
  submitButton.classList.add('loading');
  submitButton.textContent = ''; // Vaciar texto para mostrar spinner
}
    

// Debug: Mostrar datos que se van a enviar
    const variantId = formData.get('variant_id');
    const productId = formData.get('product_id');
    console.log('📤 Enviando notificación de stock:');
    console.log('  Product ID:', productId);
    console.log('  Variant ID:', variantId);
    console.log('  Phone:', formData.get('phone'));

    // Convertir FormData a objeto y luego a JSON (formato requerido por el servidor)
    const data = Object.fromEntries(formData.entries());
    
    // Debug: Mostrar datos que se van a enviar
    console.log('📤 Enviando notificación de stock:');
    console.log('  Product ID:', data.product_id);
    console.log('  Variant ID:', data.variant_id);
    console.log('  Phone:', data.phone);
    console.log('  Datos completos:', data);
    
    // Enviar el formulario en formato JSON (como lo requiere el servidor)
    fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    })
    .then(result => {
      console.log('✅ Notificación enviada exitosamente:', result);
      // Ocultar formulario y mostrar mensaje de éxito
      form.style.display = 'none';
      if (successMessage) {
        successMessage.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('❌ Error al enviar notificación:', error);
      // Mostrar error al usuario
      alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.');
    })
    .finally(() => {
      // Re-habilitar el botón
      if (submitButton) {
  submitButton.disabled = false;
  submitButton.classList.remove('loading');
  submitButton.textContent = 'Notificarme cuando esté disponible';
}
    });
  }
});