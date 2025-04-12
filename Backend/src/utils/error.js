const errorHandler = (err, req, res,next) => {
    let { statusCode, message} = err;
    res.locals.errorMessage = err.message;
    let response = {
        code: statusCode,
        message
    };
    if(err.message === "Not found") {
        const {stack, ... newResponse} = response;
        response = newResponse;
    }
    res.status(statusCode).send(response);
};
export default errorHandler;