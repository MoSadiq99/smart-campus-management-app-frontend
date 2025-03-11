export interface ResourceCreateDto {
  resourceName: string; // Required
  type: string; // Required
  capacity?: number; // Optional
  availabilityStatus: string; // Required
  location?: string; // Optional
}
