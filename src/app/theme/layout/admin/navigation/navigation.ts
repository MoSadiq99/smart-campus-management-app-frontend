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
        url: '/admin/dashboard',
        classes: 'nav-item',
        icon: 'feather icon-home'
      }
    ]
  },
  {
    id: 'enrollment-management',
    title: 'Enrollment Management',
    type: 'group',
    icon: 'feather icon-users',
    children: [
      {
        id: 'manage-enrollments',
        title: 'Manage Enrollments',
        type: 'item',
        url: '/admin/enrollment',
        classes: 'nav-item',
        icon: 'feather icon-user-plus'
      },
      {
        id: 'manage-courses',
        title: 'Manage Courses',
        type: 'item',
        url: '/admin/course',
        classes: 'nav-item',
        icon: 'feather icon-book'
      },
      {
        id: 'manage-subjects',
        title: 'Manage Subjects',
        type: 'item',
        url: '/admin/subject',
        classes: 'nav-item',
        icon: 'feather icon-book-open'
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
        url: '/admin/schedule-calendar',
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
        url: '/admin/event-calendar',
        classes: 'nav-item',
        icon: 'feather icon-plus-square'
      },
      {
        id: 'events-list',
        title: 'Campus Events',
        type: 'item',
        url: '/admin/events',
        classes: 'nav-item',
        icon: 'feather icon-edit'
      }
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
        url: '/admin/resource-calendar',
        classes: 'nav-item',
        icon: 'feather icon-bookmark'
      },
      {
        id: 'manage-resources',
        title: 'Manage Resources',
        type: 'item',
        url: '/admin/resource',
        classes: 'nav-item',
        icon: 'feather icon-settings'
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
        url: '/admin/chat',
        classes: 'nav-item',
        icon: 'feather icon-message-circle'
      }
    ]
  },
  // {
  //   id: 'authentication',
  //   title: 'Authentication',
  //   type: 'group',
  //   icon: 'feather icon-lock',
  //   children: [
  //     {
  //       id: 'user-registration',
  //       title: 'User Registration',
  //       type: 'item',
  //       url: '/auth/signup',
  //       target: true,
  //       breadcrumbs: false,
  //       classes: 'nav-item',
  //       icon: 'feather icon-user-plus'
  //     },
  //     {
  //       id: 'user-login',
  //       title: 'User Login',
  //       type: 'item',
  //       url: '/auth/signin',
  //       target: true,
  //       breadcrumbs: false,
  //       classes: 'nav-item',
  //       icon: 'feather icon-log-in'
  //     }
  //   ]
  // }
];
