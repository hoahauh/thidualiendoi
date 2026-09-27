import { ClassItem, CriteriaItem, ViolationLog, WeekConfig, GoogleSheetsConfig } from '../types';

// Danh sách 31 lớp học của Trường TH&THCS Phước Hiệp
// Khối Tiểu học: 14 lớp (1A1-1A3, 2A1-2A3, 3A1-3A3, 4A1-4A3, 5A1-5A2)
// Khối THCS: 17 lớp (6A1-6A4, 7A1-7A4, 8A1-8A4, 9A1-9A5)
export const INITIAL_CLASSES: ClassItem[] = [
  // --- KHỐI TIỂU HỌC (14 Lớp) ---
  { id: 'c-1a1', name: '1A1', grade: 1, level: 'tieuhoc', homeroomTeacher: 'Cô Trần Thị Hồng', studentCount: 32, assignedInspector: 'Đội Sao Đỏ 5A1', inspectingClassId: 'c-2a1', room: 'Phòng A101' },
  { id: 'c-1a2', name: '1A2', grade: 1, level: 'tieuhoc', homeroomTeacher: 'Cô Nguyễn Thị Lan', studentCount: 31, assignedInspector: 'Đội Sao Đỏ 5A1', inspectingClassId: 'c-2a2', room: 'Phòng A102' },
  { id: 'c-1a3', name: '1A3', grade: 1, level: 'tieuhoc', homeroomTeacher: 'Cô Phạm Thị Mai', studentCount: 33, assignedInspector: 'Đội Sao Đỏ 5A2', inspectingClassId: 'c-2a3', room: 'Phòng A103' },
  
  { id: 'c-2a1', name: '2A1', grade: 2, level: 'tieuhoc', homeroomTeacher: 'Cô Lê Thị Thúy', studentCount: 34, assignedInspector: 'Đội Sao Đỏ 4A1', inspectingClassId: 'c-3a1', room: 'Phòng A104' },
  { id: 'c-2a2', name: '2A2', grade: 2, level: 'tieuhoc', homeroomTeacher: 'Thầy Hoàng Văn Hải', studentCount: 32, assignedInspector: 'Đội Sao Đỏ 4A2', inspectingClassId: 'c-3a2', room: 'Phòng A105' },
  { id: 'c-2a3', name: '2A3', grade: 2, level: 'tieuhoc', homeroomTeacher: 'Cô Đỗ Thị Hạnh', studentCount: 33, assignedInspector: 'Đội Sao Đỏ 4A3', inspectingClassId: 'c-3a3', room: 'Phòng A106' },
  
  { id: 'c-3a1', name: '3A1', grade: 3, level: 'tieuhoc', homeroomTeacher: 'Cô Vũ Thị Thoa', studentCount: 35, assignedInspector: 'Đội Sao Đỏ 5A2', inspectingClassId: 'c-4a1', room: 'Phòng A201' },
  { id: 'c-3a2', name: '3A2', grade: 3, level: 'tieuhoc', homeroomTeacher: 'Cô Đinh Thị Yến', studentCount: 34, assignedInspector: 'Đội Sao Đỏ 5A1', inspectingClassId: 'c-4a2', room: 'Phòng A202' },
  { id: 'c-3a3', name: '3A3', grade: 3, level: 'tieuhoc', homeroomTeacher: 'Thầy Phan Thanh Tùng', studentCount: 33, assignedInspector: 'Đội Sao Đỏ 4A1', inspectingClassId: 'c-4a3', room: 'Phòng A203' },
  
  { id: 'c-4a1', name: '4A1', grade: 4, level: 'tieuhoc', homeroomTeacher: 'Cô Bùi Thị Dung', studentCount: 36, assignedInspector: 'Đội Sao Đỏ 3A1', inspectingClassId: 'c-5a1', room: 'Phòng A204' },
  { id: 'c-4a2', name: '4A2', grade: 4, level: 'tieuhoc', homeroomTeacher: 'Cô Ngô Thị Nga', studentCount: 35, assignedInspector: 'Đội Sao Đỏ 3A2', inspectingClassId: 'c-5a2', room: 'Phòng A205' },
  { id: 'c-4a3', name: '4A3', grade: 4, level: 'tieuhoc', homeroomTeacher: 'Thầy Lê Văn Hùng', studentCount: 34, assignedInspector: 'Đội Sao Đỏ 3A3', inspectingClassId: 'c-1a1', room: 'Phòng A206' },
  
  { id: 'c-5a1', name: '5A1', grade: 5, level: 'tieuhoc', homeroomTeacher: 'Thầy Nguyễn Đức Thắng', studentCount: 38, assignedInspector: 'Cờ đỏ Khối THCS', inspectingClassId: 'c-1a2', room: 'Phòng A301' },
  { id: 'c-5a2', name: '5A2', grade: 5, level: 'tieuhoc', homeroomTeacher: 'Cô Hồ Thị Phương', studentCount: 37, assignedInspector: 'Cờ đỏ Khối THCS', inspectingClassId: 'c-1a3', room: 'Phòng A302' },

  // --- KHỐI THCS (17 Lớp) ---
  { id: 'c-6a1', name: '6A1', grade: 6, level: 'thcs', homeroomTeacher: 'Thầy Nguyễn Văn Nam', studentCount: 40, assignedInspector: 'Cờ đỏ 9A1', inspectingClassId: 'c-7a1', room: 'Phòng B101' },
  { id: 'c-6a2', name: '6A2', grade: 6, level: 'thcs', homeroomTeacher: 'Cô Trần Thị Hương', studentCount: 39, assignedInspector: 'Cờ đỏ 9A2', inspectingClassId: 'c-7a2', room: 'Phòng B102' },
  { id: 'c-6a3', name: '6A3', grade: 6, level: 'thcs', homeroomTeacher: 'Cô Lê Thị Hà', studentCount: 41, assignedInspector: 'Cờ đỏ 9A3', inspectingClassId: 'c-7a3', room: 'Phòng B103' },
  { id: 'c-6a4', name: '6A4', grade: 6, level: 'thcs', homeroomTeacher: 'Thầy Đỗ Minh Quân', studentCount: 38, assignedInspector: 'Cờ đỏ 9A4', inspectingClassId: 'c-7a4', room: 'Phòng B104' },

  { id: 'c-7a1', name: '7A1', grade: 7, level: 'thcs', homeroomTeacher: 'Cô Võ Thị Thảo', studentCount: 39, assignedInspector: 'Cờ đỏ 8A1', inspectingClassId: 'c-6a1', room: 'Phòng B201' },
  { id: 'c-7a2', name: '7A2', grade: 7, level: 'thcs', homeroomTeacher: 'Thầy Vũ Đình Trọng', studentCount: 40, assignedInspector: 'Cờ đỏ 8A2', inspectingClassId: 'c-6a2', room: 'Phòng B202' },
  { id: 'c-7a3', name: '7A3', grade: 7, level: 'thcs', homeroomTeacher: 'Cô Phạm Bích Ngọc', studentCount: 38, assignedInspector: 'Cờ đỏ 8A3', inspectingClassId: 'c-6a3', room: 'Phòng B203' },
  { id: 'c-7a4', name: '7A4', grade: 7, level: 'thcs', homeroomTeacher: 'Cô Hoàng Thu Trang', studentCount: 37, assignedInspector: 'Cờ đỏ 8A4', inspectingClassId: 'c-6a4', room: 'Phòng B204' },

  { id: 'c-8a1', name: '8A1', grade: 8, level: 'thcs', homeroomTeacher: 'Thầy Đặng Quốc Bảo', studentCount: 42, assignedInspector: 'Cờ đỏ 9A5', inspectingClassId: 'c-9a1', room: 'Phòng B301' },
  { id: 'c-8a2', name: '8A2', grade: 8, level: 'thcs', homeroomTeacher: 'Cô Nguyễn Mai Anh', studentCount: 41, assignedInspector: 'Cờ đỏ 7A1', inspectingClassId: 'c-9a2', room: 'Phòng B302' },
  { id: 'c-8a3', name: '8A3', grade: 8, level: 'thcs', homeroomTeacher: 'Cô Đoàn Thị Tuyết', studentCount: 40, assignedInspector: 'Cờ đỏ 7A2', inspectingClassId: 'c-9a3', room: 'Phòng B303' },
  { id: 'c-8a4', name: '8A4', grade: 8, level: 'thcs', homeroomTeacher: 'Thầy Bùi Văn Khang', studentCount: 39, assignedInspector: 'Cờ đỏ 7A3', inspectingClassId: 'c-9a4', room: 'Phòng B304' },

  { id: 'c-9a1', name: '9A1', grade: 9, level: 'thcs', homeroomTeacher: 'Cô Trịnh Thu Thủy', studentCount: 43, assignedInspector: 'Cờ đỏ 6A1', inspectingClassId: 'c-8a1', room: 'Phòng C101' },
  { id: 'c-9a2', name: '9A2', grade: 9, level: 'thcs', homeroomTeacher: 'Thầy Lâm Hoài An', studentCount: 41, assignedInspector: 'Cờ đỏ 6A2', inspectingClassId: 'c-8a2', room: 'Phòng C102' },
  { id: 'c-9a3', name: '9A3', grade: 9, level: 'thcs', homeroomTeacher: 'Cô Phan Minh Châu', studentCount: 40, assignedInspector: 'Cờ đỏ 6A3', inspectingClassId: 'c-8a3', room: 'Phòng C103' },
  { id: 'c-9a4', name: '9A4', grade: 9, level: 'thcs', homeroomTeacher: 'Thầy Nguyễn Hữu Dũng', studentCount: 42, assignedInspector: 'Cờ đỏ 6A4', inspectingClassId: 'c-8a4', room: 'Phòng C104' },
  { id: 'c-9a5', name: '9A5', grade: 9, level: 'thcs', homeroomTeacher: 'Cô Lương Ánh Tuyết', studentCount: 39, assignedInspector: 'Cờ đỏ 7A4', inspectingClassId: 'c-9a5', room: 'Phòng C105' },
];

