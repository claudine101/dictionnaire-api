const express = require("express");
const https = require('https')
const http = require('http')
const fs = require('fs');
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const ip = require('ip')
const fileUpload = require("express-fileupload");
const RESPONSE_CODES = require("./constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("./constants/RESPONSE_STATUS");
const app = express();
const bindUser = require("./middleware/bindUser");
dotenv.config({ path: path.join(__dirname, "./.env") });

const { Server } = require("socket.io");
const ecommerceRouter = require("./routes/ecommerce/ecommerceRouter");
const authRouter = require("./routes/auth/authRouter");

const authRidersRouter = require("./routes/auth/auth_riders.router");
const authDriversRouter = require("./routes/auth/auth_drivers.router");

const serviceRouter = require("./routes/service/serviceRouter");
const partenaireRouter = require("./routes/partenaire/partenaireRouter");
const restoRouter = require("./routes/resto/restoRouter");
const service_personneRouter = require("./routes/service_personne/service_personneRouter");
const paymentRouter = require("./routes/payment/paymentRouter");

app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(fileUpload());

app.all('*', bindUser)
app.use('/auth', authRouter)
app.use('/authRiders', authRidersRouter)
app.use('/authDrivers', authDriversRouter)


app.use('/ecommerce', ecommerceRouter)
app.use('/resto', restoRouter)
app.use('/partenaires', partenaireRouter)
app.use('/services', serviceRouter)
app.use('/service_personne', service_personneRouter)
app.use('/payment', paymentRouter)

app.all("*", (req, res) => {
          res.status(RESPONSE_CODES.NOT_FOUND).json({
                    statusCode: RESPONSE_CODES.NOT_FOUND,
                    httpStatus: RESPONSE_STATUS.NOT_FOUND,
                    message: "Route non trouvé",
                    result: []
          })
});
const port = process.env.PORT || 8000;
const isHttps = false
if (isHttps) {
          var options = {
                    key: fs.readFileSync('keys/client-key.pem'),
                    cert: fs.readFileSync('keys/client-cert.pem')
          };
          https.createServer(options, app).listen(port, async () => {
                    console.log(`${(process.env.NODE_ENV).toUpperCase()} Server is running on : https://${ip.address()}:${port}/`);
          });
} else {
          const server = http.createServer(app);
          const io = new Server(server);
          io.on('connection', socket => {
                    socket.on('join', (data) => {
                              console.log(data.userId, "Connect to a socket")
                              socket.join(data.userId)
                    })
          })
          io.on('disconnect', () => {
                    console.log('user disconnected')
          })
          app.io = io
          server.listen(port, async () => {
                    console.log(`${(process.env.NODE_ENV).toUpperCase()} - Server is running on : http://${ip.address()}:${port}/`);
          });
}