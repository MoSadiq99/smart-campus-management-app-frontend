import { UserDto } from './UserDto';

export interface AdminDto extends UserDto {
  adminTitle: string;
}
