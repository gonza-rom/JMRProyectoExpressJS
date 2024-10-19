// JavaScript para manejar el botón de contraer/expandir el sidebar
const toggleBtn = document.getElementById('toggleBtn');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', function () {
    sidebar.classList.toggle('collapsed');
});

// Función para cargar los productos desde el backend y mostrarlos en la tabla
function cargarProductos() {
    fetch('http://localhost:3002/productos')
        .then(response => response.json())
        .then(data => {
            console.log("Datos recibidos al cargar productos:", data);  // Mostrar la respuesta en la consola

            if (data.result_estado === 'ok' && Array.isArray(data.result_data)) {
                const tableBody = document.getElementById('productosTableBody');
                tableBody.innerHTML = '';  // Limpiar tabla

                data.result_data.forEach(producto => {
                    const row = document.createElement('tr');
                    row.setAttribute('id', `producto-${producto.productoid}`);  // Asignar un id único para identificar la fila
                    row.innerHTML = `
                    <td>${producto.productonombre}</td>
                    <td>${producto.productocb}</td>
                    <td>${producto.productosstock}</td>
                    <td>$${producto.productoprecio}</td>
                    <td>${producto.categorianombre}</td>
                    <td><button class="btnEditar btn btn-primary" data-id="${producto.productoid}">Editar</button></td>
                    <td><button class="btnEliminar btn btn-danger" data-id="${producto.productoid}">Eliminar</button></td>
                `;
                    tableBody.appendChild(row);
                });

                // Asignar eventos "click" a los botones de editar y eliminar
                document.querySelectorAll('.btnEditar').forEach(boton => {
                    boton.addEventListener('click', (event) => {
                        const idProducto = event.target.getAttribute('data-id');
                        // Llamar a la función que abre el modal de edición
                        cargarFormularioEdicion(idProducto)
                    });
                });

                document.querySelectorAll('.btnEliminar').forEach(boton => {
                    boton.addEventListener('click', (event) => {
                        const idProducto = event.target.getAttribute('data-id');
                        eliminarProducto(idProducto);
                    });
                });
            } else {
                console.error("La respuesta no contiene un array de productos o el estado no es 'ok':", data);
            }
        })
        .catch(error => console.error('Error al cargar los productos:', error));
}

// Cargar los productos al cargar la página
window.onload = cargarProductos;

// Al hacer clic en el botón de abrir el modal, mostramos el modal
document.getElementById('btnAbrirModal').addEventListener('click', function () {
    $('#modalAgregarProducto').modal('show');
});


// Seleccionamos el formulario
const formAgregarProducto = document.getElementById('formAgregarProducto');

// Manejar el evento de envío del formulario
formAgregarProducto.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

    // Capturar los datos del formulario
    const nombrecb = document.getElementById('nombrecb').value;
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const categoria = document.getElementById('categoria').value;  // Obtener la categoría seleccionada

    try {
        // Enviar la solicitud POST al servidor para agregar el producto
        const response = await fetch('http://localhost:3002/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productocb: nombrecb,
                productonombre: nombre,
                productoprecio: parseFloat(precio),
                productosstock: parseInt(stock),
                categoriaid: parseInt(categoria),  // Enviar el ID de la categoría seleccionada
            }),
        });

        const data = await response.json();

        if (data.result_estado === 'ok') {
            // Si la respuesta es exitosa
            formAgregarProducto.reset(); // Limpiar el formulario
            alert('Producto agregado exitosamente');
            $('#modalAgregarProducto').modal('hide'); // Cerrar el modal

            // Recargar los productos para mostrar el nuevo producto
            cargarProductos(); // Asume que tienes una función para recargar los productos
        } else {
            alert('Error al agregar el producto: ' + data.result_message);
        }
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        alert('Error al agregar el producto');
    }
});


