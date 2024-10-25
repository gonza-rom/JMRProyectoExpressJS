// Importa la clase Pool del módulo 'pg' (PostgreSQL) para manejar conexiones de base de datos.
const { Pool } = require("pg");

// Carga las variables de entorno desde un archivo .env. Esto es útil para almacenar credenciales de forma segura.
require("dotenv").config();

// Imprime el usuario y contraseña de PostgreSQL que se cargaron desde el archivo .env para verificar que se hayan cargado correctamente.
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

// Crea un nuevo objeto pool, que es un conjunto de conexiones a la base de datos PostgreSQL. Esto permite ejecutar consultas a la base de datos.
const pool = new Pool({
    user: "postgres", // Usuario de PostgreSQL con el que te conectas.
    host: "localhost", // Dirección del servidor de base de datos, en este caso, está en tu máquina local.
    database: "jmr2", // Nombre de la base de datos a la que te conectas.
    password: "1234", // Contraseña del usuario de PostgreSQL para autenticarse.
    port: 5432, // Puerto por defecto en el que PostgreSQL escucha conexiones.
});

// Conexión al pool de la base de datos. pool.connect() devuelve un cliente y la función release() libera la conexión cuando termina su uso.
pool.connect((err, client, release) => {
    if (err) {
        // Si hay un error al intentar conectarse a la base de datos, lo muestra en la consola.
        return console.error("Error al conectar a PostgreSQL", err.stack);
    }
    // Si la conexión fue exitosa, imprime un mensaje en la consola.
    console.log("Conectado a PostgreSQL");
    // Libera la conexión al pool cuando ya no se necesita.
});

// Importa el módulo 'express' para manejar rutas HTTP.
const express = require("express");

// Crea una instancia del router de Express. Esto permite manejar las rutas de la aplicación.
const router = express.Router();

// Aquí es donde agregarías las rutas y la lógica de las mismas (aún no está incluido en este código).

///////////////////////////////////////////////////// PRODUCTOS ///////////////////////////////////////////////////////////////////
//Mostrar los productos
router.get("/productos", async (req, res) => {
    try {
        // Sentencia SQL para obtener todos los productos
        const sentenciaSQL = "SELECT p.productoid, p.productonombre, p.productocb,p.productoprecio,p.productosstock, c.categorianombre FROM productos p JOIN categorias c ON p.categoriaid = c.categoriaid;"

        // Ejecutar la consulta
        const resultado = await pool.query(sentenciaSQL);

        // Si hay productos, devolverlos
        if (resultado.rowCount > 0) {
            res.json({
                result_estado: "ok",
                result_message: "Productos recuperados exitosamente",
                result_rows: resultado.rowCount,
                result_data: resultado.rows,
            });
        } else {
            // Si no hay productos, devolver un mensaje indicando que no hay datos
            res.json({
                result_estado: "ok",
                result_message: "No se encontraron productos",
                result_rows: 0,
                result_data: [],
            });
        }
    } catch (error) {
        // Si hay un error en la ejecución de la consulta, devolver un error
        res.json({
            result_estado: "error",
            result_message: error.message,
            result_rows: 0,
            result_data: [],
        });
    }
});

// Ruta para insertar nuevos productos
router.post('/productos', async (req, res) => {
    try {
        const { productocb, productonombre, productoprecio, productosstock ,categoriaid } = req.body;

        // Sentencia SQL para insertar un nuevo producto
        const sentenciaSQL = `
                    INSERT INTO productoS (productocb,productonombre, productoprecio, productosstock ,categoriaid)
                    VALUES ($1, $2, $3, $4 , $5) RETURNING *;
                `;

        const resultado = await pool.query(sentenciaSQL, [productocb, productonombre, productoprecio, productosstock , categoriaid]);

        // Devolver el producto agregado
        res.json({
            result_estado: 'ok',
            result_message: 'Producto agregado exitosamente',
            result_data: resultado.rows[0]
        });
    } catch (error) {
        res.json({
            result_estado: 'error',
            result_message: error.message,
            result_data: []
        });
    }
});

// Ruta para obtener el producto por id
router.get('/productosid/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10); // Convertimos el ID a número

    try {
        const result = await pool.query('SELECT * FROM productos WHERE productoid = $1', [productId]);

        if (result.rows.length > 0) {
            res.json({ result_estado: 'ok', result_data: result.rows[0] });
        } else {
            res.status(404).json({ result_estado: 'error', result_message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ result_estado: 'error', result_message: 'Error en el servidor' });
    }
});

