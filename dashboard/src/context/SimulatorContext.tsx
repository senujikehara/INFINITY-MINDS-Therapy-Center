import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces based on MySQL design
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface Role {
  id: number;
  name: 'super_admin' | 'admin' | 'principal' | 'trainer' | 'parent';
}

export interface User {
  id: number;
  branch_id: number;
  role_id: number;
  role: 'super_admin' | 'admin' | 'principal' | 'trainer' | 'parent';
  name: string;
  email: string;
  phone: string;
  profile_photo_path?: string;
  status: 'active' | 'suspended';
  username?: string;
}

export interface Child {
  id: number;
  branch_id: number;
  therapy_type_id: number;
  full_name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  photo_path?: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  consent_pics_parents: boolean;
  consent_pics_social_media: boolean;
  consent_celebrations: boolean;
  consent_food: boolean;

  // Family & Support Details
  father_name: string;
  father_phone: string;
  father_occupation: string;
  mother_name: string;
  mother_phone: string;
  mother_occupation: string;
  siblings_details: string;
  primary_caregiver: string;
  
  // Background Information
  formal_diagnosis: boolean;
  formal_diagnosis_details: string;
  other_medical_conditions: boolean;
  other_medical_conditions_details: string;
  food_allergies: boolean;
  food_allergies_details: string;
  
  // Past schools
  past_schools: string;
  
  // Interests & Challenges
  interests: string[];
  other_interests: string;
  challenges: string[];
  challenges_other: string;
  challenges_triggers: string;
  challenges_comments: string;
  
  // Self Help Skills
  is_toilet_trained: boolean;
  can_feed_self: boolean;
  can_dress_self: boolean;
  can_request_things: boolean;
  can_understand_instructions: boolean;
  
  // Program Details
  session_type: string;
  sessions_per_week: number;
  focus_areas: string[];
  focus_areas_other: string;
}

export interface ChildSensitiveData {
  child_id: number;
  ic_number: string;      // Encrypted in DB, shown decrypted for Admin/Super Admin
  guardian_ic: string;    // Encrypted in DB, shown decrypted for Admin/Super Admin
  home_address: string;
  application_form_path?: string;
  id_document_paths?: string[];
}

export interface ChildHealthInfo {
  child_id: number;
  allergies?: string;
  medical_conditions?: string;
  special_needs?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes?: string;
}

export interface ParentChildLink {
  parent_user_id: number;
  child_id: number;
  relationship: string;
}

export interface TherapyType {
  id: number;
  branch_id: number;
  name: string;
  description: string;
  color_tag: string; // Hex color tag
}

export interface Session {
  id: number;
  branch_id: number;
  child_id: number;
  trainer_id: number;
  therapy_type_id: number;
  session_date: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule?: 'WEEKLY' | 'DAILY' | 'NONE';
  parent_session_id?: number; // replacement link
  status: 'scheduled' | 'completed' | 'cancelled' | 'replaced';
  created_by?: number;
}

export interface Attendance {
  id: number;
  session_id: number;
  check_in_time?: string;
  check_out_time?: string;
  marked_by_trainer_id: number;
  marked_via: string;
  notes?: string;
}

export interface ProgressReport {
  id: number;
  child_id: number;
  trainer_id: number;
  session_id?: number;
  report_date: string;
  notes: string;
  media_links: string[];
  visible_to_parent: boolean;
  principal_comment?: string;
  principal_id?: number;
}

export interface BehaviorReport {
  id: number;
  child_id: number;
  trainer_id: number;
  report_date: string;
  nature_of_incident: string;
  triggers_causes: string;
  actions_taken: string;
  follow_up_observations: string;
  status: 'pending_review' | 'authorized' | 'rejected';
  principal_id?: number;
  principal_comment?: string;
  authorized_at?: string;
  visibility: 'private' | 'public';
  media_links?: string[];
  reviewed_by_ids?: number[];
}

export interface AcademicCalendarEvent {
  id: number;
  branch_id: number;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  event_type: string;
  created_by_id?: number;
}

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'done';
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'reminder' | 'report_published' | 'cancellation';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  table_name: string;
  record_id?: number;
  ip_address: string;
  created_at: string;
}

export interface DirectMessage {
  id: number;
  sender_id: number;
  recipient_id?: number;
  group_id?: number;
  message_text: string;
  created_at: string;
  is_read_by_ids: number[];
}

export interface MessageGroup {
  id: number;
  name: string;
  created_by_id: number;
  participant_ids: number[];
  hide_from_non_participants: boolean;
}

const initialBranches: Branch[] = [
  { id: 1, name: 'Petaling Jaya Branch', address: 'Petaling Jaya, Selangor, Malaysia', phone: '+60 3 7954 5678' }
];

const initialUsers: User[] = [
  { id: 1, branch_id: 1, role_id: 1, role: 'super_admin', name: 'Super Admin', email: 'superadmin@infinityminds.lk', phone: '0771234567', status: 'active', username: 'superadmin' },
  { id: 2, branch_id: 1, role_id: 2, role: 'admin', name: 'Center Admin', email: 'admin@infinityminds.lk', phone: '0777654321', status: 'active', username: 'admin' },
  { id: 3, branch_id: 1, role_id: 3, role: 'principal', name: 'Lead Principal', email: 'principal@infinityminds.lk', phone: '0711122334', status: 'active', username: 'principal' },
  { id: 4, branch_id: 1, role_id: 4, role: 'trainer', name: 'Dinuka Fernando', email: 'dinuka@infinityminds.lk', phone: '0755566778', status: 'active', username: 'trainer' },
  { id: 5, branch_id: 1, role_id: 5, role: 'parent', name: 'Sunil Wijesinghe', email: 'parent@infinityminds.lk', phone: '0776789012', status: 'active', username: 'parent' },
];

