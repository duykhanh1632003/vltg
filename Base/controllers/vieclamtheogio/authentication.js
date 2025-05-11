const functions = require("../../services/functions");
const Users = require("../../models/ViecLamTheoGio/Users");
const dotenv = require("dotenv");
const md5 = require("md5");
dotenv.config();
const folder_img = "user_ntd";

exports.sendOTP = async (req, res, next) => {
  try {
    let email = req?.body?.email;
    if (!email)
      return functions.setError(res, "Email không được để trống", 405);
    let rundom = Math.floor(Math.random() * 1000000);
    let user = await Users.findOne({ email: email });
    if (user) {
      let user = await Users.findOne({ email: email });
      let time_send = user.time_send_otp;
      let currentTime = new Date().getTime();
      let timeDifference = currentTime - time_send;

      // Check if the time difference is greater than the allowed interval (e.g., 1 minute = 60000 milliseconds)
      if (time_send == null || timeDifference > 60000) {
        // Update the time_send_otp to the current time
        user.time_send_otp = currentTime;
        user.otp = rundom;
        await user.save();

        await functions.sendEmailOTP(email, rundom);
        return functions.success(res, "OTP sent successfully", {
          otp: rundom,
          time_send: timeDifference,
        });
      }
      return functions.setError(res, "Thời gian gửi opt cách nhau 1 phút", 401);
    }
    if (user) return functions.success(res, "User not exist", 402);
  } catch (error) {
    console.log("error", error);
    return functions.setError(res, error.message);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    let { otp, email } = req.body;
    if (email && otp) {
      let user = await Users.findOne({ email: email });
      let otpCorrect = user.otp;
      let time_send = user.time_send_otp;
      let currentTime = new Date().getTime();
      let timeDifference = currentTime - time_send;
      if (time_send && timeDifference > 60000) {
        return functions.setError(res, "OTP expired", 401);
      }
      if (otp == otpCorrect) {
        // Update the time_send_otp to the current time
        return functions.success(res, "Verify OTP successfully");
      }
      return functions.setError(res, "Invalid OTP", 402);
    }
    return functions.setError(res, "Missing input value", 403);
  } catch (error) {
    console.log("error", error);
    return functions.setError(res, error.message);
  }
};