// Ruta para actualizar el producto
router.put('/productos/:id', async (req, res) => {
    const idProducto = parseInt(req.params.id, 10); // Convertimos el ID a número
    const { productocb, productonombre, productoprecio, productosstock, categoriaid } = req.body;

    // Verificamos que los datos no sean nulos
    if (!productocb || !productonombre || !productoprecio || !productosstock || !categoriaid) {
        return res.status(400).json({ result_estado: 'error', result_message: 'Todos los campos son obligatorios' });
    }

    try {
        const query = `
            UPDATE productos 
            SET productocb = $1, productonombre = $2, productoprecio = $3, productosstock = $4, categoriaid = $5 
            WHERE productoid = $6
        `;

        const values = [productocb, productonombre, productoprecio, productosstock, categoriaid, idProducto];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ result_estado: 'error', result_message: 'Producto no encontrado' });
        }

        res.json({ result_estado: 'ok', result_message: 'Producto actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ result_estado: 'error', result_message: 'Error al actualizar el producto' });
    }
});


// Ruta para eliminar un producto por ID
router.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params; // ID del producto que vamos a eliminar
        console.log(id)
        // Sentencia SQL para eliminar el producto
        const sentenciaSQL = `
            DELETE FROM productos
            WHERE productoid = $1 RETURNING *;
        `;

        // Ejecutar la consulta SQL para eliminar el producto
        const resultado = await pool.query(sentenciaSQL, [id]);

        // Verificar si el producto fue encontrado y eliminado
        if (resultado.rowCount > 0) {
            res.json({
                result_estado: 'ok',
                result_message: 'Producto eliminado exitosamente',
                result_data: resultado.rows[0] // Aquí puedes retornar información del producto eliminado si es necesario
            });
        } else {
            res.status(404).json({
                result_estado: 'error',
                result_message: 'Producto no encontrado',
                result_data: []
            });
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({
            result_estado: 'error',
            result_message: 'Error interno del servidor',
            result_data: []
        });
    }
});

// Ruta para obtener las categorias por ID
router.get('/categorias', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT categoriaid, categorianombre FROM categorias');

        res.json({
            result_estado: 'ok',
            result_message: 'Categorías recuperadas exitosamente',
            result_data: resultado.rows
        });
    } catch (error) {
        console.error('Error al recuperar las categorías:', error);
        res.status(500).json({
            result_estado: 'error',
            result_message: 'Error interno del servidor',
            result_data: []
        });
    }
});

///////////////////////////////////////////////////////////////////// CLIENTES ///////////////////////////////////////////////////////////////////////////

// Ruta para obtener los clientes
router.get("/clientes", async (req, res) => {
    try {
        // Sentencia SQL para obtener todos los productos
        const sentenciaSQL = "SELECT * FROM clientes";

        // Ejecutar la consulta
        const resultado = await pool.query(sentenciaSQL);

        // Si hay productos, devolverlos
        if (resultado.rowCount > 0) {
            res.json({
                result_estado: "ok",
                result_message: "Productos recuperados exitosamente",
                result_rows: resultado.rowCount,
                result_data: resultado.rows,
            });
        } else {
            // Si no hay productos, devolver un mensaje indicando que no hay datos
            res.json({
                result_estado: "ok",
                result_message: "No se encontraron productos",
                result_rows: 0,
                result_data: [],
            });
        }
    } catch (error) {
        // Si hay un error en la ejecución de la consulta, devolver un error
        res.json({
            result_estado: "error",
            result_message: error.message,
            result_rows: 0,
            result_data: [],
        });
    }
});

// Ruta para insertar nuevos clientes
router.post('/clientes', async (req, res) => {
    try {
        const { clientenombre, clientecuit, clienteemail ,clientetelefono , clientedireccion } = req.body;

        // Sentencia SQL para insertar un nuevo producto
        const sentenciaSQL = `
                    INSERT INTO clientes (clientenombre, clientecuit, clienteemail ,clientetelefono , clientedireccion)
                    VALUES ($1, $2, $3, $4 , $5) RETURNING *;
                `;

        const resultado = await pool.query(sentenciaSQL, [clientenombre, clientecuit, clienteemail ,clientetelefono , clientedireccion]);

        // Devolver el producto agregado
        res.json({
            result_estado: 'ok',
            result_message: 'Cliente agregado exitosamente',
            result_data: resultado.rows[0]
        });
    } catch (error) {
        res.json({
            result_estado: 'error',
            result_message: error.message,
            result_data: []
        });
    }
});

