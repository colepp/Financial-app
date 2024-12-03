require('dotenv').config(); // loading .env files
const express = require('express'); // express init
const bodyParser = require('body-parser'); // parsing for JSON
const session = require('express-session'); // session tool for express
const app = express(); // making express app object
const moment = require('moment'); // Used to get current date

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid'); // plaid tools
const json = require('body-parser/lib/types/json'); // json tool

// cole code input :) 
const cors = require('cors'); // making cors oject
app.use(cors()) // allow for access from all origins NOTE change on deployment

const PORT = process.env.PORT || 8000 

const axios = require('axios');

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: true,
    })
);

// Custom middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.listen(PORT, () =>{
    console.log('We are up and running. Head over to http://localhost:8000/');
});


//Initializing the PLAID client
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

const client = new PlaidApi(config);


// API SETUP

//Create link token for opening the PLAID link
app.get("/api/create_link_token", async (req, res) => {
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


//Exchange public token for access token from PLAID
app.post('/api/exchange_public_token', async(req, res)=>{
    const exchangeResponse = await client.itemPublicTokenExchange({
        public_token: req.body.public_token,
    });
console.log(`Response:  ${JSON.stringify(exchangeResponse.data)}`)
req.session.access_token = exchangeResponse.data.access_token;

res.json(req.session.access_token);
});


//API Functions

//Retrieve connected bank name from PLAID
app.post('/api/get_connected_bank', async(req, res)=>{
    const bankRequest = await client.itemGet({
        access_token: req.body.access_token
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

//Retrieve connected account(s) from PLAID
app.post('/api/get_accounts', async (req, res) =>{
    const getAccounts = await client.accountsGet({
        access_token: req.body.access_token
    });
    console.log(getAccounts.data);
    res.json(getAccounts.data.accounts);
});

//Retrieve today's date
app.get('/api/get_date', async(req, res)=>{
    const today = moment().format("YYYY-MM-DD");
    console.log('Today', today);
    res.json(today)
});

//Retrive last month's date
app.get('/api/get_last_month_date', async(req, res)=>{
    const lastMonth = moment(). subtract(31, 'days').format('YYYY-MM-DD');
    console.log('Last Month', lastMonth);
    res.json(lastMonth);
});

//Retrieve last week's date
app.get('/api/get_last_week_date', async(req, res)=>{
    const lastWeek = moment(). subtract(7, 'days').format('YYYY-MM-DD');
    console.log('Last Week', lastWeek);
    res.json(lastWeek);
});

//Retrieve monthly transactions from PLAID
app.post('/api/get_monthly_transactions', async (req, res) =>{
    const startDate = moment().subtract(31, "days").format("YYYY-MM-DD");
    const endDate = moment().format("YYYY-MM-DD");
    const getTransactions = await client.transactionsGet({
        access_token: req.body.access_token,
        start_date: startDate,
        end_date: endDate
    })
    console.log(getTransactions.data)
    res.json(getTransactions.data.transactions)
});

//Retrieve weekly transactions from PLAID
app.post('/api/get_weekly_transactions', async(req, res)=>{
    const startDate = moment().subtract(7, 'days').format("YYYY-MM-DD");
    const endDate = moment().format('YYYY-MM-DD');
    const getTransactions = await client.transactionsGet({
        access_token: req.body.access_token,
        start_date: startDate,
        end_date: endDate
    });
    console.log(getTransactions.data);
    res.json(getTransactions.data.transactions);
});