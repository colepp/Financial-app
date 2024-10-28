// FUTURE GOALS
/*
#. goal ~ priority (status)
1. Set up https certs for server ~ low (not started)
2. secure signup process ~ high (working on)
3. create login process and secure it ~ high (working on)
4. create function for password reset ~ med (not started)
5. set up cookie and session storage ~ high/med (started not working on)
6. find code repeated code that can be turned into functions/objects ~ low (working on)
7. move server functions and or page request to their own files....? ~ low (not started)
*/



//init path
const path = require('path'); // for linking static and html files

//init express
const express = require('express'); // express server framework
const bodyParser = require('body-parser'); // parser for middleware

// init Security
const helmet = require('helmet'); //helmet secrutity for middleware and server
const bcrypt = require('bcrypt'); // password hashing

// const exp = require('constants');
const pool = require('./db'); // database access

// init app
const app = express(); // express app object


// init express session manager
const session = require('express-session');

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
app.use(helmet()); 
app.use(bodyParser.json()); // parse json request


// active port being used
const port = 3000;



// Route to satic folder
const STATIC_ROUTE = '../WealthWise HTML & CSS';

// html page static files
app.use('/',express.static(path.join(__dirname,STATIC_ROUTE,'Landing Page')));
app.use('/login',express.static(path.join(__dirname,STATIC_ROUTE,'Login Page')));
app.use('/settings',express.static(path.join(__dirname,STATIC_ROUTE,'Settings Page')));

// Landing Page
app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Landing Page','index.html'));

});

// Login Page
app.get('/login',(req,res)=> {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Login Page','index.html'));

});

// Signup Page

app.get('/signup',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Signup Page','index.html'));
});

app.post('/signup',async (req,res)=> {
    // gather signup items
    const {email,first_name,last_name,password,phone_number,} = req.body;

    // check if email already in use if so return error 
    const user_exist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(user_exist.rows.length > 0){
        return res.status(409).send('Email Already Taken.');
    }

    // hash passowrd
    const hashing_rounds = 10;
    const hashed_password = bcrypt.hash(password,hashing_rounds);

    // try to append new user with hashed password if not then return error 500
    try{
        await pool.query('INSERT INTO users (email,first_name,last_name,phone_number,password) VALUES ($1,$2,$3,$4,$5)',[email,first_name,last_name,phone_number,hashed_password]);
        res.status(201).send('User Registered')
    }catch(error){
        console.log('Error Registering Users',error);
        res.status(500).send('User Could Not Be Registered');
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
    const password_confirm = await bcrypt.compare(password,user_exist.rows[0].password)
});



// Settings Page
app.get('/Settings',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Settings Page','index.html'));
});

// set server to listen on selected port
app.listen(port,() =>{
    console.log(`"Server is running on http://localhost:${port}`);
});