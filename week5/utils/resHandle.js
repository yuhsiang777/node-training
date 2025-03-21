// 統一的錯誤回應函數
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({
    status: 'failed',
    message: message
  });
};

// 統一的成功回應函數
const sendSuccessResponse = (res, data) => {
  res.status(200).json({
    status: 'success',
    data: data
  });
};

module.exports = {
  sendErrorResponse,
  sendSuccessResponse
};