require("dotenv").config()
const http = require("http");
const AppDataSource = require("./db");
const { isUndefined, isNotValidString, isNotValidInteger } = require('./validators')
const headers = require("./headers");
const errHandle = require("./errorHandle");

const requestListener = async (req, res) => {

  let body = "";

  req.on("data", (chunk) => {
    body += chunk
  })

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      const packages = await AppDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"]
      });

      res.writeHead(200, headers)
      res.write(JSON.stringify(
        {
          status: "success",
          data: packages
        }
      ))
      res.end();
    } catch (error) {
      errHandle(res, 500, 'error', '伺服器錯誤');
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (
          isUndefined(data.name) || isNotValidString(data.name) ||
          isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
          isUndefined(data.price) || isNotValidInteger(data.price)
        ) {
          errHandle(res, 400, 'failed', '欄位未填寫正確');
          return
        }
        const creditPackageRepo = await AppDataSource.getRepository('CreditPackage')
        const existPackage = await creditPackageRepo.find({
          where: {
            name: data.name
          }
        })
        if (existPackage.length > 0) {
          errHandle(res, 409, 'failed', '資料重複');
          return
        }
        const newPackage = await creditPackageRepo.create(
          {
            name: data.name,
            credit_amount: data.credit_amount,
            price: data.price
          }
        )
        const result = await creditPackageRepo.save(newPackage)
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end()
      } catch (error) {
        errHandle(res, 500, 'failed', '伺服器錯誤');
      }
    })
  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try {
      const packageId = req.url.split('/').pop();
      if (isUndefined(packageId) || isNotValidString(packageId)) {
        errHandle(res, 400, 'failed', 'ID錯誤');
        return
      }
      const result = await AppDataSource.getRepository('CreditPackage').delete(packageId)
      if (result.affected === 0) {
        errHandle(res, 400, 'failed', 'ID錯誤');
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify(
        {
          'message': '刪除購買方案'
        }
      ))
      res.end();
    }
    catch (error) {
      errHandle(res, 500, 'error', '伺服器錯誤');
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "GET") { // 設定 教練資訊
    try {
      const skills = await AppDataSource.getRepository("Skill").find({
        select: ["id", "name"]
      })
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success",
        data: skills
      }))
      res.end()
    } catch (error) {
      errHandle(res, 500, 'error', '伺服器錯誤');
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        if (isUndefined(data.name) || isNotValidString(data.name)) {
          errHandle(res, 400, 'failed', '欄位未填寫正確');
          return
        }
        const skillRepo = await AppDataSource.getRepository("Skill")
        const existSkill = await skillRepo.find({
          where: {
            name: data.name
          }
        })
        if (existSkill.length > 0) {
          errHandle(res, 409, 'failed', '資料重複');
          return
        }
        const newSkill = await skillRepo.create({
          name: data.name
        })
        const result = await skillRepo.save(newSkill)
        res.writeHead(200, headers)
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end()
      } catch (error) {
        errHandle(res, 500, 'error', '伺服器錯誤');
      }
    })
  } else if (req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE") {
    try {
      const skillId = req.url.split("/").pop();
      if (isUndefined(skillId) || isNotValidString(skillId)) {
        errHandle(res, 400, 'failed', 'ID錯誤');
        return
      }

      const result = await AppDataSource.getRepository("Skill").delete(skillId);
      if (result.affected === 0) {
        errHandle(res, 400, 'failed', 'ID錯誤');
        return
      }
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success",
      }))
      res.end()
    } catch (error) {
      errHandle(res, 500, 'error', '伺服器錯誤');
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end();
  } else {
    errHandle(res, 404, 'failed', '無此網站路由');
  }
}

//  啟動伺服器
const server = http.createServer(requestListener)

async function startServer() {
  try {
    await AppDataSource.initialize(); // 初始化資料庫
    console.log("資料庫連接成功");
    server.listen(process.env.PORT || 8080); // 設定伺服器端口
    console.log(`伺服器啟動成功, port: ${process.env.PORT}`);
  } catch (error) {
    console.error("資料庫連接失敗:", error);
  }
}

module.exports = startServer();
