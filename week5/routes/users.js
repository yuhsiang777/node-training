const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')

const { isUndefined, isNotValidString, isNotValidEmail, isNotValidPassword } = require('../utils/validUtils');

const { sendErrorResponse, sendSuccessResponse } = require('../utils/resHandle');

const saltRounds = 10;

// 新增使用者
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 驗證必填欄位及格式
    if (
      isUndefined(name) ||
      isUndefined(email) ||
      isUndefined(password) ||
      isNotValidString(name) ||
      isNotValidEmail(email) ||
      isNotValidString(password)
    ) {
      logger.warn('欄位未填寫正確');
      return sendErrorResponse(res, 400, '欄位未填寫正確');
    }

    // 密碼格式驗證
    if (isNotValidPassword(password)) {
      logger.warn('使用者建立錯誤: 密碼不符合規則');
      return sendErrorResponse(res, 400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字');
    }

    const userRepo = dataSource.getRepository('User');

    // 檢查 email 是否已存在
    const findUser = await userRepo.findOne({ where: { email } });
    if (findUser) {
      logger.warn('使用者建立錯誤: Email 已被使用');
      return sendErrorResponse(res, 409, 'Email已被使用');
    }

    // 密碼加密
    const hashPassword = await bcrypt.hash(password, saltRounds);

    // 建立新使用者
    const newUser = userRepo.create({
      name,
      password: hashPassword,
      email,
      role: 'USER',
    });

    const result = await userRepo.save(newUser);

    // 成功回應
    logger.info('新建立的使用者ID:', result.id);
    return sendSuccessResponse(res, {
      user: {
        id: result.id,
        name: result.name,
      },
    });
  } catch (error) {
    logger.error('建立使用者錯誤:', error);
    next(error);
  }
});

module.exports = router;