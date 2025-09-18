// 读取XAUUSD.data.json并格式化
// [{"time":1755723600,"open":3351.2,"close":3340.285,"max":3352.3,"min":3334.285,"volume":66978},{"time":1755637200,"open":3316.49,"close":3348.485,"max":3350.275,"min":3311.56,"volume":246761},{"time":1755550800,"open":3333.695,"close":3315.7,"max":3345.465,"min":3315.005,"volume":207968},{"time":1755464400,"open":3335.23,"close":3332.895,"max":3358.49,"min":3323.685,"volume":275035},{"time":1755205200,"open":3336.795,"close":3335.7,"max":3348.915,"min":3332.34,"volume":227980},{"time":1755118800,"open":3357.46,"close":3335.585,"max":3374.805,"min":3329.85,"volume":364944},]
// 格式化后
// [
//   {
//     time: 1755723600000,
//     open: 3351.2,
//     close: 3340.285,
//     high: 3352.3,
//     low: 3334.285,
//     volume: 66978,
//     date: '2025/8/21 05:00:00',
//   },
// ];
// 要求：1. time转换成毫秒时间戳。 2. 添加date字段，为time对应时间。

// const timestamp = 1755723600000;
// const date = new Date(timestamp);
// const options = {
//   timeZone: 'Europe/London',
//   year: 'numeric',
//   month: '2-digit',
//   day: '2-digit',
//   hour: '2-digit',
//   minute: '2-digit',
//   second: '2-digit',
//   hour12: false // 使用24小时制
// };
// const londonTime = date.toLocaleString('en-GB', options);

const fs = require("fs");
const path = require("path");
const data = require("./D/XAGUSD.data.json");

// function formatData(rawData) {
//   return rawData.map((item) => {
//     const date = new Date(item.time * 1000 + 3 * 3600000);
//     date.setUTCHours(0, 0, 0, 0);
//     const dateStr = date.toLocaleString();
//     return {
//       time: item.time * 1000,
//       open: item.open,
//       close: item.close,
//       high: item.max,
//       low: item.min,
//       volume: item.volume,
//       date: dateStr,
//     };
//   });
// }

function formatData(rawData) {
  return rawData.map((item) => {
    return {
      time: item.time * 1000,
      open: item.open,
      close: item.close,
      high: item.max,
      low: item.min,
      volume: item.volume,
      date: new Date(item.time * 1000).toLocaleString(),
    };
  });
}

const formattedData = formatData(data);
// 写入文件
fs.writeFileSync(
  path.join(__dirname, "XAGUSD.data.formatted.json"),
  JSON.stringify(formattedData, null, 2)
);
