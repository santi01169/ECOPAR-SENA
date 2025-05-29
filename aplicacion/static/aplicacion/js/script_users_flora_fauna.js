document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('flora-fauna-modal');
    const form = document.getElementById('flora-fauna-form');
    const addBtn = document.getElementById('add-evidence-btn');
    const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const tipoInput = document.getElementById('tipo-input');
    const nombreInput = document.getElementById('nombre-input');
    const descripcionInput = document.getElementById('descripcion-input');
    const imagenInput = document.getElementById('imagen-input');
    const registroIdInput = document.getElementById('registro-id-input');
    const imagenPreview = document.getElementById('imagen-preview');
    const uploadTextContainer = document.getElementById('upload-text-container');

    // Función para mostrar la vista previa de la imagen seleccionada
    function mostrarVistaPreviaImagen(file) {
        if (file && file.type.startsWith('image/')) {
            if (uploadTextContainer) uploadTextContainer.style.display = 'none';
            const reader = new FileReader();
            reader.onload = function (e) {
                imagenPreview.innerHTML = `
                    <div style="text-align:center;">
                        <img src="${e.target.result}" alt="Vista previa" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                        <br>
                        <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Eliminar imagen</button>
                    </div>
                `;
                // Botón para eliminar la vista previa y volver a mostrar el texto
                const btnEliminar = document.getElementById('btn-eliminar-preview');
                if (btnEliminar) {
                    btnEliminar.onclick = function () {
                        imagenPreview.innerHTML = '';
                        if (uploadTextContainer) uploadTextContainer.style.display = '';
                        imagenInput.value = '';
                    };
                }
            };
            reader.readAsDataURL(file);
        } else {
            imagenPreview.innerHTML = '';
            if (uploadTextContainer) uploadTextContainer.style.display = '';
        }
    }

    // Abrir modal para agregar
    addBtn.addEventListener('click', function () {
        modal.style.display = ''; // <-- Asegura que el modal esté visible
        modal.classList.add('show');
        modalTitle.textContent = 'Agregar Flora o Fauna';
        submitBtn.textContent = 'Subir';
        form.action = window.location.pathname; // POST a la misma URL
        registroIdInput.value = '';
        tipoInput.value = '';
        nombreInput.value = '';
        descripcionInput.value = '';
        imagenInput.value = '';
        imagenPreview.innerHTML = '';
        if (uploadTextContainer) uploadTextContainer.style.display = '';
        imagenInput.required = true;
    });

    // Abrir modal para editar
    document.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.style.display = ''; // <-- Asegura que el modal esté visible
            modal.classList.add('show');
            modalTitle.textContent = 'Editar Flora o Fauna';
            submitBtn.textContent = 'Actualizar';
            tipoInput.value = btn.getAttribute('data-tipo');
            nombreInput.value = btn.getAttribute('data-nombre');
            descripcionInput.value = btn.getAttribute('data-descripcion');
            registroIdInput.value = btn.getAttribute('data-id');
            form.action = `/flora-fauna/editar/${btn.getAttribute('data-id')}/`;
            imagenInput.value = '';
            imagenInput.required = false;
            // Mostrar preview de imagen actual
            const imgUrl = btn.getAttribute('data-imagen-url');
            if (imgUrl) {
                imagenPreview.innerHTML = `
                <div style="text-align:center;">
                    <img src="${imgUrl}" alt="Imagen actual" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                    <br>
                    <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Eliminar imagen</button>
                </div>
                `;
                if (uploadTextContainer) uploadTextContainer.style.display = 'none';
                // Botón para eliminar la vista previa y volver a mostrar el texto
                const btnEliminar = document.getElementById('btn-eliminar-preview');
                if (btnEliminar) {
                    btnEliminar.onclick = function () {
                        imagenPreview.innerHTML = '';
                        if (uploadTextContainer) uploadTextContainer.style.display = '';
                        imagenInput.value = '';
                    };
                }
            } else {
                imagenPreview.innerHTML = '';
                if (uploadTextContainer) uploadTextContainer.style.display = '';
            }
        });
    });

    // Cerrar modal
    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.classList.remove('show');
            modal.style.display = ''; // <-- Restablece el display
        });
    });

    // Opcional: Cerrar modal al hacer click fuera
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.style.display = '';
        }
    });

    // Mostrar vista previa al seleccionar nueva imagen (tanto al agregar como al editar)
    imagenInput.addEventListener('change', function () {
        mostrarVistaPreviaImagen(this.files[0]);
    });
});
