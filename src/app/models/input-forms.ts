export const EventCreateForm = [
  { name: 'Name', id: 'name', required: true },
  { name: 'OrganizerID', id: 'organizerId', type: 'number', required: true },
  { name: 'Description', id: 'description', type: 'text' },
  { name: 'Location', id: 'location', type: 'text', required: true },
  { name: 'Capacity', id: 'capacity', type: 'number' }
];

export const EventEditForm = [
  { name: 'Name', id: 'name', required: true },
  { name: 'OrganizerID', id: 'organizerId', type: 'number', required: true },
  { name: 'Description', id: 'description', type: 'text', required: false },
  { name: 'Start Time', id: 'start', type: 'datetime', required: true },
  { name: 'End Time', id: 'end', type: 'datetime', required: true },
  { name: 'Location', id: 'location', type: 'text', required: true },
  { name: 'Capacity', id: 'capacity', type: 'number' }
];

export const CourseCreateForm = [
  { name: 'Course Name', id: 'courseName', type: 'text', required: 'true' },
  { name: 'Course Code', id: 'courseCode', type: 'text', required: true },
  { name: 'Description', id: 'description', type: 'text', required: false },
  { name: 'Start Date', id: 'startDate', type: 'date', required: true },
  { name: 'End Date', id: 'endDate', type: 'date', required: true },
  { name: 'Credits', id: 'credits', type: 'number', required: true },
  { name: 'Cordinator ID', id: 'cordinatorId', type: 'number', required: true }
];