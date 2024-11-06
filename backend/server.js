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
app.use(helmet()); 
app.use(bodyParser.json()); // parse json request
app.use(bodyParser.urlencoded({ extended: true }));


// active port being used
const port = 3000;
const api_port = 8000;



// Route to satic folder
const STATIC_ROUTE = './WealthWise HTML & CSS';

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


// Signup Reqs
// email
//password
// fname
// lname
// redirect to plaid


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
    const salt_rounds = 10 // hashing error
    bcrypt.hash(password, salt_rounds, async (err, hash) => {
        if (err) {
          console.error(err); // log error
          return;
        }
        console.log('Hashed Password:', hash); // Verify the hash before saving it to the DB
        // try to append new user with hashed password if not then return error 500
    try{
        await pool.query('INSERT INTO users (email,first_name,last_name,phone_number,password) VALUES ($1,$2,$3,$4,$5)',[email,first_name,last_name,phone_number,hash]);
        res.status(201).send('User Registered')
        res.redirect('/register')
    }catch(error){
        console.log('Error Registering Users',error);
        res.status(500).send('User Could Not Be Registered');
    }
      });

    

});

async function getAcessToken(){

    return null;
}

// Plaid Stuff

app.get('/register',async (req,res)=>{
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Register','index.html'));
});


// Login Page

app.post('/login',async (req,res) => {
    const {email,password} = req.body;
    console.log(req);
    console.log(email)

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
        res.send('Login Success');
        console.log('login success');
    }else{
        res.status(401).send('Invalid Email or Password.');
    }
});



// Settings Page
app.get('/Settings',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Settings Page','index.html'));
});

// set server to listen on selected port
app.listen(port,() => {
    console.log(`"Server is running on http://localhost:${port}`);
});



// API

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');


// Config for the plaid enviornment

const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers:{
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        }
    }
});

const client = new PlaidApi(config); // Plaid client object

/*generate a link_token, which is a short-lived, 
one-time use token required to initialize Plaid Link.*/
app.get("/api/create_link_token", async (req, res, next) => {
    const tokenResponse = await client.linkTokenCreate({
      user: { client_user_id: req.sessionID },
      client_name: "WealthWise",
      language: "en",
      products: ["transactions"],
      country_codes: ["US"],
    });
    console.log(`Token response: ${JSON.stringify(tokenResponse.data)}`);

    res.json(tokenResponse.data);
});

/* exchange_public_token process
 involves exchanging a public_token for 
an access_token using the
 /item/public_token/exchange endpoint. */
app.post('/api/exchange_public_token', async(req, res, next)=>{
    const exchangeResponse = await client.itemPublicTokenExchange({
        public_token: req.body.public_token,
});


console.log(`Response:  ${JSON.stringify(exchangeResponse.data)}`)
req.session.access_token = exchangeResponse.data.access_token;
res.json(true);
});

app.get('/api/is_user_connected', async (req, res, next) => {
    console.log('Access Token: ', req.session.access_token);
    return req.session.access_token ? res.json({ status : true}) : res.json({ status : false});
})


app.get('/api/get_connected_bank', async(req, res, next)=>{
    accessToken = req.session.access_token;
    const bankRequest = await client.itemGet({
        access_token: accessToken
    })
    console.log(`Item Response:  ${JSON.stringify(bankRequest.data)}`);
    const bankId = bankRequest.data.item.institution_id;
    const nameRequest = await client.institutionsGetById({
        institution_id: bankId,
        country_codes: ["US"]
    });
    console.log(`ID Response:  ${JSON.stringify(nameRequest.data)}`);
    res.json(nameRequest.data.institution.name);
});

//
app.get('/api/get_accounts', async (req, res, next) =>{
    const getAccounts = await client.accountsGet({
        access_token: req.session.access_token
    });
    console.log(getAccounts.data);
    res.json(getAccounts.data.accounts);
});

app.get('/api/get_transactions', async (req, res, next) =>{
    const getTransactions = await client.transactionsGet({
        access_token: req.session.access_token,
        start_date: '2024-10-01',
        end_date: '2024-10-10'
    });
    console.log(getTransactions.data);
    res.json(getTransactions.data.transactions);
});

