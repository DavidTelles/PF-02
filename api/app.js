const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "script-scr": ["'self'"],
            "form-action": ["'self'"],
            },
        },
    xFrameOptions: { action: "deny" },
    },
));

app.use(cors());
app.use(express.json());

const userRouters = require("./routes/users");
app.use("/users", userRouters);

app.get("/", (req, res) => {
    res.send("API funcionando");
});

module.exports = app;