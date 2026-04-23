const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port:process.env.DB_PORT
});

connection.connect((err) => {
    if(err) {
        console.error("Erro ao conectar no Banco de Dados: ", err);
        return;
    } else {
        console.log("Conexão bem sucedida");
    };
});

module.exports = connection;