var express = require('express');
var router = express.Router();

// Get Product Model
var Product = require('../models/product');

// Get Category Model
var Category = require('../models/category');

/**
 * GET all products
 */
router.get('/', (req, res) => {

    Product.find( (err, products) => {

        if (err) console.log(err);

        res.render('all_products', {
            title: 'All products',
            products: products
        });
    })
});

/**
 * GET products by category
 */
router.get('/:category', (req, res) => {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, (err, c)=> {

        Product.find({category: categorySlug}, (err, products) => {
    
            if (err) console.log(err);
    
            res.render('cat_products', {
                title: c.title,
                products: products
            });
        })
    })
});





//Exports
module.exports = router;