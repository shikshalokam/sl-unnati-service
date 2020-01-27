var https                   = require('https');
var http                    = require('http');
var express                 = require('express');
var path                    = require('path');
var bodyParser              = require('body-parser');
var fs                      = require('fs');

var projectV1               = require('./controllers/v1/project.controller');
var external                = require('./controllers/v1/external.controller');
var reports                 = require('./controllers/v1/reports.controller');
var template                = require('./controllers/v1/template.controller');

const swaggerUi             = require('swagger-ui-express');
const swaggerDocument       = require('./config/swagger.json');


// const swaggerSpec = swaggerJSDoc(options);


var config                  = require('./config/config.json');
var port                    = config.PORT;
var app                     = express();
var morgan                  = require('morgan');
var winston                 = require('./config/winston');
var mongoose                = require('mongoose');
var authServe               = require('./services/authentication.service');

var notification            = require('./helpers/notifications');

var cronSchedular           = require('./helpers/cron-schedular');


// connection should come from config.
mongoose.connect(config.DB_URL, { useNewUrlParser: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true, parameterLimit: 20000 }));

app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
//     var allowedOrigins = ['http://localhost:8100', 'http://192.168.1.120:8100', 'http://127.0.0.1:9000', 'http://localhost:9000'];
//   var origin = req.headers.origin;
//   if(allowedOrigins.indexOf(origin) > -1){
//        res.setHeader('Access-Control-Allow-Origin', origin);
//   }

    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Authorization, Content-Type, Accept,x-auth-token,x-authenticated-user-token");
    res.header("Access-Control-Allow-Credentials", true);

    next();
});


app.use(morgan('combined', { stream: winston.stream })); 
var options = {
    explorer: true
};
   
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// This should come from middleware.

function authenticate(req,res,next){

    authServe.validateToken(req,res)
    .then(function (result) {
        // res.send(result);
        // console.log("result",result);
        if(result.status=="success"){

            console.log("authnticated successfully");

            req.body.userId = result.userId;
            next();
        }else{
            res.send({ status:"failed",message:result.message })
        }

        
    });

}

app.use('/unnati/api/v1/',authenticate,projectV1);
app.use('/unnati/api/external/',authenticate,external);
app.use('/unnati/api/v1/reports/',authenticate,reports);
app.use('/unnati/api/v1/template/',authenticate,template);


  

var httpServer = http.createServer( app);
httpServer.listen(port, function () {
    console.log('Server started on port  ', port)
});

