var session_access_token = null;

const api_url = 'http://localhost:8000';

async function getAccessToken() {
  let access_token;
  if(!(session_access_token)){
    const ac = await fetch('/get_access_token');
    if(ac.ok){
      access_token = await ac.json();
    }
    return access_token.accessToken;
  }
}

async function getInfo(){

  //Get access token
  const access_token = await getAccessToken();

  //Get balance and account name
  const balanceResponse = await fetch(`${api_url}/api/get_accounts`, {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({ access_token: access_token })
  });
  const balanceAccount = await balanceResponse.json();
  const balance = balanceAccount[0].balances.current;
  const account = balanceAccount[0].name;

  //Get bank name
  const bankResponse = await fetch(`${api_url}/api/get_connected_bank`, {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({ access_token: access_token })
  });
  const bankName= await bankResponse.json();

  //Get monthly transactions
  const transactionsResponse = await fetch(`${api_url}/api/get_monthly_transactions`,{
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({ access_token: access_token })
  });
  const transactions = await transactionsResponse.json();

  let actualTransactions = [];

  transactions.forEach(item => {
    if(item.amount > 0){
        const transactionDate = new Date(item.date)
        transactionDate.setHours(0,0,0,0)
        const date = transactionDate.toLocaleDateString();
        const num = item.amount.toFixed(2);
        //totalAmount += item.amount;
            actualTransactions.push({
                date: date,
                amount: num
            })
    }
    });

  //Put data in the correct divs, hide until loaded
  const bankDiv = document.getElementById('bankName');
  const accountDiv = document.getElementById('accountName');
  const balanceDiv = document.getElementById('accountBalance');
  bankDiv.style.display = 'block';
  bankDiv.innerHTML = `<p>Bank: ${bankName}</p>`;
  accountDiv.style.display = 'block';
  accountDiv.innerHTML = `<p>Account Name: ${account}</p>`
  balanceDiv.style.display = 'block';
  balanceDiv.innerHTML = `<p>Account Balance: $${balance}</p>`

  if(actualTransactions.length > 0){
    const transactionMessage = document.getElementById('transactionMessage');
    const tableBody = document.getElementById('transactionsTable');
    transactionMessage.style.display = 'block';
    transactionMessage.innerHTML = '<p>Monthly Transactions:</p>';
    tableBody.style.display = 'block';
    actualTransactions.forEach(item=>{
        const row = document.createElement('tr');
        row.innerHTML=`<td style="padding-right: 35px">${item.date}</td><td style="padding-left: 35px">$${item.amount}</td>`//<td>${item.age}</td>`;
        tableBody.appendChild(row);
  });
  } else{
    const transactionMessage = document.getElementById('transactionMessage');
    transactionMessage.style.display = 'block';
    transactionMessage.innerHTML = '<p>Monthly Transactions: None </p>';

  }
}

getInfo();