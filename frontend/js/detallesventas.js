// JavaScript para manejar el botón de contraer/expandir el sidebar
const toggleBtn = document.getElementById('toggleBtn');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', function () {
    sidebar.classList.toggle('collapsed');
});

// Definir la función cargarVentas en el ámbito global
function cargarVentas() {
    fetch('/ventas') // Endpoint para obtener las ventas
        .then(response => response.json())
        .then(data => {
            if (data.result_estado === 'ok') {
                const ventasTableBody = document.getElementById('ventasTableBody');
                ventasTableBody.innerHTML = ''; // Limpiar la tabla

                data.result_data.forEach(venta => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${venta.ventaid}</td>
                        <td>${venta.clientenombre}</td>
                        <td>${venta.metodo_pago_nombre}</td>
                        <td>${new Date(venta.ventafecha).toLocaleString()}</td>
                        <td>${venta.totalventa}</td>
                        <td><button class="btn btn-info" onclick="verDetalles(${venta.ventaid})">Ver Detalles</button></td>
                        <td><button class="btn btn-danger" onclick="eliminarVenta(${venta.ventaid})">Eliminar</button></td>
                    `;
                    ventasTableBody.appendChild(row);
                });
            }
        })
        .catch(error => console.error('Error al cargar las ventas:', error));
}

// Llamar a cargarVentas cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    cargarVentas();
});

// Función para mostrar detalles de la venta
function verDetalles(ventaid) {
    fetch(`/ventas/${ventaid}/detalles`) // Endpoint para obtener detalles de la venta
        .then(response => response.json())
        .then(data => {
            if (data.result_estado === 'ok') {
                const detallesTableBody = document.getElementById('detallesTableBody');
                detallesTableBody.innerHTML = ''; // Limpiar la tabla de detalles

                data.result_data.forEach(detalle => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${detalle.producto_nombre}</td> <!-- Cambiar a nombre -->
                        <td>${detalle.cantidad}</td>
                        <td>${detalle.precio_unitario}</td>
                        <td>${detalle.subtotal}</td>
                    `;
                    detallesTableBody.appendChild(row);
                });

                // Mostrar el modal
                $('#detallesModal').modal('show');
            }
        })
        .catch(error => console.error('Error al cargar los detalles de la venta:', error));
}

function eliminarVenta(ventaid) {
    if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
        fetch(`/ventas/${ventaid}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.result_estado === 'ok') {
                alert('Venta eliminada correctamente');
                cargarVentas(); // Recargar la tabla de ventas
            } else {
                alert('Error al eliminar la venta: ' + data.result_message);
            }
        })
        .catch(error => {
            console.error('Error al eliminar la venta:', error);
            alert('Error al eliminar la venta: ' + error.message);
        });
    }
}
