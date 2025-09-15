const TradingView = require("../main");
const fs = require("fs");
const path = require("path");
const { generateComexCodes } = require("./tools");
const years = [2020, 2021, 2022, 2023, 2024, 2025];
// const symbolsTmp = generateComexCodes(years);
// console.log(symbolsTmp);
const symbolsTmp = [
  'GCF2019', 'GCG2019', 'GCH2019', 'GCJ2019', 'GCK2019',
  'GCM2019', 'GCN2019', 'GCQ2019', 'GCU2019', 'GCV2019',
  'GCX2019', 'GCZ2019',
  'GCF2020', 'GCG2020', 'GCH2020', 'GCJ2020', 'GCK2020',
  'GCM2020', 'GCN2020', 'GCQ2020', 'GCU2020', 'GCV2020',
  'GCX2020', 'GCZ2020', 'GCF2021', 'GCG2021', 'GCH2021',
  'GCJ2021', 'GCK2021', 'GCM2021', 'GCN2021', 'GCQ2021',
  'GCU2021', 'GCV2021', 'GCX2021', 'GCZ2021', 'GCF2022',
  'GCG2022', 'GCH2022', 'GCJ2022', 'GCK2022', 'GCM2022',
  'GCN2022', 'GCQ2022', 'GCU2022', 'GCV2022', 'GCX2022',
  'GCZ2022', 'GCF2023', 'GCG2023', 'GCH2023', 'GCJ2023',
  'GCK2023', 'GCM2023', 'GCN2023', 'GCQ2023', 'GCU2023',
  'GCV2023', 'GCX2023', 'GCZ2023', 'GCF2024', 'GCG2024',
  'GCH2024', 'GCJ2024', 'GCK2024', 'GCM2024', 'GCN2024',
  'GCQ2024', 'GCU2024', 'GCV2024', 'GCX2024', 'GCZ2024',
  'GCF2025', 'GCG2025', 'GCH2025', 'GCJ2025', 'GCK2025',
  'GCM2025', 'GCN2025', 'GCQ2025', 'GCU2025', 'GCV2025',
  'GCX2025', 'GCZ2025'
]

const symbols = ['GCN2025', 'GCQ2025', 'GCU2025', 'GCV2025',
  'GCX2025', 'GCZ2025', 'GCF2026'];
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

(async function () {
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    console.log(`${new Date().toLocaleString()} Loading ${symbol}...`);

    const getData = () => {
      return new Promise(async (resolve, reject) => {
        const chart = new client.Session.Chart();

        chart.setMarket(`COMEX:${symbol}`, {
          timeframe: "D",
          range: 300, // Can be positive to get before or negative to get after
          to: new Date().getTime() / 1000,
        });

        // This works with indicators

        const indic = await TradingView.getIndicator("STD;Supertrend");
        console.log(`Loading '${indic.description}' study...`);
        const SUPERTREND = new chart.Study(indic);

        SUPERTREND.onUpdate(async () => {
          console.log(`onUpdate ${symbol}`);
          resolve({
            prices: chart.periods?.map((item) => ({
              ...item,
              date: new Date(item.time * 1000).toLocaleString(),
            })),
            supertrend: SUPERTREND.periods?.map((item) => ({
              ...item,
              date: new Date(item.$time * 1000).toLocaleString(),
            })),
          });
        });
      });
    };

    const data = await getData();
    console.log("Prices periods:", data.prices.length);
    console.log("Study periods:", data.supertrend.length);

    fs.writeFileSync(
      path.join(__dirname, `../files/comex_gc/COMEX_${symbol}.data.json`),
      JSON.stringify(data.prices, null, 2)
    );
    fs.writeFileSync(
      path.join(__dirname, `../files/comex_gc/COMEX_${symbol}.supertrend.json`),
      JSON.stringify(data.supertrend, null, 2)
    );

    if (i < symbols.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 15000)); // 每次循环暂停15秒
    }
  }
  console.log("All done!");
  client.end();
  process.exit(0);
})();
