const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    try {
        const token = req.cookies.userToken;
        console.log("token recibido", token)
        if (!token) {
            return res.status(401).json({ message: "Acceso denegado: No hay token" });
        }

        const secretKey = process.env.JWT_SECRET;
        const userDecode = jwt.verify(token, secretKey);
        console.log("token decodificado", userDecode)

        if (userDecode.role !== 'admin') {
            return res.status(403).json({ message: "Acceso denegado: No tienes permisos de administrador" });
        }
        req.user = userDecode;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado", error: error.message });
    }
};

module.exports = verifyAdmin;