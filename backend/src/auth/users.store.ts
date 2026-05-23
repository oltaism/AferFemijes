import { ConflictException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { AuthUser } from "../domain/auth.types";
import { Role } from "../domain/types";
import { AUTH_USERS } from "./users.seed";

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  role: Role;
};

@Injectable()
export class UsersStore {
  private users: AuthUser[] = structuredClone(AUTH_USERS);

  private shortId() {
    return randomUUID().slice(0, 8);
  }

  findByEmail(email: string) {
    return this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  }

  listDemo() {
    return this.users;
  }

  register(input: RegisterInput): AuthUser {
    if (this.findByEmail(input.email)) {
      throw new ConflictException("Ky email është i regjistruar tashmë.");
    }
    const id = `user-${this.shortId()}`;
    const user: AuthUser = {
      id,
      email: input.email.trim().toLowerCase(),
      passwordHash: input.password,
      role: input.role,
      name: input.name.trim(),
      ...(input.role === "parent"
        ? { parentId: `parent-${this.shortId()}` }
        : {}),
    };
    this.users.push(user);
    return user;
  }
}
