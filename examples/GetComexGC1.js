const TradingView = require("../main");
const fs = require("fs");
const path = require("path");

if (!process.env.SESSION || !process.env.SIGNATURE) {
  throw Error("Please set your sessionid and signature cookies");
}

const client = new TradingView.Client({
  token: process.env.SESSION,
  signature: process.env.SIGNATURE,
  proxy: "http://127.0.0.1:7890",
});

const chart = new client.Session.Chart();
const symbol = "GC1!";
const oneTimeFetchCount = 1000;
const fromStamp = Math.round(new Date().getTime() / 1000) - 86400 * 10;
const toStamp = Math.round(new Date().getTime() / 1000);

chart.setMarket(symbol, {
  timeframe: "1",
  range: -1, // Range is negative, so 'to' means 'from'
  to: fromStamp,
});

let interval = NaN;

chart.onUpdate(async () => {
  const times = chart.periods.map((p) => p.time);
  console.log("update length: ", times.length);

  const intrval = times[0] - times[1];
  if (Number.isNaN(interval) && times.length >= 2) interval = intrval;

  if (!Number.isNaN(interval) && interval !== intrval) {
    throw new Error(`Wrong interval: ${intrval} (should be ${interval})`);
  }

  console.log(
    "First ->",
    times[0],
    new Date(times[0] * 1000).toLocaleString(),
    'toStamp: ',
    toStamp,
    'diff: ',
    times[0] - toStamp,
  );

  console.log(
    "Last ->",
    times[times.length - 1],
    new Date(times[times.length - 1] * 1000).toLocaleString()
  );

  if (times[0] > toStamp) {
    fs.writeFileSync(
      path.join(__dirname, `../files/comex_gc/GC1_${Date.now()}.data.json`),
      JSON.stringify(
        chart.periods.map((p) => ({
          ...p,
          date: new Date(p.time * 1000).toLocaleString(),
        })),
        null,
        2
      )
    );
    await client.end();
    console.log("Done !", times.length);
  }

  console.log("fetchMore 0", times[0]);
  console.log("fetchMore 1", times[times.length - 1]);
  chart.fetchMore(-oneTimeFetchCount);
});
