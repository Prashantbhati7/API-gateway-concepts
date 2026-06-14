class ApiError extends Error {
    statusCode;
    success;
    constructor(statusCode=500, message="Internal Server Error", success=false) {
        super(message);
        this.statusCode = statusCode;
        this.success = success;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;