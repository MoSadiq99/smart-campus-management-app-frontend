import { UserDto } from "./dto/UserDto";

export interface LoginResponse {
  token?: string;
  user: UserDto;
}
