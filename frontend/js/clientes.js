// JavaScript para manejar el botón de contraer/expandir el sidebar
const toggleBtn = document.getElementById('toggleBtn');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
});

// Función para cargar los productos desde el backend y mostrarlos en la tabla
function cargarClientes() {
    fetch('http://localhost:3002/clientes')
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos:", data);  // Mostrar la respuesta en la consola
        
        // Verificamos si el estado es 'ok' y si hay datos en result_data
        if (data.result_estado === 'ok' && Array.isArray(data.result_data)) {
            const tableBody = document.getElementById('clientesTableBody');
            tableBody.innerHTML = '';  // Limpiar tabla

            // Iteramos sobre el array de productos
            data.result_data.forEach(cliente => {
                const row = document.createElement('tr');
                row.setAttribute('id', `cliente-${cliente.clienteid}`);  // Asignar un id único para identificar la fila
                row.innerHTML = `
                    <td>${cliente.clientenombre}</td>
                    <td>${cliente.clientecuit}</td>
                    <td>${cliente.clienteemail}</td>
                    <td>${cliente.clientetelefono}</td>
                    <td>${cliente.clientedireccion}</td>
                    <td><button class="btnEditar btn btn-primary" data-id="${cliente.clienteid}">Editar</button></td>
                    <td><button class="btnEliminar btn btn-danger" data-id="${cliente.clienteid}">Eliminar</button></td>
                `;
                tableBody.appendChild(row);
            });

            // Asignar eventos "click" a los botones de editar y eliminar
            document.querySelectorAll('.btnEditar').forEach(boton => {
                boton.addEventListener('click', (event) => {
                    const idCliente = event.target.getAttribute('data-id');
                    // Llamar a la función que abre el modal de edición
                    cargarFormularioEdicion(idCliente)
                });
            });

            document.querySelectorAll('.btnEliminar').forEach(boton => {
                boton.addEventListener('click', (event) => {
                    const idCliente = event.target.getAttribute('data-id');
                    eliminarCliente(idCliente);
                });
            });
        } else {
            console.error("La respuesta no contiene un array de clientes o el estado no es 'ok':", data); // Mostrar la respuesta completa
        }
    })
    .catch(error => console.error('Error al cargar los productos:', error));
}

// Cargar los productos al cargar la página
window.onload = cargarClientes;

document.getElementById('btnAbrirModal').addEventListener('click', function () {
    $('#modalAgregarCliente').modal('show');
});


// Seleccionamos el formulario
const formAgregarCliente = document.getElementById('formAgregarCliente');

// Manejar el evento de envío del formulario
formAgregarCliente.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

    // Capturar los datos del formulario
    const clientenombre = document.getElementById('clientenombre').value;
    const clientecuit = document.getElementById('clientecuit').value;
    const clienteemail = document.getElementById('clienteemail').value;
    const clientetelefono = document.getElementById('clientetelefono').value;
    const clientedireccion = document.getElementById('clientedireccion').value;

    try {
        // Enviar la solicitud POST al servidor para agregar el producto
        const response = await fetch('http://localhost:3002/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientenombre: clientenombre,
                clientecuit: clientecuit,
                clienteemail: clienteemail,
                clientetelefono: clientetelefono,
                clientedireccion: clientedireccion
            }),
        });

        const data = await response.json();

        if (data.result_estado === 'ok') {
            // Si la respuesta es exitosa
            formAgregarCliente.reset(); // Limpiar el formulario
            alert('Cliente agregado exitosamente');
            $('#modalAgregarCliente').modal('hide'); // Cerrar el modal

            // Recargar los productos para mostrar el nuevo producto
            cargarClientes(); // Asume que tienes una función para recargar los productos
        } else {
            alert('Error al agregar el cliente: ' + data.result_message);
        }
    } catch (error) {
        console.error('Error al agregar el cliente:', error);
        alert('Error al agregar el producto');
    }
});

function cargarFormularioEdicion(idCliente) {
    console.log(`Cargando formulario de edición para el cliente ID: ${idCliente}`);

    // Obtener los datos del cliente
    fetch(`http://localhost:3002/clientesid/${idCliente}`) // Asegúrate de que la URL es la correcta
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.result_estado === 'ok') {
                const cliente = data.result_data;

                // Capturar los datos del formulario
                document.getElementById('clientenombreeditar').value = cliente.clientenombre;
                document.getElementById('clientecuiteditar').value = cliente.clientecuit;
                document.getElementById('clienteemaileditar').value = cliente.clienteemail;
                document.getElementById('clientetelefonoeditar').value = cliente.clientetelefono;
                document.getElementById('clientedireccioneditar').value = cliente.clientedireccion;

                // Mostrar el modal
                $('#modalEditarCliente').modal('show');

                // Actualizar la función de envío del formulario
                formEditarCliente.onsubmit = (event) => {
                    event.preventDefault();
                    actualizarCliente(idCliente);
                };
            } else {
                alert('Error al cargar el cliente para edición');
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos del cliente para edición:', error);
            alert('Error al cargar el cliente: ' + error.message);
        });
}

async function actualizarCliente(idCliente) {
    const clientenombre = document.getElementById('clientenombreeditar').value;
    const clientecuit = document.getElementById('clientecuiteditar').value;
    const clienteemail = document.getElementById('clienteemaileditar').value;
    const clientetelefono = document.getElementById('clientetelefonoeditar').value;
    const clientedireccion = document.getElementById('clientedireccioneditar').value;

    try {
        // Realizar la solicitud PUT para actualizar el producto
        const response = await fetch(`http://localhost:3002/clientes/${idCliente}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientenombre: clientenombre,
                clientecuit: clientecuit,
                clienteemail: clienteemail,
                clientetelefono: clientetelefono,
                clientedireccion: clientedireccion,
            }),
        });

        const data = await response.json();

        if (data.result_estado === 'ok') {
            alert('Cliente actualizado exitosamente');
            $('#modalEditarCliente').modal('hide'); // Cerrar el modal

            // Recargar los productos para mostrar los cambios
            cargarClientes();
        } else {
            alert('Error al actualizar el cliente: ' + data.result_message);
        }
    } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        alert('Error al actualizar el cliente');
    }
}

// Función eliminar el producto
const eliminarCliente = async (idCliente) => {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?");

    if (confirmar) {
        try {
            // Realizar la solicitud DELETE al servidor
            const response = await fetch(`http://localhost:3002/clientes/${idCliente}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.result_estado === 'ok') {
                // Eliminar el producto del DOM
                document.getElementById(`cliente-${idCliente}`).remove();
                alert('cliente eliminado exitosamente');
            } else {
                alert('Error al eliminar el cliente: ' + data.result_message);
            }
        } catch (error) {
            console.error('Error al eliminar el cliente:', error);
            alert('Error al eliminar el cliente');
        }
    }
};

