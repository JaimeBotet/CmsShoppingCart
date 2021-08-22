var express = require('express');
var router = express.Router();

// Get Product Model
var Product = require('../models/product');

// Get Cart Model
// var Cart = require('../models/cart');

/**
 * GET /
 */
router.get('/', (req, res) => {

    Product.findOne({ slug: 'home'}, (err, cart) => {
        if (err) console.log(err);

        res.render('index', {
            title: cart.title,
            content: cart.content
        });
        
    });
});





//Exports
module.exports = router;