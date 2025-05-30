document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('add-evidence-btn').addEventListener('click', function () {
        document.getElementById('add-evidence-modal').classList.add('show');
    });

    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('add-evidence-modal').classList.remove('show');
            document.querySelector('#add-evidence-modal form').reset();
        });
    });

    document.querySelector('#add-evidence-modal form').addEventListener('submit', enviarEvidencia);

    document.querySelector('.btn-primary[onclick="obtenerUbicacion()"]')?.addEventListener('click', obtenerUbicacion);

    configurarBotonesEliminar();
    configurarBotonesEditar();

    // Bloquear ubicación siempre
    const ubicacionInput = document.querySelector('input[name="ubicacion"]');
    if (ubicacionInput) {
        ubicacionInput.readOnly = true;
    }
});

function showAlert(type, message, duration = 4000) {
    const alertOverlay = document.getElementById('custom-alert');
    const alertContainer = alertOverlay.querySelector('.ecoparm-alert');
    const alertTitle = document.getElementById('alert-title');
    const alertMessage = document.getElementById('alert-message');
    const alertFooter = document.querySelector('.ecoparm-alert-footer');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // Configurar el tipo de alerta
    alertContainer.className = 'ecoparm-alert';
    alertContainer.classList.add(`alert-${type}`);

    // Configurar icono según el tipo
    let iconClass, titleText;
    switch (type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            titleText = 'Éxito';
            break;
        case 'error':
            iconClass = 'fas fa-times-circle';
            titleText = 'Error';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            titleText = 'Advertencia';
            break;
        case 'info':
        default:
            iconClass = 'fas fa-info-circle';
            titleText = 'Información';
    }

    // Configurar contenido
    alertTitle.innerHTML = `<i class="${iconClass}"></i> ${titleText}`;
    alertMessage.textContent = message;

    // Ocultar barra de progreso por defecto
    progressContainer.style.display = 'none';

    // Limpiar botones anteriores
    alertFooter.innerHTML = '';

    // Añadir botón OK por defecto
    const okBtn = document.createElement('button');
    okBtn.className = 'ecoparm-alert-button confirm';
    okBtn.textContent = 'Aceptar';
    okBtn.onclick = function () {
        closeAlert();
    };
    alertFooter.appendChild(okBtn);

    // Mostrar alerta
    alertOverlay.classList.remove('hidden');

    // Configurar autoclose
    if (duration) {
        setTimeout(() => {
            closeAlert();
        }, duration);
    }

    function closeAlert() {
        alertOverlay.classList.add('hidden');
    }

    return {
        close: closeAlert,
        addButton: (text, action, isPrimary = true) => {
            const button = document.createElement('button');
            button.className = `ecoparm-alert-button ${isPrimary ? 'confirm' : 'cancel'}`;
            button.textContent = text;
            button.onclick = function () {
                if (action) action();
                closeAlert();
            };

            // Reemplazar el botón por defecto si es el primero
            if (alertFooter.children.length === 1 && alertFooter.firstChild.textContent === 'Aceptar') {
                alertFooter.replaceChild(button, alertFooter.firstChild);
            } else {
                alertFooter.appendChild(button);
            }
        }
    };
}

// Función para mostrar confirmaciones
function showConfirm(message, confirmCallback, cancelCallback) {
    const alert = showAlert('warning', message, null);

    // Limpiar botones existentes
    const alertFooter = document.querySelector('.ecoparm-alert-footer');
    alertFooter.innerHTML = '';

    // Añadir botón Cancelar
    alert.addButton('Cancelar', () => {
        if (cancelCallback) cancelCallback();
    }, false);

    // Añadir botón Confirmar
    alert.addButton('Confirmar', () => {
        if (confirmCallback) confirmCallback();
    });
}

