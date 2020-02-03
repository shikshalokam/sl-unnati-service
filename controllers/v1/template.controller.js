var express             = require('express');
var router              = express.Router();
var templateServe = require('../../services/template.service');

// routes
router.get('/all', getTemplates);
module.exports = router;
function getTemplates(req, res) {
    templateServe.getTemplates(req,res)
        .then(function (result) {
            res.send(result);
        }).catch(e => {
            console.log("erorr while featching template data",e);
            res.send(e);
          });
}
