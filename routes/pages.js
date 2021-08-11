var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Home'
    });
});

router.get('/test', (req, res) => {
    res.send('Pages Test');
});

//Exports
module.exports = router;