import { UserDto } from './UserDto';

export interface LecturerDto extends UserDto {
  department: string;
  courseIds: number[];
}
