var express = require('express');
var router = express.Router();

/**
 *  GET pages index
 */
router.get('/', (req, res) => {
    res.send("Admin Area");
});

/**
 *  GET add page
 */
router.get('/add-page', (req, res) => {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});


//Exports
module.exports = router;