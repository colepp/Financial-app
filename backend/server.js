// FUTURE GOALS
/*
#. goal ~ priority (status)
1. Set up https certs for server ~ low (not started)
4. create function for password reset ~ med (not started)
6. find code repeated code that can be turned into functions/objects ~ low (working on)
8. impletn redirects based on user being logged in or not ex. if a user tries to acces part of a 
    site that requires a login and their not logged in redirect to the login page. (started)
*/


//init https
const https = require('https');


//init path
const path = require('path'); // for linking static and html files

//init express
const express = require('express'); // express server framework
const bodyParser = require('body-parser'); // parser for middleware
const axios = require('axios');

// init Security
const helmet = require('helmet'); //helmet secrutity for middleware and server
const bcrypt = require('bcrypt'); // password hashing

// const exp = require('constants');
const pool = require('./db'); // database access

// init app
const app = express(); // express app object


// init express session manager
const session = require('express-session');
const { request } = require('https');
const { access } = require('fs');

// configureing session middleware
app.use(
    session({
        secret:'Q+-k"]#@@4}*z<@2empu7dn~Jn.T#;', // session object key put this in .env file
        resave:false, // toggler for resaving the session into stoarge if the page has been modified or not
        saveUninitialized:false, // toggler for saving unitialized session
        cookie:{
            secure:false,
            httpOnly:true,
            maxAge:1000 * 60 * 60 * 24, // age of session item (1 whole day in milliseconds)

        },

    })
);

// Middleware
 
app.use(bodyParser.json()); // parse json request
app.use(bodyParser.urlencoded({ extended: true }));


// active port being used
const port = 3000;




// Route to satic folder
const STATIC_ROUTE = './WealthWise HTML & CSS';

// html page static files

app.use('/',express.static(path.join(__dirname,STATIC_ROUTE,'Landing Page/static')));
app.use('/login',express.static(path.join(__dirname,STATIC_ROUTE,'Login Page/static')));
app.use('/signup',express.static(path.join(__dirname,STATIC_ROUTE,'Signup Page/static')));
app.use('/dashboard',express.static(path.join(__dirname,STATIC_ROUTE,'Dashboard/static')));
app.use('/monthlyBudget',express.static(path.join(__dirname,STATIC_ROUTE,'Monthly Budgeting Page/static')));
app.use('/weeklyBudget',express.static(path.join(__dirname,STATIC_ROUTE,'Weekly Budgeting Page/static')));
app.use('/bankInfo',express.static(path.join(__dirname,STATIC_ROUTE,'Bank Info Page/static')));
app.use('/profile',express.static(path.join(__dirname,STATIC_ROUTE,'Profile Page/static')));
app.use('/register',express.static(path.join(__dirname,STATIC_ROUTE,'Register/static')));


// Landing Page
app.get('/',(req,res) => {
    if(req.session.user){
        if(!(req.session.user.bank_connected)){
            res.redirect('/register')
        }else{res.redirect('/dashboard');}
    }else{
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Landing Page','index.html'));
    }
    

});
//Monthly Budget Page
app.get('/monthlyBudget', (req,res)=>{
    if(req.session.user){
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Monthly Budgeting Page','index.html'));
    }else{
        res.redirect('/');
    }
    
});

//Weekly Budget Page
app.get('/weeklyBudget', (req,res)=>{
    if(req.session.user){
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Weekly Budgeting Page','index.html')); 
    }else{
        res.redirect('/');
    }
});

//Bank Information Page
app.get('/bankInfo', (req,res)=>{
    if(req.session.user){
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Bank Info Page','index.html'));
    }else{
        res.redirect('/');
    }
});

//Profile Page
app.get('/profile', (req,res)=>{
    if(req.session.user){
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Profile Page','index.html'));
    }else{
        res.redirect('/');
    }
});


// Login Page
app.get('/login',(req,res)=> {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Login Page','index.html'));
});

// dashboard page
app.get('/dashboard',(req,res) => {
    if(req.session.user){
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Dashboard','index.html'));
    }else{
        res.redirect('/');
    }
})

// signup page
app.get('/signup',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Signup Page','index.html'));
});

app.post('/signup',async (req,res)=> {
    // gather signup items
    const {email,first_name,last_name,password} = req.body;
    

    // check if email already in use if so return error 
    const user_exist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(user_exist.rows.length > 0){
        return res.status(409).send('Email Already Taken.');
    }

    // hash passowrd
    const salt_rounds = 10 // hashing error
    const hashed_password = await bcrypt.hash(password,salt_rounds);
    try{
        await pool.query('INSERT INTO users (email,first_name,last_name,password) VALUES ($1,$2,$3,$4)',[email,first_name,last_name,hashed_password]);
        req.session.user = {email:email,name:first_name,bank_connected:false};
        res.redirect('/');
    }catch(error){
        console.log('Error Registering Users',error);
        res.status(500).send('User Could Not Be Registered');
    }
});



// Register Page
app.get('/register',async (req,res)=>{
    if(req.session.user){
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Register','index.html'));
    }else{
        res.redirect('/');
    }

    
});


// Login Page
app.post('/login',async (req,res) => {
    const {email,password} = req.body;
    // check if user exists
    const user_exist = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
    if(user_exist.rows.length === 0){
        return res.status(401).send('Invalid Email or Password.');
    }

    // password compare
    const password_confirm = await bcrypt.compare(password,user_exist.rows[0].password);
    if(password_confirm){
        req.session.user = {email:user_exist.rows[0].email,name:user_exist.rows[0].first_name,bank_connected:user_exist.rows[0].bank_connected}
        res.redirect('/');
    }else{
        res.status(401).send('Invalid Email or Password.');
    }
});

app.get('/logout',async (req,res) =>{
    if(req.session.user){
        req.session.user = null;
        res.redirect('/');
    }
});

app.get('/session', async (req,res) => {
    if(req.session.user){
        console.log('user logged in');
        res.send(req.session.user);
    }else{
        res.send(null);
    }
});


// set server to listen on selected port
app.listen(port,() => {
    console.log(`"Server is running on http://localhost:${port}`);
});


//Store access token in database
app.post('/post_access_token',async (req,res) => {

    const access_token_query = 'UPDATE users SET access_token = $1 WHERE email = $2';
    const bank_register_query = 'UPDATE users SET bank_connected = $1 WHERE email = $2';

    const accessToken = req.body.access_token;

    try{
        if(req.session.user){
            await pool.query(access_token_query,[accessToken,req.session.user.email]);
            await pool.query(bank_register_query,[true,req.session.user.email]);
        }
    }catch(e){
        console.log('error posting access token');
        console.log(e);
    }
    res.redirect(302, '/'); 
});

//Retrieve access token from database
app.get('/get_access_token',async (req,res) => {
    if(req.session.user){
        const user = await pool.query('SELECT * FROM users WHERE email = $1',[req.session.user.email]);
        if(user.length === 0){
            res.status(401).send('User Not Found')
        }else{
            console.log(user.rows[0].access_token);
            res.send({accessToken:user.rows[0].access_token});
            
        }
    }
})


