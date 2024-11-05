const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const nocache = require('nocache');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const axios = require('axios');

dotenv.config();




mongoose.connect(process.env.MONGODB_URL);

const app = express();
app.use(nocache())

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,  // Ensure this is set correctly
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: process.env.NODE_ENV === 'production' }  // Secure cookies in production
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

const userRoute = require("./router/userRoute");
const adminRoute = require('./router/adminRoute');
const orderRoute = require('./router/order')

app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/order',orderRoute);

app.listen(3000, () => {
    console.log(`server is listening at http://localhost:3000`);
});
