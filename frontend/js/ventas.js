document.addEventListener('DOMContentLoaded', function () {
    // Cargar clientes y productos al cargar la página
    cargarClientes();
    cargarProductos();
    cargarMetodosPago();

    // Referencias a los elementos del formulario
    const clienteSelect = document.getElementById('cliente');
    const metodoPagoSelect = document.getElementById('metodoPago');
    const productoSelect = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
    const precioTotalInput = document.getElementById('precioTotal');
    const productosVentaTableBody = document.getElementById('productosVentaTableBody');
    const totalVentaElement = document.getElementById('totalVenta');
    const finalizarVentaBtn = document.getElementById('finalizarVenta');

    let productosVenta = [];
    let totalVenta = 0;

    // Escuchar el cambio en el campo de cantidad para calcular el precio total
    cantidadInput.addEventListener('input', actualizarPrecioTotal);

    // Función para cargar clientes desde el servidor
    function cargarClientes() {
        fetch('/clientes')
            .then(response => response.json())
            .then(data => {
                if (data.result_estado === 'ok') {
                    data.result_data.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.clienteid;
                        option.textContent = cliente.clientenombre;
                        clienteSelect.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Error al cargar los clientes:', error));
    }

    // Función para cargar productos desde el servidor
    function cargarProductos() {
        fetch('/productos')
            .then(response => response.json())
            .then(data => {
                if (data.result_estado === 'ok') {
                    data.result_data.forEach(producto => {
                        const option = document.createElement('option');
                        option.value = producto.productoid;
                        option.textContent = `${producto.productonombre} - $${producto.productoprecio}`;
                        productoSelect.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Error al cargar los productos:', error));
    }

    // Nueva función para cargar métodos de pago desde el servidor
    function cargarMetodosPago() {
        fetch('/metodos-pago')
            .then(response => response.json())
            .then(data => {
                if (data.result_estado === 'ok') {
                    data.result_data.forEach(metodo => {
                        const option = document.createElement('option');
                        option.value = metodo.metodo_pago_id;
                        option.textContent = metodo.descripcion;
                        metodoPagoSelect.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Error al cargar los métodos de pago:', error));
    }

    // Función para actualizar el precio total del producto seleccionado
    function actualizarPrecioTotal() {
        const productoSeleccionado = productoSelect.options[productoSelect.selectedIndex].text;
        const precioProducto = productoSeleccionado.split(' - $')[1];
        const cantidad = cantidadInput.value;

        if (precioProducto && cantidad) {
            const total = parseFloat(precioProducto) * parseInt(cantidad);
            precioTotalInput.value = total.toFixed(2);
        }
    }

    // Función para manejar la venta y añadir productos a la tabla
    document.getElementById('formRealizarVenta').addEventListener('submit', function (e) {
        e.preventDefault();

        const productoSeleccionado = productoSelect.options[productoSelect.selectedIndex].text;
        const productoId = productoSelect.value;
        const cantidad = cantidadInput.value;
        const precioUnitario = productoSeleccionado.split(' - $')[1];

        if (cantidad > 0 && precioUnitario) {
            const subtotal = parseFloat(precioUnitario) * parseInt(cantidad);

            productosVenta.push({
                productoid: productoId,
                producto: productoSeleccionado,
                cantidad: cantidad,
                precioUnitario: precioUnitario,
                subtotal: subtotal
            });

            totalVenta += subtotal;
            totalVentaElement.textContent = totalVenta.toFixed(2);

            // Actualizar la tabla con los productos añadidos
            actualizarTablaProductosVenta();
        }
    });

    // Función para actualizar la tabla de productos en la venta
    function actualizarTablaProductosVenta() {
        productosVentaTableBody.innerHTML = '';

        productosVenta.forEach((producto, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.producto}</td>
                <td>${producto.cantidad}</td>
                <td>${producto.precioUnitario}</td>
                <td>${producto.subtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger" data-index="${index}">Eliminar</button></td>
            `;
            productosVentaTableBody.appendChild(row);
        });

        // Añadir eventos para eliminar productos
        document.querySelectorAll('.btn-danger').forEach(button => {
            button.addEventListener('click', eliminarProductoDeVenta);
        });
    }

    // Función para eliminar un producto de la venta
    function eliminarProductoDeVenta(e) {
        const index = e.target.dataset.index;
        totalVenta -= productosVenta[index].subtotal;
        productosVenta.splice(index, 1);
        totalVentaElement.textContent = totalVenta.toFixed(2);
        actualizarTablaProductosVenta();
    }

    // Función para finalizar la venta y enviar los datos al servidor
    finalizarVentaBtn.addEventListener('click', function () {
        const clienteId = clienteSelect.value;
        const metodoPagoId = metodoPagoSelect.value;

        if (productosVenta.length > 0 && clienteId && metodoPagoId) {
            // Crear el objeto de la venta
            const venta = {
                clienteid: clienteId,
                metodopagoid: metodoPagoId,
                ventafecha: new Date().toISOString().slice(0, 10), // Añadir fecha de la venta
                totalventa: totalVenta,
                productos: productosVenta
            };

            // Enviar los datos al servidor
            fetch('/ventas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(venta)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.result_estado === 'ok') {
                        alert('Venta realizada con éxito');
                        // Resetear formulario y tabla
                        productosVenta = [];
                        totalVenta = 0;
                        totalVentaElement.textContent = '0.00';
                        actualizarTablaProductosVenta();
                    } else {
                        alert('Error al realizar la venta: ' + data.result_message);
                    }
                })
                .catch(error => console.error('Error al realizar la venta:', error));
        } else {
            alert('Complete todos los campos y agregue al menos un producto.');
        }
    });
});
