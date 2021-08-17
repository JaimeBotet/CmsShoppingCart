var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');

console.log(expressValidator);


//Connect to DB
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

//init app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Express FileUpload middleware
app.use(fileUpload());

// Body parser middleware
//
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Express session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }));

// Express validator middleware
app.use(expressValidator({
    errorFormater: (param, msg, value) => {
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }
        return {
            param   : formParam,
            msg     : msg,
            value   : value
        };
    }
}));

// Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Set routes
var pages = require('./routes/pages');
var adminPages = require('./routes/admin_pages');
var adminCategories = require('./routes/admin_categories');
var adminProducts = require('./routes/admin_products');

app.use('/', pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);



// Start the server
var port = 3000;
app.listen(port, () => {
    console.log('Server started on port ' + port);
})