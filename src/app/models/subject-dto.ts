export interface SubjectCreateDto {
  subjectName: string;
  description: string;
  courseIds: number[];
}

export interface SubjectDto {
  subjectId: number;
  subjectName: string;
  description: string;
  courseIds: number[];
}
