/**
 * Injibara Campus Lost & Found
 *
 * JWT Strategy
 *
 * Express + Prisma JWT authentication strategy.
 */

import jwt from "jsonwebtoken";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { configuration } from "../../config/configuration.js";

import type {
  AuthenticatedUser,
  AuthTokenPayload,
  UserRole,
} from "../../common/decorators/current-user.decorator.js";

import type { UserResolver } from "../../common/guards/jwt-auth.guard.js";

// ======================================================
// 1. JWT USER PAYLOAD
// ======================================================

export interface JwtUserPayload {
  sub: string;

  email: string;

  role: UserRole;

  tokenType: "access";
}

// ======================================================
// 2. SAFE USER SELECTION
// ======================================================

const safeUserSelection = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  studentId: true,
  department: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ======================================================
// 3. ACCESS TOKEN GENERATION
// ======================================================

export function generateAccessToken(user: {
  id: string;
  email: string;
  role: UserRole;
}): string {
  const payload: Omit<JwtUserPayload, "sub"> = {
    email: user.email,

    role: user.role,

    tokenType: "access",
  };

  return jwt.sign(payload, configuration.jwt.accessSecret, {
    subject: user.id,

    algorithm: "HS256",

    expiresIn: 15 * 60,

    issuer: "injibara-lost-found",

    audience: "injibara-lost-found-mobile",
  });
}

// ======================================================
// 4. VERIFY ACCESS TOKEN
// ======================================================

export function verifyAccessTokenStrategy(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, configuration.jwt.accessSecret, {
    algorithms: ["HS256"],

    issuer: "injibara-lost-found",

    audience: "injibara-lost-found-mobile",

    clockTolerance: 5,
  });

  if (
    typeof decoded === "string" ||
    !decoded.sub ||
    typeof decoded.email !== "string" ||
    typeof decoded.role !== "string" ||
    decoded.tokenType !== "access"
  ) {
    throw new Error("Invalid access token payload.");
  }

  const validRoles: UserRole[] = ["STUDENT", "STAFF", "SECURITY", "ADMIN"];

  if (!validRoles.includes(decoded.role as UserRole)) {
    throw new Error("Invalid role in access token.");
  }

  return {
    sub: decoded.sub,

    email: decoded.email,

    role: decoded.role as UserRole,

    ...(typeof decoded.iat === "number" ? { iat: decoded.iat } : {}),

    ...(typeof decoded.exp === "number" ? { exp: decoded.exp } : {}),

    ...(typeof decoded.jti === "string" ? { jti: decoded.jti } : {}),
  };
}

// ======================================================
// 5. PRISMA USER RESOLVER
// ======================================================

export function createPrismaUserResolver(prisma: PrismaClient): UserResolver {
  return {
    async findActiveUserById(
      userId: string,
    ): Promise<AuthenticatedUser | null> {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: safeUserSelection,
      });

      if (!user) {
        return null;
      }

      if (!user.isActive) {
        return null;
      }

      return {
        id: user.id,

        fullName: user.fullName,

        email: user.email,

        role: user.role as UserRole,

        studentId: user.studentId,

        department: user.department,

        phone: user.phone,

        avatarUrl: user.avatarUrl,

        isActive: user.isActive,
      };
    },
  };
}

// ======================================================
// 6. FIND USER BY EMAIL
// ======================================================

export async function findUserForAuthentication(
  prisma: PrismaClient,
  email: string,
) {
  return prisma.user.findUnique({
    where: {
      email: email.toLowerCase().trim(),
    },

    select: {
      id: true,

      fullName: true,

      email: true,

      passwordHash: true,

      role: true,

      isActive: true,

      emailVerifiedAt: true,
    },
  });
}

// ======================================================
// 7. FIND ACTIVE USER BY ID
// ======================================================

export async function findActiveUser(prisma: PrismaClient, userId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,

      isActive: true,
    },

    select: safeUserSelection,
  });
}

// ======================================================
// 8. CHECK TOKEN OWNERSHIP
// ======================================================

export function tokenBelongsToUser(
  payload: AuthTokenPayload,
  user: {
    id: string;
    email: string;
    role: UserRole;
  },
): boolean {
  return (
    payload.sub === user.id &&
    payload.email === user.email &&
    payload.role === user.role
  );
}

// ======================================================
// 9. DEFAULT EXPORT
// ======================================================

export default createPrismaUserResolver;
