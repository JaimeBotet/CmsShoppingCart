var express = require('express');
var router = express.Router();

// Get Category Model
var Category = require('../models/category');

/**
 *  GET category index
 */
router.get('/', (req, res) => {
    Category.find((err, categories) => {
        if (err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

/**
 *  GET add category
 */
router.get('/add-category', (req, res) => {
    var title = "";

    res.render('admin/add_category', {
        title: title
    });
});

/**
 *  POST add category
 */
 router.post('/add-category', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors){
        res.render('admin/add_category', {
            errors: errors,
            title: title
        });
    } else {
        Category.findOne({slug: slug}, (err, category) => {
            if (category) {
                req.flash('danger', 'Category title already exists, choose another...');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                let category = new Category({
                    title: title,
                    slug: slug
                });
                category.save((err) => {
                    if(err) return console.log(err);

                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });
            }
        });
    }

});

/**
 *  GET edit category
 */
 router.get('/edit-category/:id', (req, res) => {
    Category.findById( req.params.id, (err, category) => {
        if(err) return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});

/**
 *  POST edit category
 */
 router.post('/edit-category/:id', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors){
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        //Check if category title is unique
        Category.findOne({slug: slug, _id:{'$ne':id}}, (err, category) => {
            if (category) {
                req.flash('danger', 'Category title already exists, choose another...');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, (err, category) => {
                    if (err) return console.log(err);

                    category.title = title;
                    category.slug = slug;
                    
                    category.save((err) => {
                        if(err) return console.log(err);
    
                        req.flash('success', 'Category edited!');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });
                });

            }
        });
    }

});

/**
 *  GET delete category
 */
 router.get('/delete-category/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id, (err) => {
        if(err) return console.log(err);
    
        req.flash('success', 'Category deleted!');
        res.redirect('/admin/category/');
    });
});

//Exports
module.exports = router;