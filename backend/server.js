
//init path
const path = require('path');

//init express
const express = require('express');
const bodyParser = require('body-parser');

// const exp = require('constants');
const pool = require('./db');

// init app
const app = express();

// Middleware
app.use(bodyParser.json());


// active port being used
const port = 3000;



// Route to satic folder
const STATIC_ROUTE = '../WealthWise HTML & CSS';

// Landing page static files
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
})
app.post('/signup',async (req,res)=> {
    const {email,first_name,last_name,password,phone_number,} = req.body;

    try {
    // Attempting to insert user data into the data base return 201 if it succeeds return 500
        const result = await pool.query(
            'INSERT INTO users (email, first_name, last_name, password, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, first_name, last_name, password, phone_number]
        );
        const new_user = result.rows[0];
        res.status(201).json(new_user);
        console.log('user created successfully');
    }catch (error){
        console.error(error);
        res.status(500).json({error:'User Could not be made'});
    }
});

// Settings Page
app.get('/Settings',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Settings Page','index.html'));
});


app.listen(port,() =>{
    console.log(`web app listening on ${port}`);
});