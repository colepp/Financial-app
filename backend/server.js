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
8. impletnredirects based on user being logged in or not ex. if a user tries to acces part of a 
    site that requires a login and their not logged in redirect to the login page.
*/


//init https
const https = require('https');




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
const { request } = require('https');

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
app.use('/settings',express.static(path.join(__dirname,STATIC_ROUTE,'Settings Page/static')));
app.use('/signup',express.static(path.join(__dirname,STATIC_ROUTE,'Signup Page/static')));
app.use('/dashboard',express.static(path.join(__dirname,STATIC_ROUTE,'Dashboard/static')));
app.use('/monthlyBudget',express.static(path.join(__dirname,STATIC_ROUTE,'Monthly Budgeting Page/static')));
app.use('/weeklyBudget',express.static(path.join(__dirname,STATIC_ROUTE,'Weekly Budgeting Page/static')));
app.use('/bankInfo',express.static(path.join(__dirname,STATIC_ROUTE,'Bank Info Page/static')));
app.use('/profile',express.static(path.join(__dirname,STATIC_ROUTE,'Profile Page/static')));

// Landing Page
app.get('/',(req,res) => {
    if(req.session.user){
        console.log('user logged in');
        res.redirect('/dashboard');
    }else{
        console.log('user not logged in');
        res.sendFile(path.join(__dirname,STATIC_ROUTE,'Landing Page','index.html'));
    }
    

});
//Monthly Budget Page
app.get('/monthlyBudget', (req,res)=>{
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Monthly Budgeting Page','index.html'));
});

//Weekly Budget Page
app.get('/weeklyBudget', (req,res)=>{
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Weekly Budgeting Page','index.html'));
});

//Bank Information Page
app.get('/bankInfo', (req,res)=>{
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Bank Info Page','index.html'));
});

//Profile Page
app.get('/profile', (req,res)=>{
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Profile Page','index.html'));
});


// Login Page
app.get('/login',(req,res)=> {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Login Page','index.html'));
});


// Signup Page


// Signup Reqs
// email
//password
// fname
// lname
// redirect to plaid


// dashboard page
app.get('/dashboard',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Dashboard','index.html'));
})


// signup page
app.get('/signup',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Signup Page','index.html'));
});



app.post('/signup',async (req,res)=> {
    // gather signup items
    console.log(req.body);
    const {email,first_name,last_name,password} = req.body;

    // check if email already in use if so return error 
    const user_exist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if(user_exist.rows.length > 0){
        return res.status(409).send('Email Already Taken.');
    }


    // hash passowrd
    const salt_rounds = 10 // hashing error
    // const hashed_password = await bcrypt.hash(password,salt_rounds)
    const hashed_password = await bcrypt.hash(password,salt_rounds);
    try{
        await pool.query('INSERT INTO users (email,first_name,last_name,password) VALUES ($1,$2,$3,$4)',[email,first_name,last_name,hashed_password]);
        // res.status(201).send('User Registered') // not needed but ill keep around just in case
        res.redirect('/register'); // redirect to register page (waiting for it to be done....)
    }catch(error){
        console.log('Error Registering Users',error);
        res.status(500).send('User Could Not Be Registered');
    }
      });

async function postAccessToken(){
    return;
}

// Register Page
app.get('/register',async (req,res)=>{
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Register','index.html'));
});


// Login Page
app.post('/login',async (req,res) => {
    const {email,password} = req.body;
    console.log(req.body);
    console.log(email);

    // check if user exists
    const user_exist = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
    console.log(user_exist.rows.length);
    if(user_exist.rows.length === 0){
        return res.status(401).send('Invalid Email or Password.');
    }

    // password compare
    const password_confirm = await bcrypt.compare(password,user_exist.rows[0].password);
    console.log(password_confirm)
    if(password_confirm){
        req.session.user = {id:user_exist.rows[0].id,name:user_exist.rows[0].first_name}
        console.log(req.session.user);
        res.redirect('/dashboard');
        console.log('login success');
    }else{
        res.status(401).send('Invalid Email or Password.');
    }
});

app.get('/logout',async (req,res) =>{
    if(req.session.user){
        req.session.user = null;
        res.redirect('/');
    }
})

// Settings Page
app.get('/Settings',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Settings Page','index.html'));
});

// set server to listen on selected port
app.listen(port,() => {
    console.log(`"Server is running on http://localhost:${port}`);
});


