var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product Model
var Product = require('../models/product');

// Get Category Model
var Category = require('../models/category');

/**
 *  GET products index
 */
router.get('/', isAdmin, (req, res) => {
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
router.get('/add-product', isAdmin, (req, res) => {
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
    });
});

/**
 *  POST add product
 */
 router.post('/add-product', (req, res) => {

    var imageFile = req.files !== null ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image.').isImage(imageFile);

    var title = req.body.title;
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors){
        Category.find( (err, categories) => {
            res.render('admin/products/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, (err, product) => {
            if (product) {
                req.flash('danger', 'Product title already exists, choose another...');
                Category.find( (err, categories) => {
                    res.render('admin/products/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                
                var price2 = parseFloat(price).toFixed(2);

                let product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save((err) => {
                    if(err) return console.log(err);

                    let newDir = './public/product_images/' + product._id;
                    mkdirp.sync(newDir + '/gallery/thumbs');

                    //Move local image to public folder image
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var public_path = newDir + '/' + imageFile;

                        productImage.mv(public_path, (err) =>  console.log(err));
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

/**
 *  GET edit product
 */
 router.get('/edit-product/:id', isAdmin, (req, res) => {

    let errors;
    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find( (err, categories) => {
        Product.findById( req.params.id, (err, product) => {
            if(err) {
                console.log(err);
                res.redirect('/admin/products');
            }
            else {
                var galleryDir = "./public/product_images/" + product._id + "/gallery";
                var galleryImages = null;

                fs.readdir(galleryDir, (err, files) => {
                    if (err) console.log(err);
                    else{
                        galleryImages = files;
                        
                        res.render('admin/products/edit_product', {
                            title: product.title,
                            errors: errors,
                            desc: product.desc,
                            categories: categories,
                            category: product.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(product.price).toFixed(2),
                            image: product.image,
                            galleryImages: galleryImages,
                            id: product._id
                        });
                    } 
                });
            }
        });
    });
});

/**
 *  POST edit product
 */
 router.post('/edit-product/:id', (req, res) => {

    var imageFile = req.files !== null ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image.').isImage(imageFile);

    var title = req.body.title;
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id:{'$ne':id}}, (err, p) => { 
            if (err) console.log(err);

            if(p) {
                req.flash('danger', "Product title exists, please choose another.");
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, (err, p) => {
                    if(err) console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;

                    if(imageFile != ""){
                        p.image = imageFile;
                    }

                    p.save( (err) => {
                        if(err) console.log(err);

                        if(imageFile != ""){
                            if(pimage !="") {
                                fs.remove('./public/product_images/' + id + '/' + pimage, (err) => {
                                    if (err) console.log(err);
                                })
                            }

                            var productImage = req.files.image;
                            var public_path = './public/product_images/' + id + '/' + imageFile;
    
                            productImage.mv(public_path, (err) =>  console.log(err));
                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    })
                });
            }
        });
    }
});

/**
 *  POST product gallery
 */
 router.post('/product-gallery/:id', (req, res) => {
    let productImage = req.files.file;
    let id = req.params.id;
    let path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    let thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, (err) =>  {
        if (err) console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then( (buff) => {
            fs.writeFileSync(thumbsPath, buff);
        });
    });

    res.sendStatus(200);
});

/**
 *  GET delete gallery image
 */
 router.get('/delete-image/:image', isAdmin, (req, res) => {
    let OriginalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    let thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(OriginalImage, (err) => {
        if(err) console.log(err);
        else{
            fs.remove(thumbImage, (err) => {
                if(err) console.log(err);
                else {
                    req.flash('success', 'Gallery image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    })
});

/**
 *  GET delete product
 */
 router.get('/delete-product/:id', isAdmin, (req, res) => {
    let id = req.params.id;
    let path = 'public/product_images/' + id;
    fs.remove(path, (err) => {
        if(err) console.log(err);
        else {
            Product.findByIdAndRemove(id, (err) => {
                if(err) console.log(err);
            });
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    })
});

//Exports
module.exports = router;