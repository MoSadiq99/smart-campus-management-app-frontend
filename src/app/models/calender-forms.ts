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
  { name: 'Description', id: 'description', type: 'text' },
  { name: 'Start Time', id: 'start', type: 'datetime', required: true },
  { name: 'End Time', id: 'end', type: 'datetime', required: true },
  { name: 'Location', id: 'location', type: 'text', required: true },
  { name: 'Capacity', id: 'capacity', type: 'number' }
];
