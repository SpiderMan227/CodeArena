import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/db';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../types';
import { sendOtpEmail } from '../utils/email';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-12345';

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

const createAndSendOtp = async (email: string, purpose: 'verification' | 'reset' = 'verification'): Promise<void> => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.emailOtp.upsert({
    where: { email },
    update: { otpHash, attempts: 0, expiresAt, createdAt: new Date() },
    create: { email, otpHash, attempts: 0, expiresAt },
  });

  await sendOtpEmail(email, otp, purpose);
};

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

const generateTokens = (userId: string, role: 'USER' | 'ADMIN') => {
  const accessToken = jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const sendRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = verifyEmailSchema.parse(req.body);

    const otpRecord = await prisma.emailOtp.findUnique({
      where: { email: data.email },
    });

    if (!otpRecord) {
      throw new BadRequestError('No verification code found. Please request a new one.');
    }

    if (otpRecord.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { email: data.email } });
      throw new BadRequestError('Verification code has expired. Please request a new one.');
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { email: data.email } });
      throw new BadRequestError('Maximum verification attempts exceeded. Please request a new code.');
    }

    // Increment attempts
    await prisma.emailOtp.update({
      where: { email: data.email },
      data: { attempts: { increment: 1 } },
    });

    const isMatch = await bcrypt.compare(data.otp, otpRecord.otpHash);
    if (!isMatch) {
      const remaining = OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1);
      throw new BadRequestError(`Invalid verification code. ${remaining} attempt(s) remaining.`);
    }

    // OTP is valid — verify user and clean up
    await prisma.$transaction([
      prisma.user.update({
        where: { email: data.email },
        data: { isVerified: true },
      }),
      prisma.emailOtp.delete({ where: { email: data.email } }),
    ]);

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resendOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      // Don't reveal whether email exists — return generic success
      return res.status(200).json({ message: 'If an account exists, a new verification code has been sent.' });
    }

    if (user.isVerified) {
      throw new BadRequestError('This email is already verified.');
    }

    // Rate limit: check cooldown
    const existingOtp = await prisma.emailOtp.findUnique({ where: { email: data.email } });
    if (existingOtp) {
      const secondsSinceCreated = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (secondsSinceCreated < RESEND_COOLDOWN_SECONDS) {
        const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
        throw new BadRequestError(`Please wait ${wait} seconds before requesting a new code.`);
      }
    }

    await createAndSendOtp(data.email);

    return res.status(200).json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new BadRequestError('Username or email is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash,
        },
      });

      await tx.userStatistics.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });



    // Generate and send OTP for email verification
    await createAndSendOtp(data.email);

    return res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      email: data.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    // Look up by email or username
    const isEmail = data.identifier.includes('@');
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: data.identifier }
        : { username: data.identifier },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    sendRefreshTokenCookie(res, refreshToken);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Always return success to prevent email enumeration
    if (!user || !user.isVerified) {
      return res.status(200).json({ message: 'If an account exists with that email, a reset code has been sent.' });
    }

    // Rate limit: check cooldown
    const existingOtp = await prisma.emailOtp.findUnique({ where: { email: data.email } });
    if (existingOtp) {
      const secondsSinceCreated = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (secondsSinceCreated < RESEND_COOLDOWN_SECONDS) {
        const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceCreated);
        throw new BadRequestError(`Please wait ${wait} seconds before requesting a new code.`);
      }
    }

    await createAndSendOtp(data.email, 'reset');

    return res.status(200).json({ message: 'If an account exists with that email, a reset code has been sent.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resetPasswordSchema.parse(req.body);

    const otpRecord = await prisma.emailOtp.findUnique({ where: { email: data.email } });

    if (!otpRecord) {
      throw new BadRequestError('No reset code found. Please request a new one.');
    }

    if (otpRecord.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { email: data.email } });
      throw new BadRequestError('Reset code has expired. Please request a new one.');
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { email: data.email } });
      throw new BadRequestError('Maximum attempts exceeded. Please request a new code.');
    }

    await prisma.emailOtp.update({
      where: { email: data.email },
      data: { attempts: { increment: 1 } },
    });

    const isMatch = await bcrypt.compare(data.otp, otpRecord.otpHash);
    if (!isMatch) {
      const remaining = OTP_MAX_ATTEMPTS - (otpRecord.attempts + 1);
      throw new BadRequestError(`Invalid reset code. ${remaining} attempt(s) remaining.`);
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: data.email },
        data: { passwordHash },
      }),
      prisma.emailOtp.delete({ where: { email: data.email } }),
    ]);

    return res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const parts = c.trim().split('=');
        return [parts[0], parts.slice(1).join('=')];
      })
    );
    const refreshToken = cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is missing');
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      throw new UnauthorizedError('Refresh token is expired or invalid');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = generateTokens(user.id, user.role);
    sendRefreshTokenCookie(res, tokens.refreshToken);

    return res.json({
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return res.json({ message: 'Logged out successfully' });
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  avatarUrl: z.string().url('Invalid profile picture URL').or(z.literal('')).optional().nullable(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long').optional().or(z.literal('')),
  oldPassword: z.string().min(1, 'Previous password is required to save changes'),
});

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const data = updateProfileSchema.parse(req.body);
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(data.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestError('Incorrect previous password');
    }

    const updateData: any = {};

    if (data.username && data.username !== user.username) {
      // Verify unique username
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUser) {
        throw new BadRequestError('Username is already taken');
      }
      updateData.username = data.username;
    }

    if (data.newPassword) {
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl === '' ? null : data.avatarUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({
        message: 'No changes requested.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    return res.json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new BadRequestError(error.errors[0].message));
    }
    next(error);
  }
};
