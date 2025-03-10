export interface ResourceDto {
  resourceId: number;
  resourceName: string;
  type: string;
  capacity?: number;
  availabilityStatus: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'; // Matches ResourceStatus enum
  location?: string;
}
