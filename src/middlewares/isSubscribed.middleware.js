import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const isSubscribed = asyncHandler(async (req, _, next) => {
  const user = req.user;

  if (!user.isSubscribed || !user.expiresOn) {
    throw new ApiError(403, "User is not subscribed");
  }

  if (new Date(user.expiresOn) < new Date()) {
    const dbUser = await User.findById(user._id);
    if (dbUser) {
      dbUser.isSubscribed = false;
      await dbUser.save({ validateBeforeSave: false });
    }

    req.user.isSubscribed = false;

    throw new ApiError(403, "User subscription has expired");
  }

  next();
});