const userModel = require("../models/userModel");
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await userModel.getUsersDB();
        res.status(200).json(users);
    } catch (error) {
        //logging del error
        console.error("Error en getUsers:", error);
        console.error("Mensaje de Error:", error.message);
        res
            .status(500)
            .json({ message: "Error al obtener los usuarios", error: error.message });
    }
};

// Actualizar estado de usuario
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        await userModel.updateStatusDB(id, status);
        res.status(200).json({ message: "Estado actualizado correctamente" });
    } catch (error) {
        //logging del error
        console.error("Error en updateStatus:", error);
        console.error("Mensaje de Error:", error.message);
        res
            .status(500)
            .json({ message: "Error al actualizar el estado", error: error.message });
    }
};

// Obtener productos favoritos de un usuario
const getLikeProducts = async (req, res) => {
    try {
        const token = req.cookies.userToken
        const secretKey = process.env.JWT_SECRET;
        const userDecode = jwt.verify(token, secretKey);
        const productsLikes = await userModel.getLikeProductsDB(userDecode.id);
        res.status(200).json(productsLikes);
    } catch (error) {
        //logging detallado del error
        console.error("Error en getLikeProducts:", error);
        console.error("Mensaje de Error:", error.message);
        res
            .status(500)
            .json({ message: "Error al obtener los likes", error: error.message });
    }
};

const getLikeProductsID = async (req, res)=>{
    try{
        const {id} = req.params
        const productsLikes = await userModel.getLikeProductsDB(id)
        res.status(200).send(productsLikes)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los likes", error: error.message });
    }
}

// Crear usuario (Cliente o Admin)
const createUser = async (req, res) => {
    try {
        const userData = { ...req.body };
        const user = await userModel.createUserDB(userData);

        if (!user) {
            return res.status(400).json({ message: "No se pudo crear el usuario" });
        }

        const { password, ...userWithoutPassword } = user;

        if (user.rol === "admin") {
            // 🔹 Generar token temporal para establecer la contraseña
            const token = jwt.sign(
                { id: user.id, correo: user.email, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: "15m" } // Expira en 15 minutos
            );

            res.cookie("userToken", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 900000, // 15 minutos
            });

            return res.status(201).json({
                message:
                    "Usuario admin creado. Redirigiendo a establecer contraseña.",
                data: userWithoutPassword,
                token,
                redirectUrl: `/create-password/${user.id}`,
            });
        }

        res.status(201).json({
            message: `✅ Usuario creado con rol: ${user.rol}`,
            data: userWithoutPassword,
        });
    } catch (error) {
        //logging del error
        console.error("Error en createUser:", error);
        console.error("Mensaje de Error:", error.message);
        res
            .status(500)
            .json({ message: "Error al crear usuario", error: error.message });
    }
};

// Crear contraseña para admin
const createAdminPassword = async (req, res) => {
    try {
        const { userId, password } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ message: "Faltan datos requeridos." });
        }

        const updatedUser = await userModel.createAdminPasswordDB(userId, password);
        if (!updatedUser) {
            return res
                .status(400)
                .json({ message: "No se pudo actualizar la contraseña." });
        }

        res.status(200).json({
            message: "✅ Contraseña establecida exitosamente",
            user: updatedUser,
        });
    } catch (error) {
        //logging del error
        console.error("Error en createAdminPassword:", error);
        console.error("Mensaje de Error:", error.message);
        res.status(500).json({
            message: "Error al establecer la contraseña",
            error: error.message,
        });
    }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findByIdDB(id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json(user);
    } catch (error) {
        // logging del error
        console.error("Error en getUserById:", error);
        console.error("Mensaje de Error:", error.message);
        res
            .status(500)
            .json({ message: "Error al obtener el usuario", error: error.message });
    }
};

