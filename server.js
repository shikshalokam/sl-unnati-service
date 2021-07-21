require("dotenv").config();
var https                   = require('https');
var http                    = require('http');
var express                 = require('express');
var path                    = require('path');
var bodyParser              = require('body-parser');
var fs                      = require('fs');
var cors                    = require('cors')

var projectV1               = require('./controllers/v1/project.controller');
var external                = require('./controllers/v1/external.controller');
var reports                 = require('./controllers/v1/reports.controller');
var template                = require('./controllers/v1/template.controller');
var userProfile             = require('./controllers/v1/user-profile.controller');

const swaggerUi             = require('swagger-ui-express');
const swaggerDocument       = require('./config/swagger.json');


// const swaggerSpec = swaggerJSDoc(options);


var config                  = require('./config/config.json');
var port                    = config.PORT;
var app                     = express();
require("./healthCheck")(app);
var morgan                  = require('morgan');
var winston                 = require('./config/winston');
var mongoose                = require('mongoose');
var authServe               = require('./services/authentication.service');

var notification            = require('./helpers/notifications');

var cronSchedular           = require('./helpers/cron-schedular');

let environmentData = require("./envVariables")();


if(!environmentData.success) {
  console.log("Server could not start . Not all environment variable is provided");
  process.exit();
}

global.kafkaClient = require('./config/kafka-config')();
require("./helpers/scheduler");

// connection should come from config.
mongoose.connect(config.DB_URL, { useNewUrlParser: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true, parameterLimit: 20000 }));

app.use(cors());


var options = {
    explorer: true
};
   
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// This should come from middleware.

function authenticate(req,res,next){

    authServe.validateToken(req,res)
    .then(function (result) {
        if(result.status=="success"){

            console.log("authnticated successfully");

            req.body.userId = result.userId;
            next();
        }else{
            res.status(401);
            res.send({ 
                status: result.status,
                message: result.message
            })
        }

        
    });

}

let app_base_path = "unnati";
if(config.app_base_path){
    app_base_path = config.app_base_path;
}

app.all("*", (req, res, next) => {

      console.log("-------Request log starts here------------------");
      console.log(
        "%s %s on %s from ",
        req.method,
        req.url,
        new Date(),
        req.headers["user-agent"]
      );
      console.log("Request Headers: ", req.headers);
      console.log("Request Body: ", req.body);
      console.log("Request Files: ", req.files);
      console.log("-------Request log ends here------------------");
    
    next();
  });

app.use('/'+app_base_path+'/api/v1/',authenticate,projectV1);
app.use('/'+app_base_path+'/api/external/',authenticate,external);
app.use('/'+app_base_path+'/api/v1/reports/',authenticate,reports);
app.use('/'+app_base_path+'/api/v1/template/',authenticate,template);
app.use('/'+app_base_path+'/api/v1/user-profile/',authenticate,userProfile);

var httpServer = http.createServer( app);
httpServer.listen(port, function () {
    console.log('Server started on port  ', port)
});

