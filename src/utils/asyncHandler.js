
//todo higher order function : function that takes a function and return a new function




/**
 *todo app.get('/route', asyncHandler(myAsyncRouteHandler));
 *todo here express will itself call callback with (req, res, next) when route hit
 *todo so asyncHandler needs to return a function function not execute.
 * 
 */

const asyncHandler = (requestHandler) =>{
    (req, res, next) => Promise.resolve(requestHandler(req, res, next)).catch(err => next(err))
}



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