const initialTherapyTypes: TherapyType[] = [
  { id: 1, branch_id: 1, name: 'Speech Therapy', description: 'Articulation, voice, and language development.', color_tag: '#8B5CF6' }, // purple
  { id: 2, branch_id: 1, name: 'Occupational Therapy', description: 'Fine motor skills, sensory processing, everyday activities.', color_tag: '#10B981' }, // green
  { id: 3, branch_id: 1, name: 'ABA Therapy', description: 'Applied Behavior Analysis for autism and behavior modulation.', color_tag: '#F59E0B' }, // amber
];

const initialChildren: Child[] = [
  { 
    id: 1, 
    branch_id: 1, 
    therapy_type_id: 1, 
    full_name: 'Ethan Wijesinghe', 
    dob: '2019-05-12', 
    gender: 'male', 
    enrollment_date: '2025-01-10', 
    status: 'active', 
    consent_pics_parents: true, 
    consent_pics_social_media: false, 
    consent_celebrations: true, 
    consent_food: true,
    father_name: 'Sunil Wijesinghe',
    father_phone: '0771234567',
    father_occupation: 'Engineer',
    mother_name: 'Malkanthi Wijesinghe',
    mother_phone: '0776789012',
    mother_occupation: 'Teacher',
    siblings_details: '1 Brother (Age 8)',
    primary_caregiver: 'Grandparents',
    formal_diagnosis: true,
    formal_diagnosis_details: 'Autism Spectrum Disorder (Level 1)',
    other_medical_conditions: false,
    other_medical_conditions_details: '',
    food_allergies: true,
    food_allergies_details: 'Peanuts',
    past_schools: 'Maharagama Preschool (Pre-K program)',
    interests: ['Sports', 'Art', 'Numbers'],
    other_interests: 'Loves blocks and trains',
    challenges: ['Hitting', 'Screaming'],
    challenges_other: '',
    challenges_triggers: 'Sudden loud noises, transitions without warnings',
    challenges_comments: 'Calms down with sensory deep pressure therapy',
    is_toilet_trained: true,
    can_feed_self: true,
    can_dress_self: false,
    can_request_things: true,
    can_understand_instructions: true,
    session_type: '1:1 Early Intervention Program',
    sessions_per_week: 3,
    focus_areas: ['Speech & Language', 'Social skills'],
    focus_areas_other: ''
  },
  { 
    id: 2, 
    branch_id: 1, 
    therapy_type_id: 2, 
    full_name: 'Sithum Fernando', 
    dob: '2020-08-22', 
    gender: 'male', 
    enrollment_date: '2025-03-15', 
    status: 'active', 
    consent_pics_parents: true, 
    consent_pics_social_media: true, 
    consent_celebrations: true, 
    consent_food: false,
    father_name: 'Rohan Fernando',
    father_phone: '0779876543',
    father_occupation: 'Accountant',
    mother_name: 'Nisha Fernando',
    mother_phone: '0773456789',
    mother_occupation: 'Housewife',
    siblings_details: 'None',
    primary_caregiver: 'Mother',
    formal_diagnosis: true,
    formal_diagnosis_details: 'ADHD',
    other_medical_conditions: false,
    other_medical_conditions_details: '',
    food_allergies: false,
    food_allergies_details: '',
    past_schools: 'Wattala Primary Daycare',
    interests: ['Animals', 'Sensory/messy play', 'Computer'],
    other_interests: 'Water play and swimming',
    challenges: ['Screaming', 'Biting'],
    challenges_other: 'Running away when overwhelmed',
    challenges_triggers: 'Sitting still for too long, crowded spaces',
    challenges_comments: 'Enjoys using a visual timer',
    is_toilet_trained: false,
    can_feed_self: false,
    can_dress_self: false,
    can_request_things: false,
    can_understand_instructions: true,
    session_type: '2:1 School Readiness Program',
    sessions_per_week: 2,
    focus_areas: ['Social skills', 'Cognitive skills', 'Self help skills'],
    focus_areas_other: ''
  },
];

const initialSensitiveData: ChildSensitiveData[] = [
  { child_id: 1, ic_number: '201905128892', guardian_ic: '826132456V', home_address: '45/12 Temple Road, Maharagama', application_form_path: '/uploads/app_ethan.pdf', id_document_paths: ['/uploads/ethan_birth_certificate.jpg'] },
  { child_id: 2, ic_number: '202008221190', guardian_ic: '852119827V', home_address: '102 Negombo Road, Wattala', application_form_path: '/uploads/app_sithum.pdf', id_document_paths: ['/uploads/sithum_birth_certificate.jpg'] },
];

const initialHealthInfo: ChildHealthInfo[] = [
  { child_id: 1, allergies: 'Peanut allergy', medical_conditions: 'Mild asthma', special_needs: 'Requires visual schedule aids for communication.', emergency_contact_name: 'Malkanthi Wijesinghe', emergency_contact_phone: '0776789012', notes: 'Inhaler is kept in his backpack.' },
  { child_id: 2, allergies: 'None', medical_conditions: 'ADHD', special_needs: 'Sensory seeking; benefits from weighted vest during seated work.', emergency_contact_name: 'Rohan Fernando', emergency_contact_phone: '0779876543', notes: 'Keep sessions highly interactive and structured.' },
];

const initialParentLinks: ParentChildLink[] = [
  { parent_user_id: 6, child_id: 1, relationship: 'mother' }
];

const initialSessions: Session[] = [
  { id: 1, branch_id: 1, child_id: 1, trainer_id: 4, therapy_type_id: 1, session_date: '2026-07-06', start_time: '09:00', end_time: '10:00', is_recurring: true, recurrence_rule: 'WEEKLY', status: 'scheduled' },
  { id: 2, branch_id: 1, child_id: 2, trainer_id: 5, therapy_type_id: 2, session_date: '2026-07-06', start_time: '10:30', end_time: '11:30', is_recurring: false, status: 'scheduled' }
];

