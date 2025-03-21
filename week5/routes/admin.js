const express = require('express');
const router = express.Router();
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Admin');
const { isNotValidString, isNotValidInteger, isNotValidUuid } = require('../utils/validUtils');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/resHandle');
const moment = require('moment');

// 新增課程
router.post('/coaches/courses', async (req, res, next) => {
  try {
    const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body;

    // 驗證欄位有效性
    if (isNotValidString(user_id) || isNotValidString(skill_id) || isNotValidString(name) ||
      isNotValidString(description) || !moment(start_at).isValid() || !moment(end_at).isValid() ||
      (meeting_url && !meeting_url.startsWith('https://'))) {
      return sendErrorResponse(res, 400, '欄位未填寫正確');
    }

    // 檢查最大參與人數
    if (isNotValidInteger(max_participants) || max_participants <= 0) {
      return sendErrorResponse(res, 400, '最大參與人數無效');
    }

    // 檢查使用者是否存在並且是教練角色
    const userRepo = dataSource.getRepository('User');
    const findUser = await userRepo.findOne({ where: { id: user_id } });
    if (!findUser) {
      return sendErrorResponse(res, 400, '使用者不存在');
    } else if (findUser.role !== 'COACH') {
      return sendErrorResponse(res, 400, '使用者尚未成為教練');
    }

    // 創建並保存課程
    const courseRepo = dataSource.getRepository('Course');
    const newCourse = courseRepo.create({
      user_id,
      skill_id,
      name,
      description,
      max_participants,
      start_at,
      end_at,
      meeting_url
    });
    const result = await courseRepo.save(newCourse);

    return sendSuccessResponse(res, { course: result });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

// 更新課程
router.put('/coaches/courses/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body;

    // 驗證欄位有效性
    if (isNotValidString(courseId) || isNotValidString(skill_id) || isNotValidString(name) ||
      isNotValidString(description) || !moment(start_at).isValid() || !moment(end_at).isValid() ||
      isNotValidInteger(max_participants) || (meeting_url && !meeting_url.startsWith('https://'))) {
      return sendErrorResponse(res, 400, '欄位未填寫正確');
    }

    // 查找課程
    const courseRepo = dataSource.getRepository('Course');
    const findCourse = await courseRepo.findOne({ where: { id: courseId } });
    if (!findCourse) {
      return sendErrorResponse(res, 400, '課程不存在');
    }

    // 更新課程資訊
    const updateCourse = await courseRepo.update({ id: courseId }, {
      skill_id, name, description, start_at, end_at, meeting_url, max_participants
    });

    if (updateCourse.affected === 0) {
      return sendErrorResponse(res, 400, '更新課程失敗');
    }

    const courseResult = await courseRepo.findOne({ where: { id: courseId } });
    return sendSuccessResponse(res, { course: courseResult });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

// 設定使用者為教練
router.post('/coaches/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { experience_years, description, profile_image_url } = req.body;

    // 驗證欄位有效性
    if (isNotValidString(userId) || isNotValidInteger(experience_years) || isNotValidString(description)) {
      return sendErrorResponse(res, 400, '欄位未填寫正確');
    }

    if (profile_image_url && isNotValidString(profile_image_url) && !profile_image_url.startsWith('https')) {
      return sendErrorResponse(res, 400, '欄位未填寫正確');
    }

    // 查找使用者
    const userRepo = dataSource.getRepository('User');
    const findUser = await userRepo.findOne({ where: { id: userId } });
    if (!findUser) {
      return sendErrorResponse(res, 400, '使用者不存在');
    }

    // 檢查使用者是否已經是教練
    if (findUser.role === 'COACH') {
      return sendErrorResponse(res, 409, '使用者已經是教練');
    }

    // 更新使用者角色為教練
    const updateUser = await userRepo.update({ id: userId }, { role: 'COACH' });
    if (updateUser.affected === 0) {
      return sendErrorResponse(res, 400, '更新使用者失敗');
    }

    // 創建並保存教練資料
    const coachRepo = dataSource.getRepository('Coach');
    const newCoach = coachRepo.create({
      user_id: userId,
      description,
      experience_years,
      profile_image_url
    });
    const coachResult = await coachRepo.save(newCoach);

    const userResult = await userRepo.findOne({ where: { id: userId } });

    return sendSuccessResponse(res, {
      user: { name: userResult.name, role: userResult.role },
      coach: coachResult
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
