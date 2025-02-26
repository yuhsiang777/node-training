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
      errHandle(res, 500, '伺服器錯誤');
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    try {
      res.writeHead(201, headers)
      res.write(JSON.stringify(
        {
          'message': '新增購買方案'
        }
      ))
      res.end();
    } catch (error) {
      errHandle(res, 500, '伺服器錯誤');
    }

  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    // 刪除購買方案邏輯
    // 根據 creditPackageId 來刪除指定方案
    res.writeHead(200, headers)
    res.write(JSON.stringify(
      {
        'message': '刪除購買方案'
      }
    ))
    res.end();
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end();
  } else {
    errHandle(res, 404, '無此網站路由');
  }
}

//  啟動伺服器
const server = http.createServer(requestListener)

async function startServer() {
  try {
    await AppDataSource.initialize(); // 初始化資料庫
    console.log("資料庫連接成功");
    server.listen(process.env.PORT || 3005); // 設定伺服器端口
    console.log(`伺服器啟動成功, port: ${process.env.PORT}`);
  } catch (error) {
    console.error("資料庫連接失敗:", error);
  }
}

module.exports = startServer();
