import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
// import { redis } from "../app.js";
import { getEmailTemplate } from "../components/EmailTemplate.js";
import { OAuth2Client } from "google-auth-library";

// const resend = new Resend(process.env.RESEND_API_KEY);
const client = new OAuth2Client(
  "70557043877-c39hshh6qu24p08bj0d9ptrgkau13t8s.apps.googleusercontent.com"
);

const generateAccessAndRefreshTokens = asyncHandler(async (userId) => {
  const user = await User.findById(userId);

  const accessToken = await user.generateAccessToken();

  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
});

const otpKey = (email) => {
  return `otp:${email}`;
};

const getUser = asyncHandler(async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  if (!accessToken) {
    throw new ApiError(402, "Access token not provided");
  }
  const decoded = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded) {
    throw new ApiError(402, "Invalid access token");
  }
  const user = await User.findById(decoded._id).select(
    "-refreshToken -password",
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  console.log("login req recived")
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(402, "Invalid password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User logged in successfully",
      ),
    );
});

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(otpKey(email), otp, "EX", 60 * 5);

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your Verification Code",
      html: getEmailTemplate(otp),
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new ApiError(
        400,
        error.message || "Failed to send email via Resend",
      );
    }

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Catch block error:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error.message || "Failed to send OTP");
  }

  res.status(200).json(new ApiResponse(200, null, "OTP sent successfully"));
});

const submitOtpAndRegisterUser = asyncHandler(async (req, res) => {
  const { name, email, password, otp } = req.body;
  if (!name || !email || !password || !otp) {
    throw new ApiError(400, "All fields are required");
  }

  const storedOtp = await redis.get(otpKey(email));
  if (!storedOtp) {
    throw new ApiError(400, "OTP not found");
  }
  if (storedOtp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  const user = await User.create({ fullName: name, email, password });
  if (!user) {
    throw new ApiError(500, "Failed to register user");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  await redis.del(otpKey(email));
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user, accessToken, refreshToken },
        "User registered successfully",
      ),
    );
});

const submitNewPasswordWithOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }
  const storedOtp = await redis.get(otpKey(email));
  if (!storedOtp) {
    throw new ApiError(400, "OTP not found");
  }
  if (storedOtp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.password = newPassword;
  await user.save();
  await redis.del(otpKey(email));
  res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully"));
});

const handleGoogleSignIn = asyncHandler(async (req, res) => {
  console.log("got here")
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ success: false, message: "ID Token is required" });
    }


    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        password: process.env.PASSWORD,
        email,
        fullname: name,
        isVerified: true,
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken },
          "User logged in successfully",
        ),
      );
  } catch (error) {
    console.error("Google token verification error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid Google ID Token" });
  }
});

const checkRegistration = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const user = await User.findOne({ email });
  if (user) {
    throw new ApiError(404, "User already registered with this email");
  }
  res.status(200).json(new ApiResponse(200, null, "User not found"));
});

export {
  getUser,
  loginUser,
  submitOtpAndRegisterUser,
  sendOtp,
  checkRegistration,
  submitNewPasswordWithOtp,
  handleGoogleSignIn
};
