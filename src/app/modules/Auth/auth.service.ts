import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import { TChangePassword, TLogin, TResetPassword } from './auth.interface';
import { AppError } from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import prisma from '../../utils/prisma';
import { User, UserRole, UserStatus } from '../../../../prisma/generated/client/client';

const register = async (payload: User) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User email already exist');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const createUser = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: UserRole.user,
      status: UserStatus.in_progress,
    },
  });

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = createUser;
  return userWithoutPassword;
};

const login = async (payload: TLogin) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'User not found, Insert correct Id',
    );
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
  }

  if (user.status === UserStatus.blocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
  }

  const isPasswordMatched = await bcrypt.compare(
    payload?.password,
    user?.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Incorrect password!');
  }

  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt_refresh_secret as string,
    {
      expiresIn: config.jwt_refresh_expires_in as jwt.SignOptions['expiresIn'],
    },
  );

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;

  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword,
    // needPasswordChange: user?.needPasswordChange,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: TChangePassword,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: userData.email,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect old password!');
  }

  const hashNewPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const changedPassword = await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashNewPassword,
      needPasswordChange: false,
    },
  });

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = changedPassword;
  return userWithoutPassword;
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.status === UserStatus.blocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'The user is blocked');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'The user is deleted');
  }

  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10m',
  });

  const resetPasswordUiLink = `${config.reset_pass_ui_link}?email=${email}&token=${accessToken}`;

  await sendEmail(user?.email, resetPasswordUiLink, 'Reset your password!');
};

const resetPassword = async (payload: TResetPassword, token: string) => {
  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  if (decoded.email !== payload.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'you are not authorized! Invalid ID',
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: decoded.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.status === UserStatus.blocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'The user is blocked!');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'The user is deleted!');
  }

  if (payload.newPassword !== payload.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password and confirm password do not match!',
    );
  }

  const hashNewPassword = await bcrypt.hash(
    payload.confirmPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
    where: { email: user.email },
    data: {
      password: hashNewPassword,
      needPasswordChange: false,
    },
  });
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { email } = decoded;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user?.status === UserStatus.blocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'The user is blocked');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'The user is deleted');
  }

  const jwtPayload = {
    email: user?.email,
    role: user?.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in as jwt.SignOptions['expiresIn'],
  });

  return { accessToken };
};

export const authServices = {
  register,
  login,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
};
