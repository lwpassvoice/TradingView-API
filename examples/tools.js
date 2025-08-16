module.exports.generateComexCodes = function generateComexCodes(years) {
  const monthCodes = {
    1: 'F', 2: 'G', 3: 'H', 4: 'J', 5: 'K', 6: 'M',
    7: 'N', 8: 'Q', 9: 'U', 10: 'V', 11: 'X', 12: 'Z'
  };
  
  const codes = [];
  
  // 遍历所有年份
  years.forEach(year => {
    // 为每个年份生成12个月的代码
    for (let month = 1; month <= 12; month++) {
      codes.push(`GC${monthCodes[month]}${year}`);
    }
  });
  
  return codes;
}