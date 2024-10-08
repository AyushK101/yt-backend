
//todo higher order function : function that takes a function and return a new function




/**
 *todo app.get('/route', asyncHandler(myAsyncRouteHandler));
 *todo here express will itself call callback with (req, res, next) when route hit
 *todo so asyncHandler needs to return a function function not execute.
 * 
 */

export const asyncHandler = (requestHandler) =>{
    return (req, res, next) => Promise.resolve(requestHandler(req, res, next)).catch(err => next(err))
}

//! asyncHandler will only handle unhandled errors that are not caught by the internal try-catch
//! asyncHandler's .catch() will pass the error to next(err).










// const asyncHandler = (fn) => async ( req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500 ).json({
//             success: false,
//             message: error.message
//         })
//     }
// } 