const initialBehaviorReports: BehaviorReport[] = [
  {
    id: 1,
    child_id: 1,
    trainer_id: 4,
    report_date: '2026-07-01',
    nature_of_incident: 'Ethan showed excellent progress during verbal modeling exercises but had minor repetitive behaviors when tired.',
    triggers_causes: 'Fatigue towards the end of the session.',
    actions_taken: 'Provided sensory breaks and verbal articulation support.',
    follow_up_observations: 'Responded well to breaks, focus improved temporarily.',
    status: 'authorized',
    principal_id: 3,
    principal_comment: 'Approved. Good progress with articulation controls.',
    authorized_at: '2026-07-02T10:00:00Z',
    visibility: 'public'
  },
  {
    id: 2,
    child_id: 2,
    trainer_id: 5,
    report_date: '2026-07-03',
    nature_of_incident: 'Agitation and resistance during transition between sorting and physical games.',
    triggers_causes: 'Sudden change in therapy activity layout.',
    actions_taken: 'Implemented pictorial transition cards and countdown timer.',
    follow_up_observations: 'Calmed down and proceeded with activities.',
    status: 'pending_review',
    visibility: 'private'
  }
];

const initialProgressReports: ProgressReport[] = [
  { id: 1, child_id: 1, trainer_id: 4, session_id: 1, report_date: '2026-07-01', notes: 'Ethan successfully identified 8/10 picture cards today. We will focus on blending next week.', media_links: ['/uploads/ethan_cards.jpg'], visible_to_parent: true }
];

const initialAcademicEvents: AcademicCalendarEvent[] = [
  { id: 1, branch_id: 1, title: 'Esala Poya Day Holiday', description: 'Therapy Center closed for Poya Day', event_date: '2026-07-28', event_type: 'holiday' },
  { id: 2, branch_id: 1, title: 'Special Notice: Parent Workshop', description: 'Interactive workshop on Home-based Sensory Regulation', event_date: '2026-07-15', event_type: 'notice' },
];

const initialTodos: Todo[] = [
  { id: 1, user_id: 4, title: 'Prepare speech flashcards', description: 'Print out card board pictures for Ethan\'s next lesson', due_date: '2026-07-05', priority: 'medium', status: 'pending' },
  { id: 2, user_id: 4, title: 'Complete monthly logs', description: 'Log speech therapy reports for all students', due_date: '2026-07-10', priority: 'high', status: 'pending' },
];

const initialMessageGroups: MessageGroup[] = [
  { id: 1, name: 'Clinical Coordinators', created_by_id: 1, participant_ids: [1, 2, 3], hide_from_non_participants: true },
  { id: 2, name: 'All Staff Updates', created_by_id: 1, participant_ids: [1, 2, 3, 4, 5], hide_from_non_participants: false },
  { id: 3, name: 'Clinical Case Study - Dinuka', created_by_id: 1, participant_ids: [1, 4], hide_from_non_participants: true }
];

const initialDirectMessages: DirectMessage[] = [
  { id: 1, sender_id: 1, group_id: 1, message_text: "Hi team, let's keep track of behavior incidents closely.", created_at: '2026-07-20T08:00:00Z', is_read_by_ids: [1] },
  { id: 2, sender_id: 2, group_id: 1, message_text: "Agreed. Articulation notes are up to date.", created_at: '2026-07-20T08:05:00Z', is_read_by_ids: [1, 2] },
  { id: 3, sender_id: 4, recipient_id: 3, message_text: "Excuse me Principal, I uploaded Ethan's progress report.", created_at: '2026-07-20T09:15:00Z', is_read_by_ids: [4] },
  { id: 4, sender_id: 1, group_id: 3, message_text: "Welcome Dinuka! This is a secure channel for your study observations.", created_at: '2026-07-20T10:00:00Z', is_read_by_ids: [1] }
];

