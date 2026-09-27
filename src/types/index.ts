export type Role = 'admin' | 'codo' | 'gvcn' | 'public';

export type SchoolLevel = 'tieuhoc' | 'thcs';

export interface ClassItem {
  id: string;
  name: string; // e.g., '1A1', '6A1', '9A5'
  grade: number; // 1 to 9
  level: SchoolLevel;
  homeroomTeacher: string;
  studentCount: number;
  assignedInspector: string; // Cờ đỏ phụ trách chấm chéo lớp này
  inspectingClassId?: string; // Lớp mà lớp này đi chấm chéo
  room: string;
}

export type CriteriaCategory = 'chuyencan' | 'dongphuc' | 'hoctap' | 'vesinh' | 'hoatdong';

export interface CriteriaItem {
  id: string;
  code: string;
  category: CriteriaCategory;
  categoryName: string;
  name: string;
  points: number; // âm là trừ điểm (vd -2), dương là cộng thưởng (vd +5)
  unit: string; // 'lượt', 'học sinh', 'buổi', 'lần'
  description?: string;
  isReward?: boolean;
}

export type ViolationStatus = 'pending' | 'approved' | 'rejected' | 'appealed';

export interface ViolationLog {
  id: string;
  weekNumber: number;
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
  date: string;
  classId: string;
  className: string;
  level: SchoolLevel;
  criteriaId: string;
  criteriaName: string;
  category: CriteriaCategory;
  points: number; // điểm mỗi đơn vị (vd -2)
  count: number; // số lượt (vd 2)
  totalPoints: number; // points * count
  studentName?: string;
  notes?: string;
  inspectorName: string;
  status: ViolationStatus;
  appealReason?: string;
  appealResponse?: string;
  createdAt: string;
}

export interface ClassWeekScore {
  classId: string;
  className: string;
  grade: number;
  level: SchoolLevel;
  homeroomTeacher: string;
  baseScore: number; // mặc định 100
  chuyenCanDeduction: number;
  dongPhucDeduction: number;
  hocTapDeduction: number;
  veSinhDeduction: number;
  hoatDongDeduction: number;
  rewardPoints: number;
  totalDeduction: number;
  finalScore: number;
  rankInLevel: number;
  rankOverall: number;
  rating: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';
  hasFlag?: boolean; // Nhận cờ thi đua / cờ luân lưu
}

export interface WeekConfig {
  weekNumber: number;
  academicYear: string;
  semester: 1 | 2;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  sheetId: string;
  lastSynced?: string;
  autoSync: boolean;
}
