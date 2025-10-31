// src/modules/auth/types/auth-user.type.ts
export type UserRole = 'GUEST' | 'MEMBER' | 'ADMIN';

export interface AuthUser {
  sub: string;          // giữ tương thích cho một số guard/decorators
  userId: string;       // id người dùng
  email: string;
  role: UserRole;
  memberId?: string;    // id bản ghi Member (nếu có)
}
