// XAUUSD
const TradingView = require("../main");
const fs = require("fs");
const path = require("path");

/**
 * This example tests fetching chart data of a number
 * of candles before or after a timestamp
 */

if (!process.env.SESSION || !process.env.SIGNATURE) {
  throw Error("Please set your sessionid and signature cookies");
}

const client = new TradingView.Client({
  token: process.env.SESSION,
  signature: process.env.SIGNATURE,
  proxy: 'http://127.0.0.1:7890',
});

const chart = new client.Session.Chart();
const timeframe = "30";
const year = '2025';

chart.setMarket("XAGUSD", {
  timeframe,
  range: 14400, // Can be positive to get before or negative to get after
  to: new Date(`${year}-12-31 23:59:59`).getTime() / 1000,
});

// This works with indicators
function formatData(rawData) {
  return rawData.map((item) => {
    return {
      time: item.time,
      open: item.open,
      close: item.close,
      max: item.max,
      min: item.min,
      volume: item.volume,
      date: new Date(item.time * 1000).toLocaleString(),
    };
  });
}

TradingView.getIndicator("STD;Supertrend").then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(() => {
    console.log("Prices periods:", chart.periods.length);
    console.log("Study periods:", SUPERTREND.periods.length);
    const dir = path.join(__dirname, `../files/xag/${timeframe}/`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `XAGUSD_${year}.data.json`),
      JSON.stringify(chart.periods)
    );
    fs.writeFileSync(
      path.join(dir, `XAGUSD_${year}.supertrend.json`),
      JSON.stringify(SUPERTREND.periods)
    );

    const formattedData = formatData(chart.periods);
    // 写入文件
    fs.writeFileSync(
      path.join(dir, `XAGUSD_${year}.data.formatted.json`),
      JSON.stringify(formattedData, null, 2)
    );

    client.end();
  });
});
