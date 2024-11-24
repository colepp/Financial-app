require('dotenv').config(); // loading .env files
const express = require('express'); // express init
const bodyParser = require('body-parser'); // parsing for JSON
const session = require('express-session'); // session tool for express
const app = express(); // making express app object

const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid'); // plaid tools
const json = require('body-parser/lib/types/json'); // json tool

// cole code input :) 
const cors = require('cors'); // making cors oject
app.use(cors()) // allow for access from all origins NOTE change on deployment

const PORT = process.env.PORT || 8000

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

app.get('/api/get_accounts', async (req, res, next) =>{
    const getAccounts = await client.accountsGet({
        access_token: req.session.access_token
    });
    console.log(getAccounts.data);
    res.json(getAccounts.data.accounts);
})

app.get('/api/get_transactions', async (req, res, next) =>{
    const getTransactions = await client.transactionsGet({
        access_token: req.session.access_token,
        start_date: '2024-10-01',
        end_date: '2024-10-10'
    });
    console.log(getTransactions.data);
    res.json(getTransactions.data.transactions);
})

