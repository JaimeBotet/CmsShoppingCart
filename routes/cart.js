var express = require('express');
var router = express.Router();

// Get Product Model
var Product = require('../models/product');

// Get Cart Model
// var Cart = require('../models/cart');

/**
 * GET Add product to cart
 */
router.get('/add/:product', (req, res) => {

    var slug = req.params.product;

    Product.findOne({ slug: slug}, (err, p) => {
        if (err) console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: "/product_images/" + p._id + "/" + p.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (let i = 0; i < cart.length; i++) {
                if (cart[i].title == slug ){
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if(newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: "/product_images/" + p._id + "/" + p.image
                });
            }
        }
        
        // console.log(req.session.cart);
        req.flash('success', 'Product added!');
        res.redirect('back');
    });
});

/**
 * GET Checkout page
 */
router.get('/checkout', (req, res) => {

    if(req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect("/cart/checkout");
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
    
});

/**
 * GET Update Cart
 */
router.get('/update/:product', (req, res) => {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (let i = 0; i <cart.length; i++) {
        if(cart[i].title == slug) {
            switch (action) {
                case 'add':
                    cart[i].qty++;
                    break;
                case 'remove':
                    cart[i].qty--;
                    if (cart[i].qty == 0) cart.splice(i,1);
                    break;
                case 'clear':
                    cart.splice(i,1);
                    if (cart.length == 0) delete cart.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});

/**
 * GET Clear Cart
 */
 router.get('/clear', (req, res) => {
    delete req.session.cart;

    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
 });  

 /**
 * GET Buy Now
 */
 router.get('/buynow', (req, res) => {
    delete req.session.cart;

    res.sendStatus(200);
 });  






//Exports
module.exports = router;