// Ruta para obtener el cliente por id
router.get('/clientesid/:id', async (req, res) => {
    const clienteId = parseInt(req.params.id, 10); // Convertimos el ID a número

    try {
        const result = await pool.query('SELECT * FROM clientes WHERE clienteid = $1', [clienteId]);

        if (result.rows.length > 0) {
            res.json({ result_estado: 'ok', result_data: result.rows[0] });
        } else {
            res.status(404).json({ result_estado: 'error', result_message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ result_estado: 'error', result_message: 'Error en el servidor' });
    }
});

// Ruta para actualizar el producto
router.put('/clientes/:id', async (req, res) => {
    const idCliente = parseInt(req.params.id, 10); // Convertimos el ID a número
    const { clientenombre, clientecuit, clienteemail , clientetelefono , clientedireccion,  } = req.body;

    // Verificamos que los datos no sean nulos
    if (!clientenombre || !clientecuit || !clienteemail || !clientetelefono || !clientedireccion) {
        return res.status(400).json({ result_estado: 'error', result_message: 'Todos los campos son obligatorios' });
    }

    try {
        const query = `
            UPDATE clientes 
            SET clientenombre = $1, clientecuit = $2, clienteemail = $3, clientetelefono = $4, clientedireccion = $5 
            WHERE clienteid = $6
        `;

        const values = [clientenombre, clientecuit, clienteemail, clientetelefono, clientedireccion, idCliente];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ result_estado: 'error', result_message: 'Cliente no encontrado' });
        }

        res.json({ result_estado: 'ok', result_message: 'Cliente actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el Cliente:', error);
        res.status(500).json({ result_estado: 'error', result_message: 'Error al actualizar el Cliente' });
    }
});

// Ruta para eliminar los clientes
router.delete('/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params; // ID del producto que vamos a eliminar
        console.log(id)
        // Sentencia SQL para eliminar el producto
        const sentenciaSQL = `
            DELETE FROM clientes
            WHERE clienteid = $1 RETURNING *;
        `;

        // Ejecutar la consulta SQL para eliminar el producto
        const resultado = await pool.query(sentenciaSQL, [id]);

        // Verificar si el producto fue encontrado y eliminado
        if (resultado.rowCount > 0) {
            res.json({
                result_estado: 'ok',
                result_message: 'Cliente eliminado exitosamente',
                result_data: resultado.rows[0] // Aquí puedes retornar información del producto eliminado si es necesario
            });
        } else {
            res.status(404).json({
                result_estado: 'error',
                result_message: 'Cliente no encontrado',
                result_data: []
            });
        }
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({
            result_estado: 'error',
            result_message: 'Error interno del servidor',
            result_data: []
        });
    }
});

///////////////////////////////////////////////////////////////////// VENTAS ///////////////////////////////////////////////////////////////////////////
router.get("/metodos-pago", async (req, res) => {
    try {
        // Sentencia SQL para obtener los métodos de pago
        const sentenciaSQL = "SELECT metodo_pago_id, descripcion FROM metodo_pago";

        // Ejecutar la consulta
        const resultado = await pool.query(sentenciaSQL);

        // Si hay métodos de pago, devolverlos
        if (resultado.rowCount > 0) {
            res.json({
                result_estado: "ok",
                result_message: "Métodos de pago recuperados exitosamente",
                result_rows: resultado.rowCount,
                result_data: resultado.rows,
            });
        } else {
            // Si no hay métodos de pago, devolver un mensaje indicando que no hay datos
            res.json({
                result_estado: "ok",
                result_message: "No se encontraron métodos de pago",
                result_rows: 0,
                result_data: [],
            });
        }
    } catch (error) {
        // Si hay un error en la ejecución de la consulta, devolver un error
        res.json({
            result_estado: "error",
            result_message: error.message,
            result_rows: 0,
            result_data: [],
        });
    }
});

// Obtener todas las ventas
router.get('/ventas', async (req, res) => {
    try {
        const sentenciaSQL = `
            SELECT 
                v.ventaid,
                c.clientenombre AS clientenombre,
                mp.descripcion AS metodo_pago_nombre,
                v.ventafecha,
                v.totalventa
            FROM 
                venta v
            JOIN 
                clientes c ON v.clienteid = c.clienteid
            JOIN 
                metodo_pago mp ON v.metodopagoid = mp.metodo_pago_id
            ORDER BY 
                v.ventafecha DESC;
        `;

        const resultado = await pool.query(sentenciaSQL);

        if (resultado.rowCount > 0) {
            res.json({
                result_estado: "ok",
                result_message: "Ventas recuperadas exitosamente",
                result_rows: resultado.rowCount,
                result_data: resultado.rows,
            });
        } else {
            res.json({
                result_estado: "ok",
                result_message: "No se encontraron ventas",
                result_rows: 0,
                result_data: [],
            });
        }
    } catch (error) {
        res.json({
            result_estado: "error",
            result_message: error.message,
            result_rows: 0,
            result_data: [],
        });
    }
});

