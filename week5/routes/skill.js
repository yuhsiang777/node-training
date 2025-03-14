const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')
const { isUndefined, isNotValidString, isNotValidInteger } = require('../utils/validUtils')

router.get('/', async (req, res, next) => {
  try {
    const packages = await dataSource.getRepository("Skill").find({
      select: ["id", "name"]
    });

    res.status(200).json({
      status: "success",
      data: packages
    })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    if (isUndefined(data.name) || isNotValidString(data.name)) {
      res.status(400).json({
        "status": "failed",
        "message": "欄位未填寫正確"
      })
      return
    }
    const skillRepo = await dataSource.getRepository("Skill")
    const existSkill = await skillRepo.find({
      where: {
        name: data.name
      }
    })
    if (existSkill.length > 0) {

      res.status(409).json({
        "status": "failed",
        "message": "資料重複"
      })
      
      return
    }
    const newSkill = await skillRepo.create({
      name: data.name
    })
    const result = await skillRepo.save(newSkill)
    res.status(409).json({
      "status": "failed",
      "message": "資料重複"
    })
    res.writeHead(200, headers)
    res.write(JSON.stringify({
      status: "success",
      data: result
    }))
    res.end()
  } catch (error) {
    next(error)
  }
})

router.delete('/:creditPackageId', async (req, res, next) => {
  try {

  } catch (error) {
    next(error)
  }
})

module.exports = router
