export interface ResourceDto {
  resourceId: number;
  resourceName: string;
  capacity: number;
  location: string;
  status: string;
}

export interface ResourceCreateDto {
  resourceName: string;
  type: string;
  capacity: number;
  status: string;
  location: string;
}