interface SimulatorContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isLoggedIn: boolean;
  logout: () => void;
  users: User[];
  branches: Branch[];
  therapyTypes: TherapyType[];
  children: Child[];
  sensitiveData: ChildSensitiveData[];
  healthInfo: ChildHealthInfo[];
  parentLinks: ParentChildLink[];
  sessions: Session[];
  attendanceRecords: Attendance[];
  progressReports: ProgressReport[];
  behaviorReports: BehaviorReport[];
  calendarEvents: AcademicCalendarEvent[];
  todos: Todo[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  directMessages: DirectMessage[];
  messageGroups: MessageGroup[];
  showMessagesModal: boolean;
  setShowMessagesModal: (show: boolean) => void;
  activeChat: { type: 'user' | 'group'; id: number } | null;
  setActiveChat: (chat: { type: 'user' | 'group'; id: number } | null) => void;
  
  // State Mutators simulating the API endpoints
  loginAs: (userId: number) => void;
  registerChild: (data: Omit<Child, 'id' | 'status'> & Omit<ChildSensitiveData, 'child_id'> & Omit<ChildHealthInfo, 'child_id'>) => void;
  toggleChildStatus: (childId: number) => void;
  updateChildDetails: (childId: number, details: Partial<Child>, sensitiveDetails?: Partial<ChildSensitiveData>) => void;
  updateHealth: (childId: number, health: Partial<ChildHealthInfo>) => void;
  addTherapyType: (type: Omit<TherapyType, 'id' | 'branch_id'>) => void;
  createUserAccount: (data: Omit<User, 'id' | 'branch_id' | 'role_id' | 'status'> & { username?: string; password?: string }, additionalData?: { relationship?: string; childId?: number }) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  rescheduleSession: (sessionId: number, newDate: string, startTime: string, endTime: string) => void;
  cancelSession: (sessionId: number) => void;
  markAttendance: (sessionId: number, checkIn?: string, checkOut?: string, notes?: string) => void;
  addProgressReport: (report: Omit<ProgressReport, 'id' | 'trainer_id'>) => void;
  addBehaviorReport: (report: Omit<BehaviorReport, 'id' | 'trainer_id' | 'status' | 'visibility'>) => void;
  reviewBehaviorReport: (reportId: number, status: 'authorized' | 'rejected', comment: string, visibility: 'private' | 'public') => void;
  commentProgressReport: (reportId: number, comment: string) => void;
  addCalendarEvent: (event: Omit<AcademicCalendarEvent, 'id'>) => void;
  toggleTodo: (todoId: number) => void;
  addTodo: (todo: Omit<Todo, 'id' | 'user_id'>) => void;
  markNotificationRead: (notifId: number) => void;
  toggleUserStatus: (userId: number) => void;
  updateUserDetails: (userId: number, details: { name: string; email: string; phone: string }) => void;
  changePassword: (username: string, newPass: string) => void;
  getPasswordMap: () => { [key: string]: string };
  sendMessage: (text: string, recipientId?: number, groupId?: number) => void;
  createMessageGroup: (name: string, participantIds: number[], hideFromNonParticipants: boolean) => void;
  markMessagesAsRead: (senderId?: number, groupId?: number) => void;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load from LocalStorage first, otherwise use mock data
  const loadState = (key: string, fallback: any) => {
    const val = localStorage.getItem(`im_sim_${key}`);
    return val ? JSON.parse(val) : fallback;
  };

  const [currentUser, setCurrentUserState] = useState<User>(() => loadState('currentUser', initialUsers[0]));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('im_sim_isLoggedIn') === 'true';
  });
  const [users, setUsersState] = useState<User[]>(() => {
    const loaded = loadState('users', initialUsers);
    const valid = loaded.filter((u: User) => u.id <= 5);
    return valid.length === 5 ? valid : initialUsers;
  });
  const [branches] = useState<Branch[]>(() => {
    const pj = initialBranches;
    localStorage.setItem('im_sim_branches', JSON.stringify(pj));
    return pj;
  });
  const [therapyTypes, setTherapyTypes] = useState<TherapyType[]>(() => loadState('therapyTypes', initialTherapyTypes));
  const [childrenList, setChildrenList] = useState<Child[]>(() => {
    const loaded = loadState('children', initialChildren);
    return loaded.filter((c: Child) => !c.full_name.toLowerCase().includes('test') && !c.full_name.toLowerCase().includes('mewata'));
  });
  const [sensitiveData, setSensitiveData] = useState<ChildSensitiveData[]>(() => loadState('sensitiveData', initialSensitiveData));
  const [healthInfo, setHealthInfo] = useState<ChildHealthInfo[]>(() => loadState('healthInfo', initialHealthInfo));
  const [parentLinks, setParentLinks] = useState<ParentChildLink[]>(() => loadState('parentLinks', initialParentLinks));
  const [sessions, setSessions] = useState<Session[]>(() => loadState('sessions', initialSessions));
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>(() => loadState('attendance', []));
  const [progressReports, setProgressReports] = useState<ProgressReport[]>(() => loadState('progressReports', initialProgressReports));
  const [behaviorReports, setBehaviorReports] = useState<BehaviorReport[]>(() => loadState('behaviorReports', initialBehaviorReports));
  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>(() => loadState('calendarEvents', initialAcademicEvents));
  const [todos, setTodos] = useState<Todo[]>(() => loadState('todos', initialTodos));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadState('notifications', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadState('auditLogs', []));
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => loadState('directMessages', initialDirectMessages));
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>(() => loadState('messageGroups', initialMessageGroups));
  const [showMessagesModal, setShowMessagesModal] = useState<boolean>(false);
  const [activeChat, setActiveChat] = useState<{ type: 'user' | 'group'; id: number } | null>(null);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('im_sim_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Live Sync with XAMPP MySQL Backend Server on http://localhost:5000/api
  useEffect(() => {
    const syncWithXampp = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/status');
        if (!res.ok) return;
        const statusData = await res.json();
        if (statusData.status === 'online') {
          console.log("🟢 Connected to XAMPP MySQL backend server. Syncing live tables...");

          const uRes = await fetch('http://localhost:5000/api/users');
          if (uRes.ok) {
            const dbUsers = await uRes.json();
            if (dbUsers.length > 0) setUsersState(dbUsers);
          }

          const cRes = await fetch('http://localhost:5000/api/children');
          if (cRes.ok) {
            const dbChildren = await cRes.json();
            if (dbChildren.length > 0) setChildrenList(dbChildren);
          }

          const lRes = await fetch('http://localhost:5000/api/parent_child_links');
          if (lRes.ok) {
            const dbLinks = await lRes.json();
            if (dbLinks.length > 0) setParentLinks(dbLinks);
          }

          const tRes = await fetch('http://localhost:5000/api/therapy_types');
          if (tRes.ok) {
            const dbTherapy = await tRes.json();
            if (dbTherapy.length > 0) setTherapyTypes(dbTherapy);
          }

          const sRes = await fetch('http://localhost:5000/api/sessions');
          if (sRes.ok) {
            const dbSessions = await sRes.json();
            if (dbSessions.length > 0) setSessions(dbSessions);
          }

          const prRes = await fetch('http://localhost:5000/api/progress_reports');
          if (prRes.ok) {
            const dbProgress = await prRes.json();
            if (dbProgress.length > 0) setProgressReports(dbProgress);
          }

          const brRes = await fetch('http://localhost:5000/api/behavior_reports');
          if (brRes.ok) {
            const dbBehavior = await brRes.json();
            if (dbBehavior.length > 0) setBehaviorReports(dbBehavior);
          }
        }
      } catch (err) {
        // Backend offline, fallback to local storage
      }
    };

    syncWithXampp();
  }, []);

  // Dynamically fetch public holidays for Malaysia in real-time on load
  useEffect(() => {
    const fetchHolidays = async () => {
      const years = [new Date().getFullYear(), new Date().getFullYear() + 1];
      let fetchedHolidays: AcademicCalendarEvent[] = [];
      let idCounter = 1000;

      for (const year of years) {
        try {
          const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/MY`);
          if (response.ok) {
            const data = await response.json();
            const holidays: AcademicCalendarEvent[] = data.map((item: any) => ({
              id: idCounter++,
              branch_id: 1,
              title: item.name,
              description: `Official Public Holiday in Malaysia (${item.localName})`,
              event_date: item.date,
              event_type: 'holiday'
            }));
            fetchedHolidays = [...fetchedHolidays, ...holidays];
          } else {
            throw new Error("API responded with an error status");
          }
        } catch (error) {
          console.error(`Failed to fetch Malaysian holidays for ${year} from Nager.Date API:`, error);
          // Fallback common Malaysian public holidays
          const fallbackHolidays: AcademicCalendarEvent[] = [
            { id: idCounter++, branch_id: 1, title: "New Year's Day", description: "Official Public Holiday in Malaysia", event_date: `${year}-01-01`, event_type: 'holiday' },
            { id: idCounter++, branch_id: 1, title: "Federal Territory Day", description: "Official Public Holiday in Malaysia", event_date: `${year}-02-01`, event_type: 'holiday' },
            { id: idCounter++, branch_id: 1, title: "Labour Day", description: "Official Public Holiday in Malaysia", event_date: `${year}-05-01`, event_type: 'holiday' },
            { id: idCounter++, branch_id: 1, title: "National Day (Hari Merdeka)", description: "Malaysia National Day Public Holiday", event_date: `${year}-08-31`, event_type: 'holiday' },
            { id: idCounter++, branch_id: 1, title: "Malaysia Day", description: "Official Public Holiday in Malaysia", event_date: `${year}-09-16`, event_type: 'holiday' },
            { id: idCounter++, branch_id: 1, title: "Christmas Day", description: "Official Christmas Holiday", event_date: `${year}-12-25`, event_type: 'holiday' }
          ];
          fetchedHolidays = [...fetchedHolidays, ...fallbackHolidays];
        }
      }

      if (fetchedHolidays.length > 0) {
        setCalendarEvents(prev => {
          const userEvents = prev.filter(e => e.id < 1000);
          const filteredHolidays = fetchedHolidays.filter(
            h => !userEvents.some(u => u.event_date === h.event_date && u.title.toLowerCase() === h.title.toLowerCase())
          );
          const merged = [...userEvents, ...filteredHolidays].sort(
            (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
          );
          localStorage.setItem('im_sim_calendarEvents', JSON.stringify(merged));
          return merged;
        });
      }
    };

    fetchHolidays();
  }, []);

  const saveState = (key: string, data: any) => {
    localStorage.setItem(`im_sim_${key}`, JSON.stringify(data));
  };

  const triggerStateChange = (key: string, data: any, setter: Function) => {
    setter(data);
    saveState(key, data);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setIsLoggedIn(true);
    localStorage.setItem('im_sim_isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('im_sim_isLoggedIn');
  };

  const addAudit = (action: string, tableName: string, recordId?: number) => {
    const newAudit: AuditLog = {
      id: auditLogs.length + 1,
      user_id: currentUser.id,
      user_name: currentUser.name,
      action,
      table_name: tableName,
      record_id: recordId,
      ip_address: '192.168.1.45',
      created_at: new Date().toISOString()
    };
    const updated = [newAudit, ...auditLogs];
    triggerStateChange('auditLogs', updated, setAuditLogs);
  };

  const loginAs = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUserState(user);
      addAudit('login_device', 'users', user.id);
    }
  };

  const registerChild = (data: any) => {
    const childId = childrenList.length + 1;
    const newChild: Child = {
      id: childId,
      branch_id: data.branch_id,
      therapy_type_id: data.therapy_type_id,
      full_name: data.full_name,
      dob: data.dob,
      gender: data.gender,
      enrollment_date: data.enrollment_date,
      status: 'active',
      consent_pics_parents: !!data.consent_pics_parents,
      consent_pics_social_media: !!data.consent_pics_social_media,
      consent_celebrations: !!data.consent_celebrations,
      consent_food: !!data.consent_food,
      father_name: data.father_name || '',
      father_phone: data.father_phone || '',
      father_occupation: data.father_occupation || '',
      mother_name: data.mother_name || '',
      mother_phone: data.mother_phone || '',
      mother_occupation: data.mother_occupation || '',
      siblings_details: data.siblings_details || '',
      primary_caregiver: data.primary_caregiver || '',
      formal_diagnosis: !!data.formal_diagnosis,
      formal_diagnosis_details: data.formal_diagnosis_details || '',
      other_medical_conditions: !!data.other_medical_conditions,
      other_medical_conditions_details: data.other_medical_conditions_details || '',
      food_allergies: !!data.food_allergies,
      food_allergies_details: data.food_allergies_details || '',
      past_schools: data.past_schools || '',
      interests: data.interests || [],
      other_interests: data.other_interests || '',
      challenges: data.challenges || [],
      challenges_other: data.challenges_other || '',
      challenges_triggers: data.challenges_triggers || '',
      challenges_comments: data.challenges_comments || '',
      is_toilet_trained: !!data.is_toilet_trained,
      can_feed_self: !!data.can_feed_self,
      can_dress_self: !!data.can_dress_self,
      can_request_things: !!data.can_request_things,
      can_understand_instructions: !!data.can_understand_instructions,
      session_type: data.session_type || '1:1 Early Intervention Program',
      sessions_per_week: parseInt(data.sessions_per_week) || 1,
      focus_areas: data.focus_areas || [],
      focus_areas_other: data.focus_areas_other || ''
    };
    const newSens: ChildSensitiveData = {
      child_id: childId,
      ic_number: data.ic_number,
      guardian_ic: data.guardian_ic,
      home_address: data.home_address,
      application_form_path: data.application_form_path || '/uploads/app_doc.pdf',
      id_document_paths: data.id_document_paths && data.id_document_paths.length > 0 ? data.id_document_paths : ['/uploads/doc_id_cert.jpg'],
    };
    const newHealth: ChildHealthInfo = {
      child_id: childId,
      allergies: data.allergies,
      medical_conditions: data.medical_conditions,
      special_needs: data.special_needs,
      emergency_contact_name: data.emergency_contact_name,
      emergency_contact_phone: data.emergency_contact_phone,
      notes: data.notes || '',
    };

    triggerStateChange('children', [...childrenList, newChild], setChildrenList);
    triggerStateChange('sensitiveData', [...sensitiveData, newSens], setSensitiveData);
    triggerStateChange('healthInfo', [...healthInfo, newHealth], setHealthInfo);

    // Sync POST to XAMPP MySQL Backend (students table)
    fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChild)
    }).catch(() => {});

    addAudit('register_child', 'students', childId);
  };

  const updateHealth = (childId: number, health: Partial<ChildHealthInfo>) => {
    const updated = healthInfo.map(h => {
      if (h.child_id === childId) {
        return { ...h, ...health };
      }
      return h;
    });
    triggerStateChange('healthInfo', updated, setHealthInfo);
    addAudit('update_health_info', 'children_health_info', childId);
  };

  const addTherapyType = (type: Omit<TherapyType, 'id' | 'branch_id'>) => {
    const newT: TherapyType = {
      ...type,
      id: therapyTypes.length + 1,
      branch_id: 1
    };
    triggerStateChange('therapyTypes', [...therapyTypes, newT], setTherapyTypes);
    addAudit('add_therapy_type', 'therapy_types', newT.id);

    fetch('http://localhost:5000/api/therapy_types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(type)
    }).catch(() => {});
  };

  const createUserAccount = (
    data: Omit<User, 'id' | 'branch_id' | 'role_id' | 'status'> & { username?: string; password?: string },
    additionalData?: { relationship?: string; childId?: number }
  ) => {
    let role_id = 4;
    if (data.role === 'super_admin') role_id = 1;
    else if (data.role === 'admin') role_id = 2;
    else if (data.role === 'principal') role_id = 3;
    else if (data.role === 'parent') role_id = 5;

    const newUserId = users.length + 1;
    const { username, password, ...rest } = data;
    const newUser: User = {
      ...rest,
      id: newUserId,
      branch_id: 1,
      role_id,
      status: 'active',
      username
    };

    if (username && password) {
      const map = getPasswordMap();
      map[username.toLowerCase()] = password;
      localStorage.setItem('im_sim_passwords', JSON.stringify(map));
    }

    triggerStateChange('users', [...users, newUser], setUsersState);
    addAudit(`create_user_account_for_${newUser.name}`, 'users', newUser.id);

    // Sync POST to XAMPP MySQL Backend
    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: data.role,
        name: data.name,
        email: data.email,
        phone: data.phone,
        username,
        password,
        relationship: additionalData?.relationship,
        childId: additionalData?.childId
      })
    }).catch(() => {});

    if (data.role === 'parent' && additionalData?.childId && additionalData?.relationship) {
      const newLink: ParentChildLink = {
        parent_user_id: newUserId,
        child_id: additionalData.childId,
        relationship: additionalData.relationship
      };
      triggerStateChange('parentLinks', [...parentLinks, newLink], setParentLinks);
      addAudit(`linked_parent_${newUserId}_to_child_${additionalData.childId}`, 'parent_child_links', newUserId);
    }
  };

  const toggleChildStatus = (childId: number) => {
    const child = childrenList.find(c => c.id === childId);
    if (!child) return;
    const newStatus = child.status === 'active' ? 'inactive' : 'active';
    const updated = childrenList.map(c => {
      if (c.id === childId) {
        return { ...c, status: newStatus as any };
      }
      return c;
    });
    triggerStateChange('children', updated, setChildrenList);
    addAudit('toggle_child_status', 'students', childId);

    fetch(`http://localhost:5000/api/students/${childId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  const updateChildDetails = (childId: number, details: Partial<Child>, sensitiveDetails?: Partial<ChildSensitiveData>) => {
    const updatedChildren = childrenList.map(c => {
      if (c.id === childId) {
        return { ...c, ...details };
      }
      return c;
    });
    triggerStateChange('children', updatedChildren, setChildrenList);

    if (sensitiveDetails) {
      const updatedSens = sensitiveData.map(s => {
        if (s.child_id === childId) {
          return { ...s, ...sensitiveDetails };
        }
        return s;
      });
      triggerStateChange('sensitiveData', updatedSens, setSensitiveData);
    }
    addAudit('update_child_details', 'children', childId);
  };

  const addSession = (session: Omit<Session, 'id'>) => {
    const newS: Session = {
      ...session,
      id: sessions.length + 1
    };
    triggerStateChange('sessions', [...sessions, newS], setSessions);
    addAudit('schedule_session', 'sessions', newS.id);

    fetch('http://localhost:5000/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    }).catch(() => {});
  };

  const rescheduleSession = (sessionId: number, newDate: string, startTime: string, endTime: string) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'replaced' as const };
      }
      return s;
    });

    const original = sessions.find(s => s.id === sessionId)!;
    const newReplacement: Session = {
      id: sessions.length + 1,
      branch_id: original.branch_id,
      child_id: original.child_id,
      trainer_id: original.trainer_id,
      therapy_type_id: original.therapy_type_id,
      session_date: newDate,
      start_time: startTime,
      end_time: endTime,
      is_recurring: false,
      parent_session_id: sessionId,
      status: 'scheduled',
    };

    triggerStateChange('sessions', [...updated, newReplacement], setSessions);
    addAudit('reschedule_session', 'sessions', newReplacement.id);
  };

  const cancelSession = (sessionId: number) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, status: 'cancelled' as const };
      }
      return s;
    });
    triggerStateChange('sessions', updated, setSessions);
    addAudit('cancel_session', 'sessions', sessionId);
  };

  const markAttendance = (sessionId: number, checkIn?: string, checkOut?: string, notes?: string) => {
    const records = [...attendanceRecords];
    const existingIdx = records.findIndex(r => r.session_id === sessionId);
    
    if (existingIdx > -1) {
      records[existingIdx] = {
        ...records[existingIdx],
        ...(checkIn && { check_in_time: checkIn }),
        ...(checkOut && { check_out_time: checkOut }),
        ...(notes && { notes }),
        marked_by_trainer_id: currentUser.id
      };
    } else {
      records.push({
        id: records.length + 1,
        session_id: sessionId,
        check_in_time: checkIn,
        check_out_time: checkOut,
        marked_by_trainer_id: currentUser.id,
        marked_via: 'web_dashboard',
        notes
      });
    }

    if (checkOut) {
      const updatedSessions = sessions.map(s => {
        if (s.id === sessionId) return { ...s, status: 'completed' as const };
        return s;
      });
      triggerStateChange('sessions', updatedSessions, setSessions);
    }

    triggerStateChange('attendance', records, setAttendanceRecords);
    addAudit('mark_attendance', 'attendance', sessionId);

    fetch('http://localhost:5000/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        marked_by_trainer_id: currentUser.id,
        marked_via: 'web_manual',
        notes: notes || ''
      })
    }).catch(() => {});
  };

  const addProgressReport = (report: Omit<ProgressReport, 'id' | 'trainer_id'>) => {
    const newRep: ProgressReport = {
      ...report,
      id: progressReports.length + 1,
      trainer_id: currentUser.id
    };
    triggerStateChange('progressReports', [...progressReports, newRep], setProgressReports);
    
    fetch('http://localhost:5000/api/progress_reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...report,
        trainer_id: currentUser.id
      })
    }).catch(() => {});

    const child = childrenList.find(c => c.id === report.child_id);
    const parentLink = parentLinks.find(pl => pl.child_id === report.child_id);
    if (parentLink) {
      const newNotif: Notification = {
        id: notifications.length + 1,
        user_id: parentLink.parent_user_id,
        title: 'New Progress Report Published',
        message: `A new progress report has been submitted for ${child?.full_name}.`,
        type: 'report_published',
        is_read: false,
        created_at: new Date().toISOString()
      };
      triggerStateChange('notifications', [...notifications, newNotif], setNotifications);
    }

    addAudit('create_progress_report', 'progress_reports', newRep.id);
  };

  const addBehaviorReport = (report: Omit<BehaviorReport, 'id' | 'trainer_id' | 'status' | 'visibility'>) => {
    const newRep: BehaviorReport = {
      ...report,
      id: behaviorReports.length + 1,
      trainer_id: currentUser.id,
      status: 'pending_review',
      visibility: 'private',
    };
    triggerStateChange('behaviorReports', [...behaviorReports, newRep], setBehaviorReports);
    
    fetch('http://localhost:5000/api/behavior_reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...report,
        trainer_id: currentUser.id
      })
    }).catch(() => {});

    addAudit('create_behavior_report', 'behavior_reports', newRep.id);
  };

  const reviewBehaviorReport = (reportId: number, status: 'authorized' | 'rejected', comment: string, visibility: 'private' | 'public') => {
    const updated = behaviorReports.map(r => {
      if (r.id === reportId) {
        const revIds = r.reviewed_by_ids || [];
        const newRevIds = revIds.includes(currentUser.id) ? revIds : [...revIds, currentUser.id];
        return {
          ...r,
          status,
          principal_id: currentUser.id,
          principal_comment: comment,
          authorized_at: status === 'authorized' ? new Date().toISOString() : undefined,
          visibility,
          reviewed_by_ids: newRevIds
        };
      }
      return r;
    });
    triggerStateChange('behaviorReports', updated, setBehaviorReports);

    fetch(`http://localhost:5000/api/behavior_reports/${reportId}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        principal_comment: comment
      })
    }).catch(() => {});

    // If public and authorized, notify parent
    if (status === 'authorized' && visibility === 'public') {
      const report = behaviorReports.find(r => r.id === reportId)!;
      const child = childrenList.find(c => c.id === report.child_id);
      const parentLink = parentLinks.find(pl => pl.child_id === report.child_id);
      if (parentLink) {
        const newNotif: Notification = {
          id: notifications.length + 1,
          user_id: parentLink.parent_user_id,
          title: 'Authorized Behavior Report',
          message: `Principal has authorized a new behavior report for ${child?.full_name}.`,
          type: 'report_published',
          is_read: false,
          created_at: new Date().toISOString()
        };
        triggerStateChange('notifications', [...notifications, newNotif], setNotifications);
      }
    }

    addAudit('review_behavior_report', 'behavior_reports', reportId);
  };

  const commentProgressReport = (reportId: number, comment: string) => {
    const updated = progressReports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          principal_id: currentUser.id,
          principal_comment: comment
        };
      }
      return r;
    });
    triggerStateChange('progressReports', updated, setProgressReports);
    addAudit('comment_progress_report', 'progress_reports', reportId);

    // Notify parent
    const report = progressReports.find(r => r.id === reportId);
    if (report && report.visible_to_parent) {
      const child = childrenList.find(c => c.id === report.child_id);
      const parentLink = parentLinks.find(pl => pl.child_id === report.child_id);
      if (parentLink) {
        const newNotif: Notification = {
          id: notifications.length + 1,
          user_id: parentLink.parent_user_id,
          title: 'Updated Progress Report Note',
          message: `A reviewer has added recommendations to ${child?.full_name}'s progress report on ${report.report_date}.`,
          is_read: false,
          type: 'report_published',
          created_at: new Date().toISOString()
        };
        triggerStateChange('notifications', [...notifications, newNotif], setNotifications);
      }
    }
  };

  const sendMessage = (text: string, recipientId?: number, groupId?: number) => {
    const newMsg: DirectMessage = {
      id: directMessages.length + 1,
      sender_id: currentUser.id,
      recipient_id: recipientId,
      group_id: groupId,
      message_text: text,
      created_at: new Date().toISOString(),
      is_read_by_ids: [currentUser.id]
    };
    const updated = [...directMessages, newMsg];
    triggerStateChange('directMessages', updated, setDirectMessages);
    addAudit('send_message', 'direct_messages', newMsg.id);
  };

  const createMessageGroup = (name: string, participantIds: number[], hideFromNonParticipants: boolean) => {
    const newGroup: MessageGroup = {
      id: messageGroups.length + 1,
      name,
      created_by_id: currentUser.id,
      participant_ids: Array.from(new Set([currentUser.id, ...participantIds])),
      hide_from_non_participants: hideFromNonParticipants
    };
    const updated = [...messageGroups, newGroup];
    triggerStateChange('messageGroups', updated, setMessageGroups);
    addAudit('create_message_group', 'message_groups', newGroup.id);
  };

  const markMessagesAsRead = (senderId?: number, groupId?: number) => {
    const updated = directMessages.map(m => {
      const matchDM = senderId && m.sender_id === senderId && m.recipient_id === currentUser.id;
      const matchGroup = groupId && m.group_id === groupId;
      if ((matchDM || matchGroup) && !m.is_read_by_ids.includes(currentUser.id)) {
        return {
          ...m,
          is_read_by_ids: [...m.is_read_by_ids, currentUser.id]
        };
      }
      return m;
    });
    triggerStateChange('directMessages', updated, setDirectMessages);
  };

  const addCalendarEvent = (event: Omit<AcademicCalendarEvent, 'id'>) => {
    const newE: AcademicCalendarEvent = {
      ...event,
      id: calendarEvents.length + 1,
      created_by_id: currentUser?.id
    };
    triggerStateChange('calendarEvents', [...calendarEvents, newE], setCalendarEvents);
    addAudit('create_calendar_event', 'academic_calendar_events', newE.id);
  };

  const toggleTodo = (todoId: number) => {
    const updated = todos.map(t => {
      if (t.id === todoId) {
        return { ...t, status: t.status === 'pending' ? 'done' as const : 'pending' as const };
      }
      return t;
    });
    triggerStateChange('todos', updated, setTodos);
  };

  const addTodo = (todo: Omit<Todo, 'id' | 'user_id'>) => {
    const newTodo: Todo = {
      ...todo,
      id: todos.length + 1,
      user_id: currentUser.id
    };
    triggerStateChange('todos', [...todos, newTodo], setTodos);
  };

  const markNotificationRead = (notifId: number) => {
    const updated = notifications.map(n => {
      if (n.id === notifId) return { ...n, is_read: true };
      return n;
    });
    triggerStateChange('notifications', updated, setNotifications);
  };

  const toggleUserStatus = (userId: number) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        addAudit(`toggle_user_status_to_${newStatus}_for_user_${u.name}`, 'users', userId);
        return { ...u, status: newStatus };
      }
      return u;
    });
    triggerStateChange('users', updated, setUsersState);
  };

  const updateUserDetails = (userId: number, details: { name: string; email: string; phone: string }) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        addAudit(`updated_user_details_for_user_${details.name}`, 'users', userId);
        return { ...u, ...details };
      }
      return u;
    });
    triggerStateChange('users', updated, setUsersState);
    if (currentUser && currentUser.id === userId) {
      const found = updated.find(u => u.id === userId);
      if (found) {
        setCurrentUser(found);
      }
    }
  };

  const getPasswordMap = () => {
    const saved = localStorage.getItem('im_sim_passwords');
    if (saved) return JSON.parse(saved);
    const defaults = {
      'superadmin': 'superpassword',
      'admin': 'adminpassword',
      'principal': 'principalpassword',
      'trainer': 'trainerpassword',
      'parent': 'parentpassword',
    };
    localStorage.setItem('im_sim_passwords', JSON.stringify(defaults));
    return defaults;
  };

  const changePassword = (username: string, newPass: string) => {
    const current = getPasswordMap();
    current[username.toLowerCase().trim()] = newPass;
    localStorage.setItem('im_sim_passwords', JSON.stringify(current));
    addAudit(`changed_password_for_user_${username}`, 'users', 0);
  };

  return (
    <SimulatorContext.Provider value={{
      currentUser,
      setCurrentUser,
      isLoggedIn,
      logout,
      users,
      branches,
      therapyTypes,
      children: childrenList,
      sensitiveData,
      healthInfo,
      parentLinks,
      sessions,
      attendanceRecords,
      progressReports,
      behaviorReports,
      calendarEvents,
      todos,
      notifications,
      auditLogs,
      loginAs,
      registerChild,
      updateHealth,
      addSession,
      rescheduleSession,
      cancelSession,
      markAttendance,
      addProgressReport,
      addBehaviorReport,
      reviewBehaviorReport,
      commentProgressReport,
      addCalendarEvent,
      toggleTodo,
      addTodo,
      markNotificationRead,
      toggleUserStatus,
      updateUserDetails,
      changePassword,
      getPasswordMap,
      directMessages,
      messageGroups,
      sendMessage,
      createMessageGroup,
      markMessagesAsRead,
      showMessagesModal,
      setShowMessagesModal,
      activeChat,
      setActiveChat,
      toggleChildStatus,
      updateChildDetails,
      addTherapyType,
      createUserAccount
    }}>
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) throw new Error('useSimulator must be used within a SimulatorProvider');
  return context;
};
