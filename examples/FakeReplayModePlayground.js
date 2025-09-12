const { Client } = require('../main');

/**
 * This example tests the fake replay mode which
 * works in intraday even with free plan
 */

console.log('----- Testing FakeReplayMode: -----');

const client = new Client({
  proxy: 'http://127.0.0.1:7890',
});
const chart = new client.Session.Chart();

chart.setMarket('XAUUSD', {
  timeframe: '240',
  range: -1, // Range is negative, so 'to' means 'from'
  to: Math.round(Date.now() / 1000) - 86400 * 3, // Seven days before now
  // to: 1600000000,
});

let interval = NaN;

chart.onUpdate(async () => {
  const times = chart.periods.map((p) => p.time);

  console.log('data length', chart.periods.length);
  console.log(chart.periods.map((p) => ({ ...p, date: new Date(p.time * 1000).toLocaleString() })));
  const intrval = times[0] - times[1];
  if (Number.isNaN(interval) && times.length >= 2) interval = intrval;

  if (!Number.isNaN(interval) && interval !== intrval) {
    throw new Error(`Wrong interval: ${intrval} (should be ${interval})`);
  }

  console.log('Next ->', times[0], new Date(times[0] * 1000).toLocaleString());

  if (times[0] > ((Date.now() / 1000) - 86400 * 1)) {
    await client.end();
    console.log('Done !', times.length);
  }

  chart.fetchMore(-2);
});