// Modificar la función de editar para bloquear ubicación y mostrar el modal
async function enviarEvidencia(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const evidenciaId = formData.get('evidencia_id');

    const url = evidenciaId ? `/evidencias/editar/${evidenciaId}/` : '/users_evidencias';
    const loadingAlert = showAlert('info', evidenciaId ? 'Actualizando evidencia...' : 'Subiendo evidencia...', null);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        loadingAlert.close();

        if (data.success) {
            showAlert('success', data.message || '✅ Evidencia guardada correctamente', 2000);
            form.reset();
            document.getElementById('add-evidence-modal').classList.remove('show');
            location.reload();
        } else {
            showAlert('error', '❌ Error al guardar evidencia: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        loadingAlert.close();
        showAlert('error', '❌ Error al enviar: ' + error.message);
        console.error("Error completo:", error);
    }
}

// Eliminar la duplicación de la función configurarBotonesEditar
// y mantener solo una implementación completa
function configurarBotonesEditar() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            if (!row) {
                console.error('No se encontró la fila padre');
                return;
            }

            const evidenciaId = row.dataset.id;
            const celdas = row.cells;

            // Verificar que tenemos suficientes celdas
            if (celdas.length < 7) {
                console.error('La fila no tiene suficientes celdas', celdas);
                return;
            }

            const actividad = celdas[3].textContent.trim();
            const ubicacion = celdas[4].textContent.trim();
            const observaciones = celdas[5].textContent.trim();
            const linkEvidencia = celdas[6].querySelector('a');
            const archivoUrl = linkEvidencia ? linkEvidencia.getAttribute('href') : '#';

            console.log('Datos a editar:', { evidenciaId, actividad, ubicacion, observaciones, archivoUrl });

            const modal = document.getElementById('add-evidence-modal');
            if (!modal) {
                console.error('No se encontró el modal con ID add-evidence-modal');
                return;
            }

            const form = modal.querySelector('form');
            if (!form) {
                console.error('No se encontró el formulario en el modal');
                return;
            }

            // Configurar el modal para edición
            const tituloModal = modal.querySelector('.modal-title');
            if (tituloModal) {
                tituloModal.textContent = 'Editar Evidencia';
            }

            // Limpiar formulario para nueva edición
            form.reset();

            // Llenar los campos del formulario
            form.querySelector('input[name="actividad"]').value = actividad;
            form.querySelector('textarea[name="observaciones"]').value = observaciones;
            form.querySelector('input[name="ubicacion"]').value = ubicacion;
            form.querySelector('input[name="ubicacion"]').readOnly = true; // Bloquear edición

            // Agregar ID de la evidencia al formulario
            let inputId = form.querySelector('input[name="evidencia_id"]');
            if (!inputId) {
                inputId = document.createElement('input');
                inputId.type = 'hidden';
                inputId.name = 'evidencia_id';
                form.appendChild(inputId);
            }
            inputId.value = evidenciaId;

            // Mostrar la imagen existente si es posible
            const previewContainer = document.getElementById('preview-container');
            const previewImage = document.getElementById('preview-image');
            if (previewContainer && previewImage && archivoUrl !== '#') {
                previewImage.src = archivoUrl;
                previewContainer.style.display = 'block';
            } else if (previewContainer) {
                previewContainer.style.display = 'none';
            }

            // Ocultar el botón de obtener ubicación en edición
            const btnUbicacion = document.querySelector('.btn-primary[onclick="obtenerUbicacion()"]');
            if (btnUbicacion) {
                btnUbicacion.style.display = 'none';
            }

            // Mostrar el modal
            modal.classList.add('show');
        });
    });
}


// ✅ Variable global para el contador
let contadorFilas = document.querySelectorAll('.table-responsive tbody tr').length;

// ✅ Función para agregar evidencia directamente a la tabla
// ✅ Actualizar contador de filas
function actualizarContadorFilas() {
    const filas = document.querySelectorAll('.table-responsive tbody tr');
    filas.forEach((fila, index) => {
        fila.querySelector('td:first-child').textContent = index + 1;
    });
}

// ✅ Función para agregar evidencia directamente a la tabla
function agregarEvidenciaTabla(actividad, ubicacion, observaciones, archivo_url, usuario_nombre) {
    const tbody = document.querySelector('.table-responsive tbody');
    const row = document.createElement('tr');

    // Validar y establecer valores por defecto si son undefined
    actividad = actividad || 'Sin actividad especificada';
    ubicacion = ubicacion || 'Ubicación no disponible';
    observaciones = observaciones || 'Sin observaciones';
    archivo_url = archivo_url || '#';
    usuario_nombre = usuario_nombre || 'Usuario desconocido';

    row.innerHTML = `
        <td></td> <!-- El número se actualizará automáticamente -->
        <td>${new Date().toISOString().slice(0, 16).replace('T', ' ')}</td>
        <td>${usuario_nombre}</td>
        <td>${actividad}</td>
        <td>${ubicacion}</td>
        <td>${observaciones}</td>
        <td><a href="${archivo_url}" target="_blank">Ver Evidencia</a></td>
        <td>
            <button class="btn btn-outline btn-edit">Editar</button>
            <button class="btn btn-danger btn-delete">Eliminar</button>
        </td>
    `;

    tbody.prepend(row);
    actualizarContadorFilas(); // Siempre actualizar el contador
}

// ✅ Configurar el botón eliminar para actualizar el contador
function configurarBotonesEliminar() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.removeEventListener('click', handleEliminarClick);
        btn.addEventListener('click', handleEliminarClick);
    });
}

// ✅ Manejador para eliminar
async function handleEliminarClick() {
    const fila = this.closest('tr');
    const evidenciaId = fila.dataset.id;

    if (!evidenciaId) {
        showAlert('error', 'Error: No se pudo identificar el ID de la evidencia');
        console.error('Fila sin ID:', fila);
        return;
    }

    showConfirm(
        '¿Estás seguro de eliminar esta evidencia?',
        async () => {
            const loadingAlert = showAlert('info', 'Eliminando evidencia...', null);
            try {
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                const formData = new FormData();
                formData.append('csrfmiddlewaretoken', csrfToken);

                const response = await fetch(`/evidencias/eliminar/${evidenciaId}/`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();
                loadingAlert.close();
                
                if (data.success) {
                    fila.remove();
                    actualizarContadorFilas();
                    showAlert('success', data.message || 'Evidencia eliminada correctamente');
                } else {
                    showAlert('error', 'Error: ' + (data.error || 'No se pudo eliminar la evidencia'));
                }
            } catch (error) {
                loadingAlert.close();
                showAlert('error', 'Error al eliminar: ' + error.message);
                console.error('Error completo:', error);
            }
        }
    );
}

// ✅ Función para obtener ubicación
function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById("ubicacion").value = `${lat}, ${lon}`;
            },
            function (error) {
                alert("❌ Error al obtener ubicación: " + error.message);
            }
        );
    } else {
        alert("❌ Tu navegador no soporta geolocalización.");
    }
}