function cargarFormularioEdicion(idProducto) {
    console.log(`Cargando formulario de edición para el producto ID: ${idProducto}`);

    // Primero, cargar las categorías
    cargarCategorias()
        .then(() => {
            // Después de cargar las categorías, obtener los datos del producto
            return fetch(`http://localhost:3002/productosid/${idProducto}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.result_estado === 'ok') {
                const producto = data.result_data;

                // Llenar el formulario con los datos del producto
                document.getElementById('nombrecbeditar').value = producto.productocb;
                document.getElementById('nombreeditar').value = producto.productonombre;
                document.getElementById('precioeditar').value = producto.productoprecio;
                document.getElementById('stockeditar').value = producto.productosstock;

                // Seleccionar la categoría del producto en el select
                document.getElementById('categoriaeditar').value = producto.categoriaid;

                // Mostrar el modal
                $('#modalEditarProducto').modal('show');

                // Actualizar la función de envío del formulario
                formEditarProducto.onsubmit = (event) => {
                    event.preventDefault();
                    actualizarProducto(idProducto);
                };
            } else {
                alert('Error al cargar el producto para edición');
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos del producto para edición:', error);
            alert('Error al cargar el producto: ' + error.message);
        });
}


async function actualizarProducto(idProducto) {
    const nombrecb = document.getElementById('nombrecbeditar').value;
    const nombre = document.getElementById('nombreeditar').value;
    const precio = document.getElementById('precioeditar').value;
    const stock = document.getElementById('stockeditar').value;
    const categoria = document.getElementById('categoriaeditar').value;

    try {
        // Realizar la solicitud PUT para actualizar el producto
        const response = await fetch(`http://localhost:3002/productos/${idProducto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productocb: nombrecb,
                productonombre: nombre,
                productoprecio: parseFloat(precio),
                productosstock: parseInt(stock),
                categoriaid: parseInt(categoria),
            }),
        });

        const data = await response.json();

        if (data.result_estado === 'ok') {
            alert('Producto actualizado exitosamente');
            $('#modalEditarProducto').modal('hide'); // Cerrar el modal

            // Recargar los productos para mostrar los cambios
            cargarProductos();
        } else {
            alert('Error al actualizar el producto: ' + data.result_message);
        }
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        alert('Error al actualizar el producto');
    }
}

// Actualizar la función cargarCategorias para devolver una promesa
function cargarCategorias() {
    return fetch('http://localhost:3002/categorias')  // Asumiendo que tienes un endpoint para obtener las categorías
        .then(response => response.json())
        .then(data => {
            console.log("Datos recibidos al cargar categorías:", data);
            
            // IDs de los select para agregar y editar
            const selectCategoriaAgregar = document.getElementById('categoria');
            const selectCategoriaEditar = document.getElementById('categoriaeditar');

            // Verificamos si el estado es 'ok' y si hay datos en result_data
            if (data.result_estado === 'ok' && Array.isArray(data.result_data)) {
                // Limpiar las opciones anteriores en ambos selects
                selectCategoriaAgregar.innerHTML = '';
                selectCategoriaEditar.innerHTML = '';

                // Rellenar ambos selects con las categorías
                data.result_data.forEach(categoria => {
                    const optionAgregar = document.createElement('option');
                    optionAgregar.value = categoria.categoriaid;
                    optionAgregar.text = categoria.categorianombre;
                    selectCategoriaAgregar.appendChild(optionAgregar);

                    const optionEditar = document.createElement('option');
                    optionEditar.value = categoria.categoriaid;
                    optionEditar.text = categoria.categorianombre;
                    selectCategoriaEditar.appendChild(optionEditar);
                });
            } else {
                console.error("La respuesta no contiene un array de categorías o el estado no es 'ok':", data);
            }
        })
        .catch(error => {
            console.error('Error al cargar las categorías:', error);
            throw error;  // Re-lanzar el error para que sea capturado en abrirModalEditar
        });
}

// Llamar a la función cuando la página cargue
window.onload = function () {
    cargarProductos();  // Cargar productos
    cargarCategorias(); // Cargar categorías
};


// Función eliminar el producto
const eliminarProducto = async (idProducto) => {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?");

    if (confirmar) {
        try {
            // Realizar la solicitud DELETE al servidor
            const response = await fetch(`http://localhost:3002/productos/${idProducto}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.result_estado === 'ok') {
                // Eliminar el producto del DOM
                document.getElementById(`producto-${idProducto}`).remove();
                alert('Producto eliminado exitosamente');
            } else {
                alert('Error al eliminar el producto: ' + data.result_message);
            }
        } catch (error) {
            console.error('Error al eliminar el producto:', error);
            alert('Error al eliminar el producto');
        }
    }
};

