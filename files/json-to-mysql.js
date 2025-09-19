const fs = require("fs");
const path = require("path");

/**
 * 从文件名提取 symbol
 * @param {string} filename - 文件名
 * @returns {string} - 提取的 symbol
 */
function extractSymbolFromFilename(filename) {
  // 移除扩展名
  const withoutExt = path.basename(filename, ".json");

  // 移除 .data 部分（如果存在）
  const withoutData = withoutExt.replace(".data", "");

  // 处理不同类型的文件名
  if (withoutData.includes("COMEX_")) {
    // COMEX_GCF2019 -> COMEX:GCF2019
    return withoutData.replace("COMEX_", "COMEX:");
  } else if (withoutData.includes("_") && /\d{4}$/.test(withoutData)) {
    // XAUUSD_2025 -> XAUUSD (移除年份部分)
    return withoutData.replace(/_\d{4}$/, "");
  } else if (withoutData.includes("_")) {
    // 其他带下划线的情况，保留原样但替换第一个下划线为冒号
    const parts = withoutData.split("_");
    if (parts.length > 1) {
      return `${parts[0]}:${parts.slice(1).join("_")}`;
    }
    return withoutData;
  } else {
    // XAUUSD -> XAUUSD (无变化)
    return withoutData;
  }
}

/**
 * 读取并解析 JSON 文件
 * @param {string} filePath - JSON 文件路径
 * @returns {Array} - 解析后的数据数组
 */
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件 ${filePath} 时出错:`, error.message);
    throw error;
  }
}

/**
 * 生成创建表的 SQL 语句
 * @returns {string} - 创建表的 SQL 语句
 */
function generateCreateTableSQL() {
  return `-- 创建交易数据表
CREATE TABLE IF NOT EXISTS trading_view_data (
    time INT NOT NULL,
    open FLOAT NOT NULL,
    close FLOAT NOT NULL,
    max FLOAT NOT NULL,
    min FLOAT NOT NULL,
    volume INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    PRIMARY KEY (symbol, time),
    INDEX symbol_index (symbol),
    INDEX time_index (time),
    UNIQUE KEY symbol_time_unique (symbol, time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;
}

/**
 * 生成插入数据的 SQL 语句
 * @param {Array} data - 要插入的数据
 * @param {string} symbol - 交易品种符号
 * @param {number} batchSize - 批量插入大小
 * @returns {string} - 插入数据的 SQL 语句
 */
function generateInsertSQL(data, symbol, batchSize = 100) {
  let sql = "";

  // 添加注释说明
  sql += `-- 插入 ${symbol} 的数据，共 ${data.length} 条记录\n`;

  // 分批处理以避免生成过大的 SQL 语句
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const values = batch
      .map(
        (item) =>
          `(${item.time}, ${item.open}, ${item.close}, ${item.max}, ${item.min}, ${item.volume}, '${symbol}')`
      )
      .join(",\n    ");

    sql += `INSERT INTO trading_view_data (time, open, close, max, min, volume, symbol)
VALUES
    ${values}
ON DUPLICATE KEY UPDATE
    open = VALUES(open),
    close = VALUES(close),
    max = VALUES(max),
    min = VALUES(min),
    volume = VALUES(volume);

`;
  }

  return sql;
}

/**
 * 处理单个文件并生成 SQL
 * @param {string} filePath - 文件路径
 * @param {number} batchSize - 批量插入大小
 * @returns {string} - 生成的 SQL 内容
 */
function processFile(filePath, batchSize) {
  try {
    console.log(`处理文件: ${filePath}`);

    // 从文件名提取 symbol
    const filename = path.basename(filePath);
    const symbol = extractSymbolFromFilename(filename);
    console.log(`提取的 symbol: ${symbol}`);

    // 读取和解析 JSON 数据
    const data = readJsonFile(filePath);
    console.log(`从文件读取 ${data.length} 条记录`);

    // 生成 SQL
    const createTableSQL = generateCreateTableSQL();
    const insertSQL = generateInsertSQL(data, symbol, batchSize);

    return createTableSQL + insertSQL;
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message);
    return "";
  }
}

/**
 * 主函数
 * @param {string} sourceDir - 源文件夹路径（包含JSON文件）
 * @param {string} outputDir - 输出文件夹路径（用于保存SQL文件）
 * @param {number} batchSize - 批量插入大小
 */
function main(sourceDir, outputDir, batchSize = 100) {
  try {
    // 检查源文件夹是否存在
    if (!fs.existsSync(sourceDir)) {
      console.error(`错误: 源文件夹不存在: ${sourceDir}`);
      process.exit(1);
    }

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`创建输出目录: ${outputDir}`);
    }

    // 读取源目录中的所有 JSON 文件
    const files = fs
      .readdirSync(sourceDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(sourceDir, file));

    console.log(`找到 ${files.length} 个 JSON 文件`);

    if (files.length === 0) {
      console.log("没有找到 JSON 文件");
      return;
    }

    // 处理每个文件
    for (const file of files) {
      const sqlContent = processFile(file, batchSize);

      if (sqlContent) {
        // 为每个 JSON 文件生成 SQL 文件
        const outputFilename = path.basename(file, ".json") + ".sql";
        const outputFile = path.join(outputDir, outputFilename);

        fs.writeFileSync(outputFile, sqlContent);
        console.log(`已生成 SQL 文件: ${outputFile}`);
      }
    }

    console.log("所有文件处理完成");
  } catch (error) {
    console.error("程序执行出错:", error.message);
    process.exit(1);
  }
}

// 解析命令行参数
function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "使用方法: node json-to-sql.js <源文件夹路径> <生成文件夹路径> [批量大小]"
    );
    console.log("示例: node json-to-sql.js ./data ./sql 100");
    process.exit(1);
  }

  const sourceDir = args[0];
  const outputDir = args[1];
  const batchSize = args[2] ? parseInt(args[2]) : 100;

  return { sourceDir, outputDir, batchSize };
}

// 运行主函数
const { sourceDir, outputDir, batchSize } = parseArguments();
main(sourceDir, outputDir, batchSize);