// Danh mục biểu điểm thi đua Liên Đội Trường TH&THCS Phước Hiệp
export const INITIAL_CRITERIA: CriteriaItem[] = [
  // 1. Chuyên cần & Nề nếp
  { id: 'cr-101', code: 'CC01', category: 'chuyencan', categoryName: 'Chuyên cần & Nề nếp', name: 'Đi học muộn', points: -2, unit: 'lượt', description: 'Đến trường sau tiếng trống tập trung / vào lớp' },
  { id: 'cr-102', code: 'CC02', category: 'chuyencan', categoryName: 'Chuyên cần & Nề nếp', name: 'Nghỉ học không phép', points: -5, unit: 'học sinh', description: 'Vắng không có giấy xin phép của phụ huynh' },
  { id: 'cr-103', code: 'CC03', category: 'chuyencan', categoryName: 'Chuyên cần & Nề nếp', name: 'Bỏ tiết / Trốn học', points: -10, unit: 'lượt', description: 'Tự ý ra khỏi trường trong giờ học' },
  { id: 'cr-104', code: 'CC04', category: 'chuyencan', categoryName: 'Chuyên cần & Nề nếp', name: 'Không xếp hàng ra vào lớp', points: -2, unit: 'lần', description: 'Xô đẩy, chen lấn khi xếp hàng đầu giờ / thể dục' },
  { id: 'cr-105', code: 'CC05', category: 'chuyencan', categoryName: 'Chuyên cần & Nề nếp', name: 'Đi xe đạp trong sân trường', points: -3, unit: 'lượt', description: 'Không dắt xe từ cổng trường vào nhà xe' },

  // 2. Trang phục & Tác phong
  { id: 'cr-201', code: 'TP01', category: 'dongphuc', categoryName: 'Trang phục & Tác phong', name: 'Không đeo khăn quàng đỏ', points: -2, unit: 'lượt', description: 'Đội viên không đeo khăn quàng hợp lệ' },
  { id: 'cr-202', code: 'TP02', category: 'dongphuc', categoryName: 'Trang phục & Tác phong', name: 'Sai đồng phục / Không sơ vin', points: -2, unit: 'lượt', description: 'Không mặc áo đồng phục hoặc áo thể dục theo quy định' },
  { id: 'cr-203', code: 'TP03', category: 'dongphuc', categoryName: 'Trang phục & Tác phong', name: 'Đi dép lê / dép không quai hậu', points: -2, unit: 'lượt', description: 'Quy định phải đi giày hoặc dép có quai hậu' },
  { id: 'cr-204', code: 'TP04', category: 'dongphuc', categoryName: 'Trang phục & Tác phong', name: 'Nhuộm tóc / Đeo trang sức phản cảm', points: -5, unit: 'lượt', description: 'Vi phạm quy chế tác phong học sinh' },

  // 3. Học tập & 15 phút đầu giờ
  { id: 'cr-301', code: 'HT01', category: 'hoctap', categoryName: 'Học tập & 15 phút', name: '15 phút đầu giờ mất trật tự', points: -3, unit: 'buổi', description: 'Không truy bài, làm ồn, không hát Đội ca đúng giờ' },
  { id: 'cr-302', code: 'HT02', category: 'hoctap', categoryName: 'Học tập & 15 phút', name: 'Tiết học bị ghi sổ đầu bài loại B/C', points: -5, unit: 'tiết', description: 'Giáo viên bộ môn đánh giá giờ học yếu' },
  { id: 'cr-303', code: 'HT03', category: 'hoctap', categoryName: 'Học tập & 15 phút', name: 'Học sinh không thuộc bài / thiếu bài tập', points: -2, unit: 'lượt', description: 'Bị ghi tên vào sổ theo dõi của lớp' },
  { id: 'cr-304', code: 'HT04', category: 'hoctap', categoryName: 'Học tập & 15 phút', name: 'Hoa điểm 10 / Tiết học tốt (Loại A)', points: 2, unit: 'lượt', description: 'Thưởng điểm khuyến khích phong trào học tập tốt', isReward: true },
  { id: 'cr-305', code: 'HT05', category: 'hoctap', categoryName: 'Học tập & 15 phút', name: 'Đoạt giải thi Học sinh giỏi / Hội khỏe', points: 10, unit: 'giải', description: 'Thưởng thành tích cấp Huyện / Tỉnh', isReward: true },

  // 4. Vệ sinh & Môi trường
  { id: 'cr-401', code: 'VS01', category: 'vesinh', categoryName: 'Vệ sinh & Môi trường', name: 'Lớp học bẩn / Bàn ghế lộn xộn', points: -3, unit: 'buổi', description: 'Chưa quét lớp, xóa bảng, kê bàn ghế ngay ngắn' },
  { id: 'cr-402', code: 'VS02', category: 'vesinh', categoryName: 'Vệ sinh & Môi trường', name: 'Không đổ rác đúng nơi quy định', points: -3, unit: 'lần', description: 'Để thùng rác đầy tràn hoặc đổ rác sai vị trí' },
  { id: 'cr-403', code: 'VS03', category: 'vesinh', categoryName: 'Vệ sinh & Môi trường', name: 'Xả rác khu vực hành lang / sân trường', points: -5, unit: 'lượt', description: 'Vứt vỏ bánh kẹo, hộp sữa bừa bãi' },
  { id: 'cr-404', code: 'VS04', category: 'vesinh', categoryName: 'Vệ sinh & Môi trường', name: 'Chăm sóc bồn hoa măng non tốt', points: 5, unit: 'tuần', description: 'Công trình măng non sạch cỏ, hoa tươi tốt', isReward: true },

  // 5. Hoạt động Đội & Phong trào
  { id: 'cr-501', code: 'HD01', category: 'hoatdong', categoryName: 'Hoạt động Đội & Phong trào', name: 'Vi phạm ATGT trước cổng trường', points: -10, unit: 'lượt', description: 'Không đội mũ bảo hiểm hoặc tụ tập gây ùn tắc' },
  { id: 'cr-502', code: 'HD02', category: 'hoatdong', categoryName: 'Hoạt động Đội & Phong trào', name: 'Nói tục, chửi thề / Gây gổ', points: -10, unit: 'lượt', description: 'Hành vi vi phạm đạo đức, nếp sống văn minh' },
  { id: 'cr-503', code: 'HD03', category: 'hoatdong', categoryName: 'Hoạt động Đội & Phong trào', name: 'Thiếu chỉ tiêu phong trào Kế hoạch nhỏ', points: -5, unit: 'lần', description: 'Chưa đạt mức nộp giấy vụn/vỏ lon theo quy định' },
  { id: 'cr-504', code: 'HD04', category: 'hoatdong', categoryName: 'Hoạt động Đội & Phong trào', name: 'Hoàn thành xuất sắc Kế hoạch nhỏ', points: 10, unit: 'lần', description: 'Vượt chỉ tiêu Liên đội giao', isReward: true },
  { id: 'cr-505', code: 'HD05', category: 'hoatdong', categoryName: 'Hoạt động Đội & Phong trào', name: 'Tiết mục văn nghệ chào cờ đạt loại A', points: 5, unit: 'buổi', description: 'Trình diễn sinh hoạt dưới cờ xuất sắc', isReward: true },
];

