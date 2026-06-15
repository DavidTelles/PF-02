const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function auth(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não enviado" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Formato de token inválido. Use: Bearer <token>" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expirado. Faça login novamente." });
        }
        return res.status(401).json({ message: "Token inválido" });
    }
}

module.exports = auth;