// Drag & drop imágenes
document.addEventListener('DOMContentLoaded', function () {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    dropArea.addEventListener('drop', function (e) {
        const files = e.dataTransfer.files;
        handleFiles(files);
    }, false);

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
                fileInput.files = files;
            } else {
                alert('Por favor, selecciona un archivo de imagen válido.');
            }
        }
    }

    removeImageBtn.addEventListener('click', function () {
        previewImage.src = '#';
        previewContainer.style.display = 'none';
        fileInput.value = '';
    });
});

// Editar evidencia
function configurarBotonesEditar() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            if (!row) {
                console.error('No se encontró la fila padre');
                return;
            }

            const evidenciaId = row.dataset.id;
            const celdas = row.cells;

            // Verificar que tenemos suficientes celdas
            if (celdas.length < 7) {
                console.error('La fila no tiene suficientes celdas', celdas);
                return;
            }

            const actividad = celdas[3].textContent.trim();
            const ubicacion = celdas[4].textContent.trim();
            const observaciones = celdas[5].textContent.trim();
            const linkEvidencia = celdas[6].querySelector('a');
            const archivoUrl = linkEvidencia ? linkEvidencia.getAttribute('href') : '#';

            console.log('Datos a editar:', { actividad, ubicacion, observaciones, archivoUrl });

            const modal = document.getElementById('add-evidence-modal');
            if (!modal) {
                console.error('No se encontró el modal con ID add-evidence-modal');
                return;
            }

            const form = modal.querySelector('form');
            if (!form) {
                console.error('No se encontró el formulario en el modal');
                return;
            }

            // Configurar el modal para edición
            const tituloModal = modal.querySelector('.modal-title');
            if (tituloModal) {
                tituloModal.textContent = 'Editar Evidencia';
            }

            // Limpiar formulario para nueva edición
            form.reset();

            // Llenar los campos del formulario
            form.querySelector('input[name="actividad"]').value = actividad;
            form.querySelector('textarea[name="observaciones"]').value = observaciones;
            form.querySelector('input[name="ubicacion"]').value = ubicacion;
            form.querySelector('input[name="ubicacion"]').readOnly = true; // Bloquear edición

            // Agregar ID de la evidencia al formulario
            let inputId = form.querySelector('input[name="evidencia_id"]');
            if (!inputId) {
                inputId = document.createElement('input');
                inputId.type = 'hidden';
                inputId.name = 'evidencia_id';
                form.appendChild(inputId);
            }
            inputId.value = evidenciaId;

            // Mostrar la imagen existente
            const previewContainer = document.getElementById('preview-container');
            const previewImage = document.getElementById('preview-image');
            if (previewContainer && previewImage) {
                previewImage.src = archivoUrl;
                previewContainer.style.display = 'block';
            }

            // Ocultar el botón de obtener ubicación en edición
            const btnUbicacion = document.querySelector('.btn-primary[onclick="obtenerUbicacion()"]');
            if (btnUbicacion) {
                btnUbicacion.style.display = 'none';
            }

            // Mostrar el modal
            modal.classList.add('show');
        });
    });
}

// Configurar el modal para nueva evidencia
document.getElementById('add-evidence-btn').addEventListener('click', function () {
    const modal = document.getElementById('add-evidence-modal');
    const form = modal.querySelector('form');

    // Limpiar formulario
    form.reset();

    // Configurar el modal para nueva evidencia
    const tituloModal = modal.querySelector('.modal-title');
    if (tituloModal) {
        tituloModal.textContent = 'Nueva Evidencia';
    }

    // Limpiar imagen previa
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    if (previewContainer && previewImage) {
        previewImage.src = '#';
        previewContainer.style.display = 'none';
    }

    // Habilitar el botón de obtener ubicación para nueva evidencia
    const btnUbicacion = document.querySelector('.btn-primary[onclick="obtenerUbicacion()"]');
    if (btnUbicacion) {
        btnUbicacion.style.display = 'block';
    }

    // Eliminar campo de evidencia_id para nueva evidencia
    const inputId = form.querySelector('input[name="evidencia_id"]');
    if (inputId) {
        inputId.remove();
    }

    // Mostrar el modal
    modal.classList.add('show');
});

// Asegúrate de llamar esta función al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    configurarBotonesEditar();
    configurarBotonesEliminar();

    // Bloquear el campo de ubicación en el formulario siempre
    const ubicacionInput = document.querySelector('input[name="ubicacion"]');
    if (ubicacionInput) {
        ubicacionInput.readOnly = true;
    }
});