const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function auth(req, res, next) {
<<<<<<< HEAD
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: 'Token não fornecido'
        });
=======

    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Token não enviado" });
>>>>>>> 3e80fead513f53bb92226274a65201b99d93d24a
    }

    const token = authHeader.split(' ')[1];

<<<<<<< HEAD
=======
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

>>>>>>> 3e80fead513f53bb92226274a65201b99d93d24a
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch {
        return res.status(401).json({
            message: 'Token inválido'
        });
    }
}

module.exports = auth;