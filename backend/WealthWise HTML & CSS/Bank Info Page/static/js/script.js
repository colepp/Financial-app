// Sample data for the bar chart
const data = [30, 86, 168, 281, 303, 365];

var session_access_token = null;

// Set chart dimensions
const width = 500;
const height = 300;
const barWidth = width / data.length;



// Create an SVG container
const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Create bars
svg.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * barWidth)
  .attr('y', d => height - d)
  .attr('width', barWidth - 2)
  .attr('height', d => d)
  .attr('fill', 'rgba(132,220,198,1)');

async function getAccessToken() {
  if(!(session_access_token)){
    const ac = await fetch('http://localhost:3000/get_access_token');
    if(ac.ok){
      const temp_access_token = await ac.json();
      console.log(temp_access_token);
    }
    
  }
}

getAccessToken();
