const moment = require('moment')

// 檢查是否為 undefined
function isUndefined(value) {
  return value === undefined
}

// 驗證是否為非空字串
function isNotValidString(value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

// 驗證是否為有效的正整數
function isNotValidInteger(value) {
  return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

// 驗證是否為有效的 UUID 格式
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
function isNotValidUuid(value) {
  return typeof value !== 'string' || !uuidRegex.test(value)
}

// 驗證是否為有效的電子郵件格式
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
function isNotValidEmail(value) {
  return typeof value !== 'string' || !emailRegex.test(value)
}

// 驗證密碼格式：包含數字、大寫字母、小寫字母，且長度 8 到 16
const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
function isNotValidPassword(value) {
  return typeof value !== 'string' || !passwordRegex.test(value)
}

// 驗證日期字串是否有效
function isNotValidDate(value) {
  return typeof value !== 'string' || moment(value, 'YYYY-MM-DD', true).isValid() === false
}

// 驗證 ISO 8601 格式的日期字串 (例如: 2025-03-21T13:45:00Z)
function isNotValidIsoDate(value) {
  return typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)
}

// 驗證是否為 HTTPS URL 格式
const isValidHttpsUrl = (url) => /^https:\/\/.+$/.test(url)

// 驗證是否為正數
function isNotValidPositiveNumber(value) {
  return typeof value !== 'number' || value <= 0
}

// 驗證字串是否為有效 JSON 格式
function isNotValidJson(value) {
  try {
    JSON.parse(value)
    return false  // 不是有效的 JSON 格式則返回 true
  } catch (error) {
    return true  // 如果無法解析，則表示不是有效的 JSON 格式
  }
}

module.exports = {
  isUndefined,
  isNotValidString,
  isNotValidInteger,
  isNotValidUuid,
  isNotValidEmail,
  isNotValidPassword,
  isNotValidDate,
  isNotValidIsoDate,
  isValidHttpsUrl,
  isNotValidPositiveNumber,
  isNotValidJson
}