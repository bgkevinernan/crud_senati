const express = require("express");
const app = express();
const pool = require("./db");
const PORT = 3000;

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error("Error de sintaxis en el JSON recibido:", err.message);
        return res.status(400).json({ 
            error: "JSON mal formado. Revisa que no tengas comillas extras al inicio o final." 
        });
    }
    next();
});

app.get("/", (req, res) => {
    res.send("Conectandose a una base de datos MySQL");
});

// Obtener todos los productos
app.get("/estudiantes", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM estudiantes");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener estudiantes: ", error.message);
        res.status(500).json({ error: "Error al obtener estudiantes" });
    }
});

// Obtener un producto por ID
app.get("/estudiantes/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const [rows] = await pool.query("SELECT * FROM estudiantes WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener estudiante: ", error.message);
        res.status(500).json({ error: "Error al obtener el estudiante" });
    }
});

app.post("/estudiantes", async (req, res) => {
    const { nombre, apellido, fecha_nacimiento, correo } = req.body;

    // Validación de campos
    if (!nombre || !apellido || !fecha_nacimiento || !correo) {
        return res.status(400).json({
            error: "Los campos nombres, apellidos, fecha_nacimiento y correo son obligatorios"
        });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO estudiantes (nombre, apellido, fecha_nacimiento, correo) VALUES (?, ?, ?, ?)",
            [nombre, apellido, fecha_nacimiento, correo]
        );

        const nuevoProducto = {
            id: result.insertId,
            nombre,
            apellido,
            fecha_nacimiento,
            correo,
        };

        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error("Error al crear el estudiante: ", error.message);
        res.status(500).json({ error: "Error al crear el estudiante" });
    }
});

app.put("/estudiantes/:id", async(req, res) =>{
    const id = parseInt(req.params.id, 10);
    const {nombre, apellido, fecha_nacimiento, correo}=req.body;
    if(!nombre || !apellido || !fecha_nacimiento || !correo){
        return res.status(400).json({
            error: "Los campos nombre, apellido, fecha_nacimiento y correo"
        });
    }
    try{
        const[result] = await pool.query(
            "update estudiantes set nombre=?, apellido=?, fecha_nacimiento=?, correo=? where id=?",
            [nombre, apellido, fecha_nacimiento, correo, id]
        )
        if(result.affectedRows===0){
            return res.status(404).json({error: "Estudiante no encontrado"})
        }
        const estudianteActualizado={
            id,
            nombre,
            apellido,
            fecha_nacimiento,
            correo,
        };

        res.json(estudianteActualizado)
    }
    catch(error){
        console.error("Error al actualizar el estudiante", error.message);
        res.status(500).json({error:"Error al actualzar el estudiante"})
    }
});

app.delete("/estudiantes/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const [result] = await pool.query("DELETE FROM estudiantes WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }

        res.json({ mensaje: `Estudiante con ID ${id} eliminado correctamente` });
    } catch (error) {
        console.error("Error al eliminar el estudiante:", error.message);
        res.status(500).json({ error: "Error al eliminar el estudiante" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});