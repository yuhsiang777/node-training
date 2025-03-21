const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('CreditPackage');
const {
  isUndefined,
  isNotValidString,
  isNotValidInteger,
  isNotValidUuid
} = require('../utils/validUtils');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/resHandle');

router.get('/', async (req, res, next) => {
  try {
    const packages = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"]
    });

    sendSuccessResponse(res, packages);

  } catch (error) {
    logger.error(error)
    next(error)
  }
})

// 新增購買方案
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;

    // 資料驗證
    if (
      isUndefined(data.name) || isNotValidString(data.name) ||
      isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
      isUndefined(data.price) || isNotValidInteger(data.price)
    ) {
      sendErrorResponse(res, 400, '欄位未填寫正確');
      return;
    }

    const creditPackageRepo = await dataSource.getRepository('CreditPackage')
    const existPackage = await creditPackageRepo.find({
      where: {
        name: data.name
      }
    })
    if (existPackage.length > 0) {
      sendErrorResponse(res, 409, '資料重複');  // 使用封裝的錯誤回應函數
      return;
    }

    // 新增資料
    const newPackage = await creditPackageRepo.create(
      {
        name: data.name,
        credit_amount: data.credit_amount,
        price: data.price
      }
    )
    const result = await creditPackageRepo.save(newPackage)
    sendSuccessResponse(res, result);
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

// 刪除購買方案
router.delete('/:creditPackageId', async (req, res, next) => {
  try {
    const { creditPackageId } = req.params;

    // 驗證 ID 格式
    if (isUndefined(creditPackageId) || isNotValidString(creditPackageId)) {
      sendErrorResponse(res, 400, 'ID 錯誤');
      return;
    }

    // 刪除操作
    const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
    if (result.affected === 0) {
      sendErrorResponse(res, 400, 'ID 不存在');
      return
    }

    sendSuccessResponse(res, { message: '刪除購買方案' });
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

module.exports = router