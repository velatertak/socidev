import { AuthService } from "../services/auth.service.js";
import {
  validateRegistration,
  validateLogin,
} from "../validators/auth.validator.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

const authService = new AuthService();

export class AuthController {
  register = catchAsync(async (req, res) => {
    const validationErrors = validateRegistration(req.body);
    if (validationErrors) {
      throw new ApiError(400, "Validation Error", validationErrors);
    }

    const { user, token } = await authService.register(req.body);
    res.status(201).json({ user, token });
  });

  login = catchAsync(async (req, res) => {
    const validationErrors = validateLogin(req.body);
    if (validationErrors) {
      throw new ApiError(400, "Validation Error", validationErrors);
    }

    const { user, token } = await authService.login(req.body);
    res.json({ user, token });
  });
}
