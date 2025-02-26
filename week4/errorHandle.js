const headers = require("./headers");

function errorHandle(res, statusCode, message) {
  res.writeHead(statusCode, headers);
  res.write(JSON.stringify(
    {
      'status': 'error',
      'messahe': message
    }
  ));
  res.end();
}

module.exports = { errorHandle }