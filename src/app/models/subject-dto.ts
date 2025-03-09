export interface SubjectCreateDto {
  subjectName: string;
  description: string;
  courseId: number[];
}

export interface SubjectDto {
  subjectId: number;
  subjectName: string;
  description: string;
  courseId: number[];
}
