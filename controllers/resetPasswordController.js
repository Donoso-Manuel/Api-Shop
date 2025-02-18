const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const crypto = require("crypto")
const tokenModel = require("../models/tokenModel");
require("dotenv").config();

// se instancia correo
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// funcion para crear token de reset password
const requestResetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findByEmailDB(email);
        if (!user) return res.status(404).json({ message: "correo no encontrado" });

        const token = crypto.randomBytes(32).toString("hex");
        await tokenModel.resetToken(user.id, token);

        const urlReset = `${process.env.VITE_RESET_URL}${token}`;
        await transport.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "recuperacion de contraseña",
            text: `Para restablecer contraseña, haz clic en el siguiente enlace: ${urlReset}`,
        });

        res.json({ message: "Se enviaron instrucciones a su correo" });
    } catch (error) {
        // logging del error
        console.error("Error en requestResetPassword:", error);
        console.error("Mensaje de Error:", error.message);
        res.status(500).json({ message: "Error al procesar la solicitud", error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const tokenData = await tokenModel.findTokenReset(token);
        if (!tokenData) {
            return res.status(400).json({ message: "Token Inválido o Expirado" });
        }

        const passwordCrypt = await bcrypt.hash(newPassword, 10);

        await userModel.updatePasswordDB(tokenData.user_id, passwordCrypt);

        await tokenModel.deleteToken(token);

        res.json({ message: "Contraseña actualizada con éxito" });
    } catch (error) {
        // logging del error
        console.error("Error en resetPassword:", error);
        console.error("Mensaje de Error:", error.message);
        res.status(500).json({ message: "Error al procesar la solicitud", error: error.message });
    }
};

module.exports = { resetPassword, requestResetPassword };