// Obtener detalles de una venta
router.get('/ventas/:ventaid/detalles', async (req, res) => {
    const ventaId = req.params.ventaid;
    try {
        const sentenciaSQL = `
            SELECT 
                dv.productoid, 
                p.productonombre AS producto_nombre, -- Asegúrate de que este sea el nombre de la columna
                dv.cantidad, 
                dv.precio_unitario, 
                dv.subtotal
            FROM 
                detalle_venta dv
            JOIN 
                productos p ON dv.productoid = p.productoid
            WHERE 
                dv.ventaid = $1;
        `;
        const resultado = await pool.query(sentenciaSQL, [ventaId]);

        if (resultado.rowCount > 0) {
            res.json({
                result_estado: "ok",
                result_message: "Detalles de la venta recuperados exitosamente",
                result_rows: resultado.rowCount,
                result_data: resultado.rows,
            });
        } else {
            res.json({
                result_estado: "ok",
                result_message: "No se encontraron detalles para esta venta",
                result_rows: 0,
                result_data: [],
            });
        }
    } catch (error) {
        res.json({
            result_estado: "error",
            result_message: error.message,
            result_rows: 0,
            result_data: [],
        });
    }
});

// Endpoint para realizar una venta
router.post('/ventas', async (req, res) => {
    const { clienteid, metodopagoid, ventafecha, totalventa, productos } = req.body;

    try {
        // Comienza una transacción
        await pool.query('BEGIN');

        // Insertar la venta en la tabla 'ventas'
        const insertarVentaSQL = `
            INSERT INTO venta (clienteid, metodopagoid, ventafecha, totalventa)
            VALUES ($1, $2, $3, $4) RETURNING ventaid; 
        `;

        const resultadoVenta = await pool.query(insertarVentaSQL, [clienteid, metodopagoid, ventafecha, totalventa]);
        const ventaId = resultadoVenta.rows[0].ventaid; // Obtenemos el ID de la venta insertada

        // Insertar cada producto de la venta y actualizar el stock
        const insertarProductoSQL = `
            INSERT INTO detalle_venta (ventaid, productoid, cantidad, precio_unitario)
            VALUES ($1, $2, $3, $4);
        `;
        
        const actualizarStockSQL = `
            UPDATE productos
            SET productosstock = productosstock - $1
            WHERE productoid = $2;
        `;

        for (const producto of productos) {
            // Insertar en detalle_venta
            await pool.query(insertarProductoSQL, [
                ventaId,
                producto.productoid,
                producto.cantidad,
                producto.precioUnitario,
            ]);

            // Actualizar el stock del producto
            await pool.query(actualizarStockSQL, [
                producto.cantidad,
                producto.productoid
            ]);
        }

        // Commit de la transacción
        await pool.query('COMMIT');

        // Respuesta exitosa
        res.json({
            result_estado: 'ok',
            result_message: 'Venta realizada con éxito',
            result_data: {
                venta_id: ventaId,
                totalventa: totalventa
            }
        });
    } catch (error) {
        // Si hay un error, hacemos rollback
        await pool.query('ROLLBACK');
        console.error('Error al realizar la venta:', error);
        res.json({
            result_estado: 'error',
            result_message: error.message,
            result_data: []
        });
    }
});

// Endpoint para eliminar una venta
router.delete('/ventas/:id', async (req, res) => {
    const idVenta = parseInt(req.params.id, 10); // Convertimos el ID a número

    try {
        // Obtener los detalles de la venta para actualizar el stock
        const detallesQuery = 'SELECT productoid, cantidad FROM detalle_venta WHERE ventaid = $1';
        const detallesResult = await pool.query(detallesQuery, [idVenta]);

        if (detallesResult.rowCount === 0) {
            return res.status(404).json({ result_estado: 'error', result_message: 'Venta no encontrada' });
        }

        // Actualizar el stock para cada producto vendido
        for (const detalle of detallesResult.rows) {
            const { productoid, cantidad } = detalle; // Asegúrate de que el nombre de la propiedad sea correcto
            const updateStockQuery = `UPDATE productos SET productosstock = productosstock + $1 WHERE productoid = $2`;
            await pool.query(updateStockQuery, [cantidad, productoid]); // Cambié 'producto_id' por 'productoid'
        }

        // Eliminar los detalles de la venta
        await pool.query(`DELETE FROM detalle_venta WHERE ventaid = $1`, [idVenta]);

        // Eliminar la venta
        const deleteVentaQuery = `DELETE FROM venta WHERE ventaid = $1`;
        await pool.query(deleteVentaQuery, [idVenta]);

        res.json({ result_estado: 'ok', result_message: 'Venta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la venta:', error);
        res.status(500).json({ result_estado: 'error', result_message: 'Error al eliminar la venta' });
    }
});



module.exports = router;
