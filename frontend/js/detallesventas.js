document.addEventListener('DOMContentLoaded', function () {
    cargarVentas();

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
                            <td>${venta.clientenombre}</td> <!-- Cambiar a nombre -->
                            <td>${venta.metodo_pago_nombre}</td> <!-- Cambiar a nombre -->
                            <td>${new Date(venta.ventafecha).toLocaleString()}</td>
                            <td>${venta.totalventa}</td>
                            <td><button class="btn btn-info" onclick="verDetalles(${venta.ventaid})">Ver Detalles</button></td>
                        `;
                        ventasTableBody.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error al cargar las ventas:', error));
    }
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
