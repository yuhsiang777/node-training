const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')

const { isNotValidString, isNotValidInteger } = require('../utils/validUtils')
const moment = require('moment');

router.post('/coaches/courses', async (req, res, next) => {
  try {
    const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

    // 驗證 UUID 格式
    /*if (!isValidUUID(user_id) || !isValidUUID(skill_id)) {
      return res.status(400).json({
        status: "failed",
        message: "user_id 或 skill_id 格式不正確"
      });
    }*/

    if (isNotValidString(user_id) || isNotValidString(skill_id) || isNotValidString(name) ||
      isNotValidString(description) || isNotValidString(start_at) || isNotValidString(end_at) ||
      !moment(start_at, 'YYYY-MM-DD HH:mm:ss', true).isValid() ||
      !moment(end_at, 'YYYY-MM-DD HH:mm:ss', true).isValid() ||
      (meeting_url && isNotValidString(meeting_url))) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
        fields: { user_id, skill_id, name, description, start_at, end_at, meeting_url }
      });

    }


    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({
      where: {
        id: user_id
      }
    })
    if (!findUser) {
      res.status(400).json({
        status: "failed",
        message: "使用者不存在"
      })
      return
    } else if (findUser && findUser.role !== "COACH") {
      res.status(400).json({
        status: "failed",
        message: "使用者尚未成為教練"
      })
      return
    }

    const courseRepo = dataSource.getRepository('Course')
    const newCourse = courseRepo.create({
      user_id,
      skill_id,
      name,
      description,
      max_participants,
      start_at,
      end_at,
      meeting_url
    })
    const result = await courseRepo.save(newCourse)

    res.status(201).json({
      status: "success",
      data: {
        course: result
      }
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

router.put('/coaches/courses/:courseId', async (req, res, next) => {
  try {
    const { courseId } = req.params
    // TODO 可以做檢查日期格式，可以用 moment
    const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

    // 使用 isNotValidString 和 isNotValidInteger 進行檢查
    if (isNotValidString(courseId) // 檢查 courseId 是否有效字串
      || isNotValidString(skill_id) // 檢查 skill_id 是否有效字串
      || isNotValidString(name) // 檢查 name 是否有效字串
      || isNotValidString(description) // 檢查 description 是否有效字串
      || isNotValidString(start_at) // 檢查 start_at 是否有效字串
      || isNotValidString(end_at) // 檢查 end_at 是否有效字串
      || isNotValidInteger(max_participants) // 檢查 max_participants 是否有效整數
      || isNotValidString(meeting_url) // 檢查 meeting_url 是否有效字串
      || !meeting_url.startsWith('https')) { // 檢查 meeting_url 是否以 "https" 開頭
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
      return
    }

    const courseRepo = dataSource.getRepository('Course')
    const findCourse = await courseRepo.findOne({
      where: {
        id: courseId
      }
    })
    if (!findCourse) {
      res.status(400).json({
        status: "failed",
        message: "課程不存在"
      })
      return
    }

    const updateCourse = await courseRepo.update({
      id: courseId
    }, {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      meeting_url,
      max_participants
    })
    if (updateCourse.affected === 0) {
      res.status(400).json({
        status: "failed",
        message: "更新課程失敗"
      })
      return
    }

    const courseResult = await courseRepo.findOne({
      where: {
        id: courseId
      }
    })

    res.status(201).json({
      status: "success",
      data: {
        course: courseResult
      }
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})

router.post('/coaches/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params
    const { experience_years, description, profile_image_url } = req.body

    if (isNotValidString(userId) || isNotValidInteger(experience_years) || isNotValidString(description)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
      return
    }

    if (profile_image_url && isNotValidString(profile_image_url) && !profile_image_url.startsWith('https')) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
      return
    }

    const userRepo = dataSource.getRepository('User')
    const findUser = await userRepo.findOne({
      where: {
        id: userId
      }
    })
    if (!findUser) {
      res.status(400).json({
        status: "failed",
        message: "使用者不存在"
      })
      return
    }

    const updateUser = await userRepo.update({
      id: userId
    }, {
      role: 'COACH'
    })
    if (updateUser.affected === 0) {
      res.status(400).json({
        status: "failed",
        message: "更新使用者失敗"
      })
      return
    } else if (findUser.role === 'COACH') {
      res.status(409).json({
        status: "failed",
        message: "使用者已經是教練"
      })
      return
    }

    const coachRepo = dataSource.getRepository('Coach')
    const newCoach = coachRepo.create({
      user_id: userId,
      description,
      experience_years,
      profile_image_url
    })
    const coachResult = await coachRepo.save(newCoach)
    const userResult = await userRepo.findOne({
      where: {
        id: userId
      }
    })


    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: userResult.name,
          role: userResult.role
        },
        coach: coachResult
      }
    })
  } catch (error) {
    logger.error(error)
    next(error)
  }
})



module.exports = router
