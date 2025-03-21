const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')
const { isUndefined, isNotValidString } = require('../utils/validUtils')

const { sendErrorResponse, sendSuccessResponse } = require('../utils/resHandle');

router.get('/', async (req, res, next) => {
  try {
    const skills = await dataSource.getRepository("Skill").find({
      select: ["id", "name"]
    });

    sendSuccessResponse(res, skills);
  } catch (error) {
    logger.error('取得技能列表時發生錯誤:', error);
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    if (isUndefined(data.name) || isNotValidString(data.name)) {
      sendErrorResponse(res, 400, '欄位未填寫正確');
      return;
    }
    const skillRepo = await dataSource.getRepository("Skill");
    const existSkill = await skillRepo.find({
      where: {
        name: data.name
      }
    });
    if (existSkill.length > 0) {
      sendErrorResponse(res, 409, '資料重複');
      return;
    }

    const newSkill = await skillRepo.create({
      name: data.name
    });
    const result = await skillRepo.save(newSkill);

    sendSuccessResponse(res, result);
  } catch (error) {
    logger.error(error)
    next(error)
  }
});

router.delete('/:skillId', async (req, res, next) => {
  try {
    const { skillId } = req.params;
    if (isUndefined(skillId) || isNotValidString(skillId) || isNotValidUuid(skillId)) {
      sendErrorResponse(res, 400, 'ID錯誤');
      return;
    }

    const result = await dataSource.getRepository("Skill").delete(skillId);
    if (result.affected === 0) {
      sendErrorResponse(res, 404, 'ID錯誤');
      return;
    }

    sendSuccessResponse(res, { message: '刪除成功' });
  } catch (error) {
    logger.error(error)
    next(error)
  }
});

module.exports = router;