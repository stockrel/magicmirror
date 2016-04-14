var express = require('express');
var router = express.Router();
var Gmail = require('node-gmail-api')
  , gmail = new Gmail("AIzaSyBO62j7Xb01SSL3zHWdgo071AfmVAsCIvQ");



router.get('/list',  function(req, res) {

	var s = gmail.messages('label:inbox', {max: 10});
    s.on('data', function (d) {
     res.send(d);
    })

})


module.exports = router;