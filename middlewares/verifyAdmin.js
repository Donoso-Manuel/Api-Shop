const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
    try {
        console.log('Cookies: ', req.cookies);
        const token = req.cookies.userToken;
        if (!token) {
            return res.status(401).json({ message: "Acceso denegado: No hay token" });
        }

        const secretKey = process.env.JWT_SECRET;
        const userDecode = jwt.verify(token, secretKey);


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