require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');


const PORT = process.env.PORT || 8000

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: true,
    })
)

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.listen(PORT, () =>{
    console.log('We are up and running. Head over to http://localhost:8000/')
})

const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers:{
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        }
    }
})

const client = new PlaidApi(config)

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

app.get('/api/exchange_public_token', async(req, res, next)=>{
    const exchangeResponse = await client.itemPublicTokenExchange({
        public_token: req.body.public_token,
    })


console.log('Response: ', JSON.stringify(exchangeResponse.data))
req.session.access_token = exchangeResponse.data.access_token
res.json(true)
})