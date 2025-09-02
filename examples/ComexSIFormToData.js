const TradingView = require("../main");
const fs = require("fs");
const path = require("path");
const { generateComexCodes } = require("./tools");
const years = [2020, 2021, 2022, 2023, 2024, 2025];
// const symbolsTmp = generateComexCodes(years, 'SI');
// console.log(symbolsTmp);
const symbolsTmp = [
  'SIF2019', 'SIG2019', 'SIH2019', 'SIJ2019', 'SIK2019',
  'SIM2019', 'SIN2019', 'SIQ2019', 'SIU2019', 'SIV2019',
  'SIX2019', 'SIZ2019',
  'SIF2020', 'SIG2020', 'SIH2020', 'SIJ2020', 'SIK2020',
  'SIM2020', 'SIN2020', 'SIQ2020', 'SIU2020', 'SIV2020',
  'SIX2020', 'SIZ2020', 'SIF2021', 'SIG2021', 'SIH2021',
  'SIJ2021', 'SIK2021', 'SIM2021', 'SIN2021', 'SIQ2021',
  'SIU2021', 'SIV2021', 'SIX2021', 'SIZ2021', 'SIF2022',
  'SIG2022', 'SIH2022', 'SIJ2022', 'SIK2022', 'SIM2022',
  'SIN2022', 'SIQ2022', 'SIU2022', 'SIV2022', 'SIX2022',
  'SIZ2022', 'SIF2023', 'SIG2023', 'SIH2023', 'SIJ2023',
  'SIK2023', 'SIM2023', 'SIN2023', 'SIQ2023', 'SIU2023',
  'SIV2023', 'SIX2023', 'SIZ2023', 'SIF2024', 'SIG2024',
  'SIH2024', 'SIJ2024', 'SIK2024', 'SIM2024', 'SIN2024',
  'SIQ2024', 'SIU2024', 'SIV2024', 'SIX2024', 'SIZ2024',
  'SIF2025', 'SIG2025', 'SIH2025', 'SIJ2025', 'SIK2025',
  'SIM2025', 'SIN2025', 'SIQ2025', 'SIU2025', 'SIV2025',
  'SIX2025', 'SIZ2025'
]

const symbols = symbolsTmp;
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
      path.join(__dirname, `../files/comex_si/COMEX_${symbol}.data.json`),
      JSON.stringify(data.prices, null, 2)
    );
    fs.writeFileSync(
      path.join(__dirname, `../files/comex_si/COMEX_${symbol}.supertrend.json`),
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
