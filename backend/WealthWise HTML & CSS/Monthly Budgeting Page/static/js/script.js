var session_access_token = null;

const api_url = 'http://localhost:8000';

//Function for fetching the connected account's access token
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

async function getTransactions(){
  
  //Get today's date
  const todayResponse = await fetch(`${api_url}/api/get_date`);
  const today = new Date(await todayResponse.json());
  today.setHours(0,0,0,0);

  //Get last month's date
  const lastMonthResponse = await fetch(`${api_url}/api/get_last_month_date`);
  const lastMonth = new Date(await lastMonthResponse.json());
  lastMonth.setHours(0,0,0,0);

  //Get access token from the backend server
  const access_token = await getAccessToken();

  //Get monthly transactions from the plaid server
  const transactionsResponse = await fetch(`${api_url}/api/get_monthly_transactions`,{
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({ access_token: access_token })
  });
  const transactions = await transactionsResponse.json();

  //Massage json data to get only the dates and amounts of transactions
  transactions.reverse();
  const actualTransactions = [];
  let totalAmount = 0;
  transactions.forEach(item => {
    if(item.amount > 0){
        const transactionDate = new Date(item.date)
        transactionDate.setHours(0,0,0,0)
        totalAmount += item.amount;
        const exists = actualTransactions.find(obj => obj.date.getTime() === transactionDate.getTime());
        if(exists && exists.date.getTime()){
            exists.amount += item.amount;
        }else{
            actualTransactions.push({
                date: transactionDate,
                amount: totalAmount
            })
        }
    }
    });

    //Add data for last month's date if no current transaction
    const existingFirst = actualTransactions.find(obj => obj.date.getTime() === lastMonth.getTime());
    if(!existingFirst){
        actualTransactions.unshift({
            date: lastMonth,
            amount: 0
        })
    }

    //Add data for today if no current transaction
    const existingLast = actualTransactions.find(obj => obj.date.getTime() === today.getTime());
    if(!existingLast){
        actualTransactions.push({
            date: today,
            amount: d3.max(actualTransactions, d => d.amount)
        })
    }

    //Graph Creation
    const margin = {top: 70, right: 30, bottom: 40, left: 80};
    const width = 800 - margin.left - margin.right;
    const height = 430 - margin.top - margin.bottom;

    //Creation of the x axis
    const x = d3.scaleTime()
        .range([0,width]);

    //Creation of the y-axis
    const y = d3.scaleLinear()
        .range([height,0]);
    
    //Selecting the "chart" div
    const svg = d3.select("#chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    //Indicating the domains of the x and y axes
    x.domain(d3.extent(actualTransactions, d=> d.date));
    y.domain([0, d3.max(actualTransactions, d => d.amount) + 20]).nice();


    //Appending the y-axis to the graph
    svg.append("g")
        .call(d3.axisLeft(y)
            .tickFormat(d3.format("$,")));

    //Appending the x-axis to the graph
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat("%m-%d")))
            .selectAll('text')
                .attr('transform', 'translate(-10,0)rotate(-45)')
                .style('text-anchor', 'end')

    //Creation of area under line
    const area = d3.area()
        .x(d => x(d.date))
        .y0(height) 
        .y1(d => y(d.amount))

    //Creation of line
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.amount));

    //Appending path of area under line
    svg.append("path")
        .datum(actualTransactions)
        .attr("fill", "#b8d9d0")
        .attr("d", area);

    //Appending path of line
    svg.append("path")
        .datum(actualTransactions)
        .attr("fill","none")
        .attr("stroke", "#84dcc6")
        .attr("stroke-width", 2)
        .attr("d", line);
}

getTransactions();