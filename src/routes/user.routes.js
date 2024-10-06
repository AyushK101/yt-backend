import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshToken } from '../controllers/user.controller.js';
import { upload  } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const userRouter = Router()

userRouter.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1
    },
    {
      name: 'coverImage',
      maxCount: 1
    }
  ]),
  registerUser)

userRouter.route('/login').post(
  loginUser
)

//secured routes
userRouter.route('/logout').post(
  verifyJwt,
  logoutUser
)
userRouter.route('/refresh-token').post(
  // verifyJwt, //! not in course
  refreshToken
)

export default userRouter 
