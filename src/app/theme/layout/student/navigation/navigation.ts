export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'dashboard-group',
    title: 'Dashboard',
    type: 'group',
    icon: 'feather icon-home',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/student/dashboard',
        classes: 'nav-item',
        icon: 'feather icon-home'
      }
    ]
  },
  {
    id: 'scheduling',
    title: 'Scheduling',
    type: 'group',
    icon: 'feather icon-clock',
    children: [
      {
        id: 'schedule-calendar',
        title: 'Schedule Calendar',
        type: 'item',
        url: '/student/schedule-calendar',
        classes: 'nav-item',
        icon: 'feather icon-calendar'
      }
    ]
  },
  {
    id: 'events',
    title: 'Events',
    type: 'group',
    icon: 'feather icon-star',
    children: [
      {
        id: 'create-events',
        title: 'Create Events',
        type: 'item',
        url: '/student/event-calendar',
        classes: 'nav-item',
        icon: 'feather icon-plus-square'
      },
    ]
  },
  {
    id: 'resources',
    title: 'Resources',
    type: 'group',
    icon: 'feather icon-briefcase',
    children: [
      {
        id: 'resource-reservations',
        title: 'Resource Reservations',
        type: 'item',
        url: '/student/resource-calendar',
        classes: 'nav-item',
        icon: 'feather icon-bookmark'
      }
    ]
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    type: 'group',
    icon: 'feather icon-message-square',
    children: [
      {
        id: 'chat',
        title: 'Chat',
        type: 'item',
        url: '/student/chat',
        classes: 'nav-item',
        icon: 'feather icon-message-circle'
      }
    ]
  },
];
