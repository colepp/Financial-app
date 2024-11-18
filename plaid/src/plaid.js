let linkTokenData
var bank;
const dis = document.getElementById('edit');

const initializeLink = async function() {
    const linkTokenResponse = await fetch('/api/create_link_token')
    linkTokenData = await linkTokenResponse.json()
    console.log(JSON.stringify(linkTokenData))
    console.log(JSON.stringify(linkTokenData.link_token))
}

const startLink = function(){
    if (linkTokenData == undefined){
        console.log('Why')
        return; 
    }
    const handler = Plaid.create({
        token: linkTokenData.link_token,
        onSuccess: async (publicToken, metadata) => {
            console.log('Public Token: ', publicToken)
            await exchangeToken(publicToken)
        },
        onExit: (err, metadata) => {
            console.log('Error: ', JSON.stringify(err))
            console.log('Metadata: ', metadata)
        },
        onEvent: (eventName, metadata) => {
            console.log('Event ', eventName)
        }
    })
    handler.open();
}

const exchangeToken = async function(publicToken){
    console.log(publicToken)
    const tokenExchangeResponse = await fetch('/api/exchange_public_token', {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({ public_token: publicToken }),
    })
    const tokenExchangeData = await tokenExchangeResponse.json()
    console.log('Done exchange token')
    window.location.href='index.html'

}

const checkConnect = async function(){
    const connected = await fetch('/api/is_user_connected');
    const connectResponse = await connected.json();
    console.log(JSON.stringify(connectResponse));
    dis.innerHTML = JSON.stringify(connectResponse['status']);
}

const findBank = async function(){
    var wecon;
    const connected = await fetch('/api/is_user_connected');
    const connectResponse = await connected.json();
    let con = JSON.stringify(connectResponse['status']);
    if(con == 'true'){
        wecon = true;
        const bankResponse = await fetch('/api/get_connected_bank')
        const bankName= await bankResponse.json();
        bank = bankName;
        console.log(bank);
        mybank(wecon);
    } else {
        wecon = false;
        mybank(wecon);
    }
}

const getAccounts = async function(){
    var wecon;
    const connected = await fetch('/api/is_user_connected');
    const connectResponse = await connected.json();
    let con = JSON.stringify(connectResponse['status']);
    if(con == 'true'){
        wecon = true;
        myacc(wecon);
    } else {
        wecon = false;
        myacc(wecon);
    }
}

const getTransactions = async function(){
    var wecon;
    const connected = await fetch('/api/is_user_connected');
    const connectResponse = await connected.json();
    let con = JSON.stringify(connectResponse['status']);
    if(con == 'true'){
        wecon = true;
        mytran(wecon);
    } else {
        wecon = false;
        mytran(wecon);
    }
}

document.querySelector('#getTransactions').addEventListener('click', getTransactions);
document.querySelector('#findBank').addEventListener('click', findBank);
document.querySelector('#connect').addEventListener('click', startLink);
document.querySelector('#testConnect').addEventListener('click', checkConnect);
document.querySelector('#getAccounts').addEventListener('click', getAccounts);
initializeLink();

function mybank(con){
    if(con){
        dis.innerHTML = bank;
    } else {
        dis.innerHTML = "You've not connected your bank";
    }
}

async function myacc(con){
    if(con){
        const accountsResponse = await fetch('/api/get_accounts');
        const accounts = await accountsResponse.json();
        console.log(JSON.stringify(accounts));
        dis.innerHTML="";
        let len = Number(JSON.stringify(accounts.length));
        for(let i=0;i<len;i++){
            if(JSON.stringify(accounts[i]['balances']['available']) != "null"){
                dis.innerHTML += JSON.stringify(accounts[i]['name']).replace(/"/g,"") + ": $" + JSON.stringify(accounts[i]['balances']['available']) + "<br>";
            } else {
                dis.innerHTML += JSON.stringify(accounts[i]['name']).replace(/"/g,"") + ": $" + JSON.stringify(accounts[i]['balances']['current']) + "<br>";
            }
        }
    } else {
        dis.innerHTML = "You've not connected your bank";
    }
}

async function mytran(con){
    if(con){
        const transactionsResponse = await fetch('/api/get_transactions');
        const transactions = await transactionsResponse.json();
        console.log(JSON.stringify(transactions));
        let len = Number(JSON.stringify(transactions.length));
        dis.innerHTML = "";
        for(let i=0;i<len;i++){
            if(JSON.stringify(transactions[i]['merchant_name']) != "null"){
                dis.innerHTML += JSON.stringify(transactions[i]['merchant_name']).replace(/"/g,"") + ": $" + JSON.stringify(transactions[i]['amount']) + "<br>";
            } else {
                dis.innerHTML += JSON.stringify(transactions[i]['name']).replace(/"/g,"") + ": $" + JSON.stringify(transactions[i]['amount']) + "<br>";
            }
        }
    } else {
        dis.innerHTML = "You've not connected your bank";
    }
}