### powershell 配置临时代理
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"

node .\examples\ComexGCFormToData.js
node .\examples\ComexSIFormToData.js
node .\examples\GetXAUUSDData.js
node .\examples\GetXAGUSDData.js
