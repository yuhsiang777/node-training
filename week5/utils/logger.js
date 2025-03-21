const pino = require('pino')
const pretty = require('pino-pretty')

// 取得 Logger
module.exports = function getLogger(prefix, logLevel = 'debug') {
  return pino(
    pretty({
      level: logLevel, // 設置日誌級別
      messageFormat: `{prefix}: {msg}`, // 修正為正確的模板字符串格式
      colorize: true, // 顯示顏色
      sync: true, // 是否同步輸出
      translateTime: 'SYS:standard', // 顯示時間
      errorProps: 'stack' // 讓 `pino-pretty` 顯示錯誤堆疊
    })
  )
}
