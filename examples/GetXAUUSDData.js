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
});

const chart = new client.Session.Chart();

chart.setMarket("XAUUSD", {
  timeframe: "D",
  range: 1800, // Can be positive to get before or negative to get after
  to: new Date().getTime() / 1000,
});

// This works with indicators

TradingView.getIndicator("STD;Supertrend").then(async (indic) => {
  console.log(`Loading '${indic.description}' study...`);
  const SUPERTREND = new chart.Study(indic);

  SUPERTREND.onUpdate(() => {
    console.log("Prices periods:", chart.periods);
    fs.writeFileSync(
      path.join(__dirname, "../files/xau/XAUUSD.data.json"),
      JSON.stringify(chart.periods)
    );
    fs.writeFileSync(
      path.join(__dirname, "../files/xau/XAUUSD.supertrend.json"),
      JSON.stringify(SUPERTREND.periods)
    );
    console.log("Study periods:", SUPERTREND.periods);
    client.end();
  });
});
