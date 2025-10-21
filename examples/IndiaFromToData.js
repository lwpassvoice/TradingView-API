const fs = require('fs');
const path = require('path');
const TradingView = require('../main');

/**
 * This example tests fetching chart data of a number
 * of candles before or after a timestamp
 */

if (!process.env.SESSION || !process.env.SIGNATURE) {
  throw Error('Please set your sessionid and signature cookies');
}

const client = new TradingView.Client({
  token: process.env.SESSION,
  signature: process.env.SIGNATURE,
  proxy: 'http://127.0.0.1:7890',
});

const chart = new client.Session.Chart();
// chart.setMarket('NASDAQ:PLCE', {
//   timeframe: 'D',
//   range: 1000, // Can be positive to get before or negative to get after
//   to: 1705000000,
// });

chart.setMarket('MCX-GOLD1!', {
  timeframe: 'D',
  range: 1000, // Can be positive to get before or negative to get after
  to: new Date().getTime() / 1000,
});

chart.onSymbolLoaded(() => {
  console.log(chart.infos.name, 'loaded !');
});

chart.onUpdate(() => {
  console.log('OK', chart.periods.length);
  client.end();
});

// This works with indicators

TradingView.getIndicator('STD;Supertrend').then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(() => {
    console.log('Prices periods:', chart.periods.length);
    fs.writeFileSync(path.join(__dirname, '../files/india/GCZ2025.data.json'), JSON.stringify(chart.periods));
    fs.writeFileSync(path.join(__dirname, '../files/india/GCZ2025.supertrend.json'), JSON.stringify(SUPERTREND.periods));
    console.log('Study periods:', SUPERTREND.periods.length);
    client.end();
  });
});
