import { Router } from "express";
import {
  getUser,
  loginUser,
  submitOtpAndRegisterUser,
  sendOtp,
  checkRegistration,
  submitNewPasswordWithOtp,
  handleGoogleSignIn
 } from "../controllers/auth.controller.js";

const router = Router();

router.get("/getuser", getUser)
router.post("/login", loginUser)
router.post("/register", submitOtpAndRegisterUser)
router.post("/otp", sendOtp);
router.post("/savenewpassword", submitNewPasswordWithOtp)
router.post("/google", handleGoogleSignIn)
router.post("/checkemail", checkRegistration)

export default router;