// Nhật ký vi phạm mẫu tuần 24
export const INITIAL_LOGS: ViolationLog[] = [
  {
    id: 'log-1',
    weekNumber: 24,
    dayOfWeek: 'Thứ 2',
    date: '2026-09-22',
    classId: 'c-6a1',
    className: '6A1',
    level: 'thcs',
    criteriaId: 'cr-101',
    criteriaName: 'Đi học muộn',
    category: 'chuyencan',
    points: -2,
    count: 2,
    totalPoints: -4,
    studentName: 'Nguyễn Văn Hải, Trần Tuấn Kiệt',
    notes: 'Đến trường lúc 7h15 sau khi đóng cổng',
    inspectorName: 'Nguyễn Hoàng Long (9A1)',
    status: 'approved',
    createdAt: '2026-09-22T07:20:00Z',
  },
  {
    id: 'log-2',
    weekNumber: 24,
    dayOfWeek: 'Thứ 2',
    date: '2026-09-22',
    classId: 'c-7a2',
    className: '7A2',
    level: 'thcs',
    criteriaId: 'cr-201',
    criteriaName: 'Không đeo khăn quàng đỏ',
    category: 'dongphuc',
    points: -2,
    count: 1,
    totalPoints: -2,
    studentName: 'Lê Gia Hân',
    notes: 'Quên khăn quàng ở nhà',
    inspectorName: 'Đặng Tuấn Anh (8A2)',
    status: 'approved',
    createdAt: '2026-09-22T07:25:00Z',
  },
  {
    id: 'log-3',
    weekNumber: 24,
    dayOfWeek: 'Thứ 3',
    date: '2026-09-23',
    classId: 'c-8a1',
    className: '8A1',
    level: 'thcs',
    criteriaId: 'cr-401',
    criteriaName: 'Lớp học bẩn / Bàn ghế lộn xộn',
    category: 'vesinh',
    points: -3,
    count: 1,
    totalPoints: -3,
    studentName: 'Tổ 2 trực nhật',
    notes: 'Còn rác trong hộc bàn cuối lớp',
    inspectorName: 'Trần Bảo Ngọc (9A5)',
    status: 'approved',
    createdAt: '2026-09-23T11:35:00Z',
  },
  {
    id: 'log-4',
    weekNumber: 24,
    dayOfWeek: 'Thứ 3',
    date: '2026-09-23',
    classId: 'c-3a2',
    className: '3A2',
    level: 'tieuhoc',
    criteriaId: 'cr-101',
    criteriaName: 'Đi học muộn',
    category: 'chuyencan',
    points: -2,
    count: 1,
    totalPoints: -2,
    studentName: 'Bùi Đức Trọng',
    notes: 'Phụ huynh chở đi học trễ',
    inspectorName: 'Sao đỏ 5A1',
    status: 'appealed',
    appealReason: 'Em Trọng bị thủng săm xe, phụ huynh đã gửi tin nhắn xác nhận lúc 7h05',
    createdAt: '2026-09-23T07:30:00Z',
  },
  {
    id: 'log-5',
    weekNumber: 24,
    dayOfWeek: 'Thứ 4',
    date: '2026-09-24',
    classId: 'c-9a1',
    className: '9A1',
    level: 'thcs',
    criteriaId: 'cr-304',
    criteriaName: 'Hoa điểm 10 / Tiết học tốt (Loại A)',
    category: 'hoctap',
    points: 2,
    count: 3,
    totalPoints: 6,
    studentName: 'Đoàn Thanh Mai, Lê Nhật Minh',
    notes: '3 điểm 10 môn Toán và Tiếng Anh',
    inspectorName: 'Sao đỏ 6A1',
    status: 'approved',
    createdAt: '2026-09-24T10:15:00Z',
  },
  {
    id: 'log-6',
    weekNumber: 24,
    dayOfWeek: 'Thứ 4',
    date: '2026-09-24',
    classId: 'c-1a1',
    className: '1A1',
    level: 'tieuhoc',
    criteriaId: 'cr-404',
    criteriaName: 'Chăm sóc bồn hoa măng non tốt',
    category: 'vesinh',
    points: 5,
    count: 1,
    totalPoints: 5,
    studentName: 'Toàn thể lớp 1A1',
    notes: 'Bồn hoa cây xanh tưới đều, sạch cỏ',
    inspectorName: 'Sao đỏ 5A1',
    status: 'approved',
    createdAt: '2026-09-24T15:30:00Z',
  },
  {
    id: 'log-7',
    weekNumber: 24,
    dayOfWeek: 'Thứ 5',
    date: '2026-09-25',
    classId: 'c-9a4',
    className: '9A4',
    level: 'thcs',
    criteriaId: 'cr-501',
    criteriaName: 'Vi phạm ATGT trước cổng trường',
    category: 'hoatdong',
    points: -10,
    count: 1,
    totalPoints: -10,
    studentName: 'Phan Văn Đạt',
    notes: 'Không đội mũ bảo hiểm khi đi xe máy điện',
    inspectorName: 'Sao đỏ 6A4',
    status: 'approved',
    createdAt: '2026-09-25T07:10:00Z',
  },
  {
    id: 'log-8',
    weekNumber: 24,
    dayOfWeek: 'Thứ 5',
    date: '2026-09-25',
    classId: 'c-5a1',
    className: '5A1',
    level: 'tieuhoc',
    criteriaId: 'cr-304',
    criteriaName: 'Hoa điểm 10 / Tiết học tốt (Loại A)',
    category: 'hoctap',
    points: 2,
    count: 2,
    totalPoints: 4,
    studentName: 'Nguyễn Thảo My, Trần Quốc Anh',
    notes: 'Tiết Toán cô giáo cho điểm 10',
    inspectorName: 'Cờ đỏ Khối THCS',
    status: 'approved',
    createdAt: '2026-09-25T09:40:00Z',
  },
  {
    id: 'log-9',
    weekNumber: 24,
    dayOfWeek: 'Thứ 6',
    date: '2026-09-26',
    classId: 'c-7a3',
    className: '7A3',
    level: 'thcs',
    criteriaId: 'cr-301',
    criteriaName: '15 phút đầu giờ mất trật tự',
    category: 'hoctap',
    points: -3,
    count: 1,
    totalPoints: -3,
    studentName: 'Tập thể lớp 7A3',
    notes: 'Nhiều học sinh nói chuyện riêng không truy bài',
    inspectorName: 'Vũ Đức Thịnh (8A3)',
    status: 'approved',
    createdAt: '2026-09-26T07:05:00Z',
  },
  {
    id: 'log-10',
    weekNumber: 24,
    dayOfWeek: 'Thứ 6',
    date: '2026-09-26',
    classId: 'c-2a1',
    className: '2A1',
    level: 'tieuhoc',
    criteriaId: 'cr-202',
    criteriaName: 'Sai đồng phục / Không sơ vin',
    category: 'dongphuc',
    points: -2,
    count: 1,
    totalPoints: -2,
    studentName: 'Trần Minh Quân',
    notes: 'Không mặc áo đồng phục thứ 6',
    inspectorName: 'Sao đỏ 4A1',
    status: 'pending',
    createdAt: '2026-09-26T07:15:00Z',
  }
];

