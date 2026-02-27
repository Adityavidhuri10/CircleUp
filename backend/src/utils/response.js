const sendResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        status: `${statusCode}`.startsWith('2') ? 'success' : 'fail',
        message,
        data,
    });
};

module.exports = sendResponse;
