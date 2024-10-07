import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getVideoById, getVideos, updateVideo, uploadVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/upload").post(
  verifyJwt,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
)
router.route("/:videoId").delete(verifyJwt, deleteVideo)
router.route("").get(verifyJwt,getVideos)
router.route("/:videoId").get(verifyJwt,getVideoById)
router.route("/:videoId").put(verifyJwt,updateVideo)


export default router;