export const INITIAL_WEEK_CONFIG: WeekConfig = {
  weekNumber: 24,
  academicYear: '2025 - 2026',
  semester: 2,
  startDate: '2026-09-22',
  endDate: '2026-09-27',
  isLocked: false,
};

export const INITIAL_GOOGLE_SHEETS_CONFIG: GoogleSheetsConfig = {
  webAppUrl: '',
  sheetId: '1AbC_PhuocHiep_ThiDua_2025_2026',
  autoSync: false,
  lastSynced: '2026-09-26 17:30',
};

// Mã nguồn Google Apps Script chuẩn hóa
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: ĐỒNG BỘ THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP
 * Hệ thống 31 Lớp (Tiểu học 1-5, THCS 6-9) - Tự động tính điểm chuẩn 100đ
 * =========================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Google Apps Script API Thi Đua TH&THCS Phước Hiệp đang hoạt động!",
    timestamp: new Date()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Khởi tạo 4 Sheet chuẩn nếu chưa tồn tại
    ensureSheetsSetup(ss);

    if (action === "SYNC_LOGS") {
      var logSheet = ss.getSheetByName("NhatKy_NhapLieu");
      var logs = data.logs; // Array of violation logs
      
      logs.forEach(function(item) {
        logSheet.appendRow([
          item.id,
          item.weekNumber,
          item.dayOfWeek,
          item.date,
          item.className,
          item.level === 'tieuhoc' ? 'Tiểu học' : 'THCS',
          item.criteriaName,
          item.category,
          item.points,
          item.count,
          item.totalPoints,
          item.studentName || '',
          item.notes || '',
          item.inspectorName || '',
          item.status,
          new Date()
        ]);
      });

      return responseJSON({ status: "success", count: logs.length, message: "Đã đồng bộ biên bản thành công!" });
    }

    if (action === "SYNC_ALL") {
      // Cập nhật toàn bộ bảng điểm tính toán tuần
      updateWeeklySummary(ss, data.weekScores, data.weekNumber);
      return responseJSON({ status: "success", message: "Đã cập nhật Bảng Điểm Tuần & Dashboard!" });
    }

    return responseJSON({ status: "error", message: "Hành động không hợp lệ: " + action });

  } catch (err) {
    return responseJSON({ status: "error", error: err.toString() });
  }
}

