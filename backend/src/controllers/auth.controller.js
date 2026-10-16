// src/controllers/auth.controller.js

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await authService.login(email, password, role, req);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.logout(refreshToken, req.user?._id, req);
  res.status(200).json(new ApiResponse(200, result, 'Logout successful'));
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  res.status(200).json(new ApiResponse(200, result, 'Token refreshed'));
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched'));
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(
    req.user._id,
    oldPassword,
    newPassword,
    req
  );
  res.status(200).json(new ApiResponse(200, result, result.message));
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const result = await authService.requestPasswordReset(email, role, req);
  res.status(200).json(new ApiResponse(200, result, result.message));
});