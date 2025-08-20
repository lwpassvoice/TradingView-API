const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    const processed = data.map(item => {
      const date = new Date(item.time * 1000 + 3600000);
      date.setUTCHours(0, 0, 0, 0);
      return {
        ...item,
        time: Math.floor(date.getTime()),
        date: date.toLocaleString(),
      };
    });
    
    const outputDir = path.join(__dirname, 'formatted');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const newPath = path.join(outputDir, path.basename(filePath));
    fs.writeFileSync(newPath, JSON.stringify(processed, null, 2));
  } catch (e) {
    console.error(`处理文件${filePath}失败:`, e);
  }
};

fs.readdirSync(path.join(__dirname))
  .filter(f => f.startsWith('COMEX_') && f.endsWith('.data.json'))
  .forEach(processFile);