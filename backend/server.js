
//init path
const path = require('path');
//init express
const express = require('express');
const exp = require('constants');
// init app
const app = express();


// active port being used
const port = 3000;



// Route to satic folder
const STATIC_ROUTE = '../WealthWise HTML & CSS';

// Landing page static files
app.use('/',express.static(path.join(__dirname,STATIC_ROUTE,'Landing Page')));
app.use('/login',express.static(path.join(__dirname,STATIC_ROUTE,'Login Page')));


// Landing Page
app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Landing Page','index.html'));

})

app.get('/login',(req,res)=> {
    res.sendFile(path.join(__dirname,STATIC_ROUTE,'Login Page','index.html'));

});

app.post('/',(req,res)=> {
    res.send('POST gotten');
})

app.listen(port,() =>{
    console.log(`web app listening on ${port}`);
})