export enum RequestMethod {
    Get = "GET",
    Post = "POST",
    Patch = "PATCH",
}

export enum StatusCode {
    Created = 201,
    Ok = 200,
    NotFound = 404,
    InternalError = 500,
    MethodNotAllowed = 405,
    BadRequest = 400,
}