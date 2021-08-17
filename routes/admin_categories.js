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
    var slug = "";
    var content = "";

    res.render('admin/add_category', {
        title: title,
        slug: slug,
        content: content
    });
});

/**
 *  POST add category
 */
 router.post('/add-category', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors){
        res.render('admin/add_category', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Category.findOne({slug: slug}, (err, category) => {
            if (category) {
                req.flash('danger', 'Category slug already exists, choose another...');
                res.render('admin/add_category', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                let category = new Category({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                category.save((err) => {
                    if(err) return console.log(err);

                    req.flash('success', 'Category added!');
                    res.redirect('/admin/category');
                });
            }
        });
    }

});

/**
 *  POST reorder category
 */
 router.post('/reorder-category', (req, res) => {
    var ids = req.body['id[]'];

    var count = 0;
    
    for(let i = 0; i < ids.length; i++){
        var id = ids[i]; 
        count++;
        // We use a clousure because NodeJS is asynchronous and the value of count its restarted in every loop.
        // With C# or PHP we wont need to use it
        ( (count) => {
            Category.findById(id, (err, category) => {
                category.sorting = count;
    
                category.save( (err) => {
                    if (err) return console.log(err);
                });
            });
        })(count)
    }
});

/**
 *  GET edit category
 */
 router.get('/edit-category/:slug', (req, res) => {
    Category.findOne( { slug: req.params.slug}, (err, category) => {
        if(err) return console.log(err);

        res.render('admin/edit_page', {
            title: category.title,
            slug: category.slug,
            content: category.content,
            id: category._id
        });
    });

});

/**
 *  POST edit category
 */
 router.post('/edit-category/:slug', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var id = req.body.id;
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
        Category.findOne({slug: slug, _id:{'$ne':id}}, (err, category) => {
            if (category) {
                req.flash('danger', 'Category slug already exists, choose another...');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                
                Category.findById(id, (err, category) => {
                    if (err) return console.log(err);

                    category.title = title;
                    category.slug = slug;
                    category.content = content;
                    
                    category.save((err) => {
                        if(err) return console.log(err);
    
                        req.flash('success', 'Category edited!');
                        res.redirect('/admin/category/edit-category/' + category.slug);
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