class ApiResponse{
    constructor(
        messageCode,
        data,
        message='success'
    ) {
        this.statusCode=message
        this.data=data
        this.message=message
        this.success= statusCode < 400
    }
}

export { ApiResponse }