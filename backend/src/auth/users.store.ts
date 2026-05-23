import { ConflictException, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
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
    const id = `user-${uuidv4().slice(0, 8)}`;
    const user: AuthUser = {
      id,
      email: input.email.trim().toLowerCase(),
      passwordHash: input.password,
      role: input.role,
      name: input.name.trim(),
      ...(input.role === "parent"
        ? { parentId: `parent-${uuidv4().slice(0, 8)}` }
        : {}),
    };
    this.users.push(user);
    return user;
  }
}
