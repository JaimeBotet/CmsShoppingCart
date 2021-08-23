var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Page Model
var Page = require('../models/page');

/**
 *  GET pages index
 */
router.get('/', isAdmin, (req, res) => {
    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
        res.render('admin/pages/index', {
            pages: pages
        });
    });
});

/**
 *  GET add page
 */
router.get('/add-page', isAdmin, (req, res) => {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/pages/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

/**
 *  POST add page
 */
 router.post('/add-page', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors){
        res.render('admin/pages/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({slug: slug}, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug already exists, choose another...');
                res.render('admin/pages/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                let page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save((err) => {
                    if(err) return console.log(err);

                    // Updating the client view when adding a page
                    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
                        if(err) console.log(err);
                        else {
                            req.app.locals.pages = pages;
                        }
                    });

                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                });
            }
        });
    }

});


// Sort pages function
function sortPages(ids, callback) {
    var count = 0;
    
    for(let i = 0; i < ids.length; i++){
        var id = ids[i]; 
        count++;
        // We use a clousure because NodeJS is asynchronous and the value of count its restarted in every loop.
        // With C# or PHP we wont need to use it
        ( (count) => {
            Page.findById(id, (err, page) => {
                page.sorting = count;
    
                page.save( (err) => {
                    if (err) return console.log(err);
                    ++count;
                    if(count >= ids.length){
                        callback();
                    }
                });
            });
        })(count)
    }
}
/**
 *  POST reorder pages
 */
 router.post('/reorder-pages', (req, res) => {
    var ids = req.body['id[]'];

    // Updating client view when reordering a page
    sortPages(ids, () => {
        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
            if(err) console.log(err);
            else {
                req.app.locals.pages = pages;
            }
        });
    })

});

/**
 *  GET edit page
 */
 router.get('/edit-page/:id', isAdmin, (req, res) => {
    Page.findById( req.params.id, (err, page) => {
        if(err) return console.log(err);

        res.render('admin/pages/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });

});

/**
 *  POST edit page
 */
 router.post('/edit-page/:id', (req, res) => {

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var content = req.body.content;
    var id = req.params.id;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();

    if (slug == "") slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors){
        res.render('admin/pages/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({slug: slug, _id:{'$ne':id}}, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug already exists, choose another...');
                res.render('admin/pages/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                
                Page.findById(id, (err, page) => {
                    if (err) return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    
                    page.save((err) => {
                        if(err) return console.log(err);
    
                        // Updating the client view when editing a page
                        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
                            if(err) console.log(err);
                            else {
                                req.app.locals.pages = pages;
                            }
                        });

                        req.flash('success', 'Page edited!');
                        res.redirect('/admin/pages/edit-page/' + id);
                    });
                });

            }
        });
    }

});

/**
 *  GET delete page
 */
 router.get('/delete-page/:id', isAdmin, (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if(err) return console.log(err);
    
        // Update the client view of pages when deleting a page
        Page.find({}).sort({sorting: 1}).exec((err, pages) => {
            if(err) console.log(err);
            else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Page deleted!');
        res.redirect('/admin/pages/');
    });
});

//Exports
module.exports = router;