// 🔑 Iniciar sesión
const loginUser = async (req, res) => {
    try {
        const { correo, password } = req.body;

        const rest = await userModel.findByEmailDB(correo);
        const user = rest;

        if (!user) {
            return res.status(401).json({ message: "❌ Credenciales incorrectas" });
        }
        if(user.status === false){
            return res.status(401).json({ message: "❌ usuario desactivado, contactese con el administrador" });
        }
        const isMatch = await userModel.validatePasswordDB(password, user.password);

        if (!isMatch) {
            console.log("❌ Contraseña incorrecta");
            return res.status(401).json({ message: "❌ Credenciales incorrectas" });
        }

        console.log("✅ Contraseña válida, iniciando sesión...");

        // Generar token
        const token = jwt.sign(
            { id: user.id, correo: user.correo, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("userToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            path: "/",
            maxAge: 3600000,
        });

        res.status(200).json({
            message: "✅ Login exitoso",
            token,
            user: {
                id: user.id,
                correo: user.correo,
                rol: user.rol,
                nombre: user.nombre,
            },
            authenticated: true,
        });
    } catch (error) {
        // logging del error
        console.error("Error en loginUser:", error);
        console.error("Mensaje de Error:", error.message);
        res.status(500).json({ error: "Error en el inicio de sesión", error: error.message }); // Añadido error.message
    }
};


// 🔒 Verificar autenticación del usuario
const verifyAuth = async (req, res) => {
    try {

        const user = await userModel.findByIdDB(req.user.id);
        if (!user) {
            return res
                .status(401)
                .json({ authenticated: false, message: "Usuario no encontrado" });
        }
        res.status(200).json({ authenticated: true, user });
    } catch (error) {
        //logging del error
        console.error("Error en verifyAuth:", error);
        console.error("Mensaje de Error:", error.message);
        res.status(401).json({ // Mantenemos 401 porque es problema de autenticación
            authenticated: false,
            message: "Token inválido o expirado",
            error: error.message,
        });
    }
};

// 🚪 Cerrar sesión
const logout = async (req, res) => {
    try {
        res.clearCookie("userToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            path: "/",
        });
        console.log("sesion cerrada")
        res.status(200).json({ message: "Sesión cerrada exitosamente" });
    } catch (error) {
        //logging del error
        console.error("Error en logout:", error);
        console.error("Mensaje de Error:", error.message);
        res
            .status(500)
            .json({ message: "Error al cerrar sesión", error: error.message });
    }
};
const getMyUser = async(req, res)=>{
    try{
        const token = req.cookies.userToken
        if (!token) {
            return res.status(401).json({ message: "No hay token en la cookie" });
          }

        const secretKey = process.env.JWT_SECRET;
        const userDecode = jwt.verify(token, secretKey);
        
        const usuario = await userModel.findByIdDB(userDecode.id)
        res.status(200).send(usuario)
    }catch(error){
        res.status(500).json({ message: "Error al obtener el usuario", error: error.message });  
    }
}
const updateMyUser = async(req, res)=>{
    try{
        const {id, name, email, direction, city, phone} = req.body

        await userModel.updateMyUserDB(id, name, email, direction, city, phone)
        res.status(200).json({message: "usuario actualizado"})
    }catch(error){
        res.status(500).json({ message: "Error al actualizar su usuario", error: error.message });  
    }
}
const userLike = async(req, res)=>{
    try{
        const token = req.cookies.userToken
        const {product_id} = req.body.data
        const secretKey = process.env.JWT_SECRET;
        const userDecode = jwt.verify(token, secretKey);

        await userModel.userLikeDB(userDecode.id, product_id)
        res.status(201).json({message: "Like Guardado"})
    }catch(error){
        res.status(500).json({ message: "No se pudo dar Like", error: error.message });  
    }
}
const userDisLike = async(req, res)=>{
    try{
        const token = req.cookies.userToken
        const {product_id} = req.body
        const secretKey = process.env.JWT_SECRET;
        const userDecode = jwt.verify(token, secretKey);

        await userModel.userDisLikeDB(userDecode.id, product_id)
        res.status(201).json({message: "Like Eliminado"})
    }catch(error){
        res.status(500).json({ message: "No se pudo eliminar el Like", error: error.message });  
    }
}
const getLikeProductsFront = async(req, res)=>{
    try{
        const token = req.cookies.userToken
        const secretKey = process.env.JWT_SECRET;
        const userDecode = jwt.verify(token, secretKey);

        const productsLikes = await userModel.getLikeProductsFrontDB(userDecode.id)
        res.status(200).send(productsLikes)
    }catch(error){
        res.status(500).json({ message: "No se pudieron obtener los likes", error: error.message });  
    }
}

module.exports = {
    getUsers,
    updateStatus,
    getLikeProducts,
    createUser,
    createAdminPassword,
    getUserById,
    loginUser,
    verifyAuth,
    logout,
    getMyUser,
    updateMyUser,
    userLike,
    userDisLike,
    getLikeProductsFront,
    getLikeProductsID,
};