function ensureSheetsSetup(ss) {
  var sheetNames = ["DanhMuc_Lop_TieuChi", "NhatKy_NhapLieu", "BangTinh_DiemTuan", "Dashboard_BaoCao"];
  sheetNames.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      var newSheet = ss.insertSheet(name);
      if (name === "NhatKy_NhapLieu") {
        newSheet.appendRow([
          "Mã Log", "Tuần", "Thứ", "Ngày", "Lớp", "Khối", "Tiêu chí", "Nhóm", 
          "Đơn giá điểm", "Số lượt", "Tổng điểm", "Học sinh vi phạm", "Ghi chú", 
          "Người chấm (Cờ đỏ)", "Trạng thái", "Thời gian ghi"
        ]);
        newSheet.getRange(1, 1, 1, 16).setFontWeight("bold").setBackground("#d9ead3");
      }
      if (name === "BangTinh_DiemTuan") {
        newSheet.appendRow([
          "Mã Lớp", "Tên Lớp", "Khối", "GVCN", "Điểm gốc", "Trừ Chuyên cần", "Trừ Tác phong",
          "Trừ Học tập", "Trừ Vệ sinh", "Trừ Hoạt động", "Cộng Thưởng", "Tổng Điểm", "Xếp Loại", "Hạng Khối", "Cờ Thi Đua"
        ]);
        newSheet.getRange(1, 1, 1, 15).setFontWeight("bold").setBackground("#cfe2f3");
      }
    }
  });
}

function updateWeeklySummary(ss, scores, weekNum) {
  var sheet = ss.getSheetByName("BangTinh_DiemTuan");
  if (!sheet) return;
  
  // Xóa dữ liệu cũ trừ header
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 15).clearContent();
  }

  var rows = scores.map(function(s) {
    return [
      s.classId,
      s.className,
      s.level === 'tieuhoc' ? 'Tiểu học' : 'THCS',
      s.homeroomTeacher,
      s.baseScore,
      s.chuyenCanDeduction,
      s.dongPhucDeduction,
      s.hocTapDeduction,
      s.veSinhDeduction,
      s.hoatDongDeduction,
      s.rewardPoints,
      s.finalScore,
      s.rating,
      s.rankInLevel,
      s.hasFlag ? 'Cờ Nhất Luân Lưu' : ''
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 15).setValues(rows);
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
