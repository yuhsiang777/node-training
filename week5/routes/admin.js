const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')

const { isNotValidString, isNotValidInteger } = require('../utils/validUtils')

router.post('/coaches/courses', async (req, res, next) => {
  try {
    // TODO 可以做檢查日期格式
    // 可以用 moment
    const { user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body
    if (isNotValidString(user_id) || isNotValidString(skill_id) || isNotValidString(name)
      || isNotValidString(description) || isNotValidString(start_at) || isNotValidString(end_at)
      || isNotValidInteger(max_participants) || isNotValidString(meeting_url) || !meeting_url.startsWith('https')) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
      return
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
    } else if (findUser.role !== 'COACH') {
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
      description,
      meeting_url,
      start_at,
      end_at,
      name,
      max_participants,
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


router.post('/coaches/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params
    const { experience_years, description, profile_image_url } = req.body

    if (isNotValidString(userId) || isNotValidInteger(experience_years) || isNotValidString(description)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確"
      })
    }

    if (profile_image_url && isNotValidString(profile_image_url) && !profile_image_url.starstWith('https')) {
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
          name: 'userResult.name',
          role: 'userResult.role'
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
