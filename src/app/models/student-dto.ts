import { UserDto } from './dto/UserDto';

export interface StudentDto extends UserDto {
  studentIdNumber: string;
  major: string;
  enrolledCourseIds: number[];
}
