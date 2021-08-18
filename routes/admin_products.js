var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// Get Product Model
var Product = require('../models/product');

// Get Category Model
var Category = require('../models/category');

/**
 *  GET products index
 */
router.get('/', (req, res) => {
    var count;
    Product.count( (err,c) => {
        count = c;
    })

    Product.find( (error, products) => {
        res.render('admin/products', {
            products:   products,
            count:      count
        });
    })
});

/**
 *  GET add product
 */
router.get('/add-product', (req, res) => {
    var title = "";
    var desc = "";
    var price = "";

    Category.find( (err, categories) => {

        res.render('admin/products/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    })
});

/**
 *  POST add product
 */
 router.post('/add-product', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors){
        res.render('admin/add_product', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Product.findOne({slug: slug}, (err, product) => {
            if (product) {
                req.flash('danger', 'Product slug already exists, choose another...');
                res.render('admin/add_product', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                let product = new Product({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                product.save((err) => {
                    if(err) return console.log(err);

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

/**
 *  POST reorder products
 */
 router.post('/reorder-products', (req, res) => {
    var ids = req.body['id[]'];

    var count = 0;
    
    for(let i = 0; i < ids.length; i++){
        var id = ids[i]; 
        count++;
        // We use a clousure because NodeJS is asynchronous and the value of count its restarted in every loop.
        // With C# or PHP we wont need to use it
        ( (count) => {
            Product.findById(id, (err, product) => {
                product.sorting = count;
    
                product.save( (err) => {
                    if (err) return console.log(err);
                });
            });
        })(count)
    }
});

/**
 *  GET edit product
 */
 router.get('/edit-product/:id', (req, res) => {
    Product.findById( req.params.id, (err, product) => {
        if(err) return console.log(err);

        res.render('admin/edit_page', {
            title: product.title,
            slug: product.slug,
            content: product.content,
            id: product._id
        });
    });

});

/**
 *  POST edit product
 */
 router.post('/edit-product/:id', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var id = req.params.id;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors){
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Product.findOne({slug: slug, _id:{'$ne':id}}, (err, product) => {
            if (product) {
                req.flash('danger', 'Product slug already exists, choose another...');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                
                Product.findById(id, (err, product) => {
                    if (err) return console.log(err);

                    product.title = title;
                    product.slug = slug;
                    product.content = content;
                    
                    product.save((err) => {
                        if(err) return console.log(err);
    
                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });

            }
        });
    }

});

/**
 *  GET delete product
 */
 router.get('/delete-product/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id, (err) => {
        if(err) return console.log(err);
    
        req.flash('success', 'Product deleted!');
        res.redirect('/admin/products/');
    });
});

//Exports
module.exports = router;