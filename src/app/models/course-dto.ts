
export interface CourseDto {
    courseId: number;
    courseName: string;
    courseCode: string;
    description: string;
    startDate: Date;
    endDate: Date;
    credits: number
    cordinatorId: number
    enrolledStudentIds: number[]
    subjectIds: number[]
  }

  export interface CourseCreateDto {
    courseName: string;
    courseCode: string;
    description: string;
    startDate: Date;
    endDate: Date;
    credits: number
    cordinatorId: number
  }
  