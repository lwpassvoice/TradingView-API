#!/bin/bash
DB_USER="root"
DB_PASS="cceerr2018"
DB_NAME="finance_watcher"
SQL_DIR="D:/project/TradingView/TradingView-API/files/xau/30_sql/"
# SQL_DIR="D:/project/TradingView/TradingView-API/files/comex_gc/30_sql/"

for sql_file in $SQL_DIR/*.sql
do
  echo "正在导入: $sql_file"
  mysql -u $DB_USER -p$DB_PASS $DB_NAME < $sql_file
done
echo "所有SQL文件导入完成！"