import { ClassItem, ViolationLog, ClassWeekScore, SchoolLevel } from '../types';

export function calculateScoresForWeek(
  classes: ClassItem[],
  logs: ViolationLog[],
  weekNumber: number
): ClassWeekScore[] {
  // Lọc các log thuộc tuần được chọn và có trạng thái hợp lệ (approved hoặc pending nếu chưa duyệt)
  // Chỉ tính điểm các log không bị rejected
  const activeLogs = logs.filter(
    (log) => log.weekNumber === weekNumber && log.status !== 'rejected'
  );

  const rawScores: Omit<ClassWeekScore, 'rankInLevel' | 'rankOverall' | 'hasFlag'>[] = classes.map((cls) => {
    const classLogs = activeLogs.filter((log) => log.classId === cls.id);

    let chuyenCanDeduction = 0;
    let dongPhucDeduction = 0;
    let hocTapDeduction = 0;
    let veSinhDeduction = 0;
    let hoatDongDeduction = 0;
    let rewardPoints = 0;

    classLogs.forEach((log) => {
      if (log.totalPoints > 0) {
        rewardPoints += log.totalPoints;
      } else {
        const absDeduction = Math.abs(log.totalPoints);
        switch (log.category) {
          case 'chuyencan':
            chuyenCanDeduction += absDeduction;
            break;
          case 'dongphuc':
            dongPhucDeduction += absDeduction;
            break;
          case 'hoctap':
            hocTapDeduction += absDeduction;
            break;
          case 'vesinh':
            veSinhDeduction += absDeduction;
            break;
          case 'hoatdong':
            hoatDongDeduction += absDeduction;
            break;
        }
      }
    });

    const totalDeduction =
      chuyenCanDeduction + dongPhucDeduction + hocTapDeduction + veSinhDeduction + hoatDongDeduction;
    const baseScore = 100;
    const finalScore = baseScore - totalDeduction + rewardPoints;

    let rating: ClassWeekScore['rating'] = 'Trung bình';
    if (finalScore >= 95) rating = 'Xuất sắc';
    else if (finalScore >= 85) rating = 'Tốt';
    else if (finalScore >= 70) rating = 'Khá';
    else if (finalScore >= 50) rating = 'Trung bình';
    else rating = 'Yếu';

    return {
      classId: cls.id,
      className: cls.name,
      grade: cls.grade,
      level: cls.level,
      homeroomTeacher: cls.homeroomTeacher,
      baseScore,
      chuyenCanDeduction,
      dongPhucDeduction,
      hocTapDeduction,
      veSinhDeduction,
      hoatDongDeduction,
      rewardPoints,
      totalDeduction,
      finalScore,
      rating,
    };
  });

  // Xếp hạng toàn trường (rankOverall)
  const sortedOverall = [...rawScores].sort((a, b) => b.finalScore - a.finalScore);
  const overallRankMap = new Map<string, number>();
  sortedOverall.forEach((item, index) => {
    overallRankMap.set(item.classId, index + 1);
  });

  // Xếp hạng theo Khối (rankInLevel)
  const tieuHocSorted = rawScores
    .filter((s) => s.level === 'tieuhoc')
    .sort((a, b) => b.finalScore - a.finalScore);
  const tieuHocRankMap = new Map<string, number>();
  tieuHocSorted.forEach((item, index) => {
    tieuHocRankMap.set(item.classId, index + 1);
  });

  const thcsSorted = rawScores
    .filter((s) => s.level === 'thcs')
    .sort((a, b) => b.finalScore - a.finalScore);
  const thcsRankMap = new Map<string, number>();
  thcsSorted.forEach((item, index) => {
    thcsRankMap.set(item.classId, index + 1);
  });

  return rawScores.map((score) => {
    const rankOverall = overallRankMap.get(score.classId) || 1;
    const rankInLevel =
      score.level === 'tieuhoc'
        ? tieuHocRankMap.get(score.classId) || 1
        : thcsRankMap.get(score.classId) || 1;

    // Cờ luân lưu cho Lớp hạng Nhất của mỗi khối
    const hasFlag = rankInLevel === 1;

    return {
      ...score,
      rankOverall,
      rankInLevel,
      hasFlag,
    };
  });
}

// Xuất file CSV bảng điểm tuần hỗ trợ mở trên Google Sheets hoặc Excel (UTF-8 with BOM)
export function downloadScoresCSV(scores: ClassWeekScore[], weekNumber: number) {
  const headers = [
    'Hạng Khối',
    'Tên Lớp',
    'Khối Cấp',
    'Giáo Viên Chủ Nhiệm',
    'Điểm Chuẩn',
    'Trừ Chuyên Cần',
    'Trừ Tác Phong',
    'Trừ Học Tập',
    'Trừ Vệ Sinh',
    'Trừ Hoạt Động',
    'Tổng Điểm Trừ',
    'Cộng Thưởng',
    'Điểm Tổng Kết',
    'Xếp Loại',
    'Hạng Toàn Trường',
    'Cờ Thi Đua',
  ];

  const rows = scores.map((s) => [
    s.rankInLevel,
    s.className,
    s.level === 'tieuhoc' ? 'Tiểu học' : 'THCS',
    `"${s.homeroomTeacher}"`,
    s.baseScore,
    s.chuyenCanDeduction,
    s.dongPhucDeduction,
    s.hocTapDeduction,
    s.veSinhDeduction,
    s.hoatDongDeduction,
    s.totalDeduction,
    s.rewardPoints,
    s.finalScore,
    `"${s.rating}"`,
    s.rankOverall,
    s.hasFlag ? 'Cờ Nhất Luân Lưu' : '',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_Diem_Thi_Dua_Tuan_${weekNumber}_TH_THCS_PhuocHiep.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Xuất file CSV nhật ký vi phạm
export function downloadLogsCSV(logs: ViolationLog[], weekNumber: number) {
  const headers = [
    'Mã Biên Bản',
    'Tuần',
    'Thứ',
    'Ngày',
    'Lớp',
    'Khối',
    'Tiêu Chí',
    'Nhóm Tiêu Chí',
    'Đơn Giá Điểm',
    'Số Lượng',
    'Tổng Điểm',
    'Học Sinh Vi Phạm',
    'Ghi Chú',
    'Người Chấm (Cờ Đỏ)',
    'Trạng Thái',
    'Thời Gian Tạo',
  ];

  const filteredLogs = logs.filter((l) => l.weekNumber === weekNumber);

  const rows = filteredLogs.map((l) => [
    l.id,
    l.weekNumber,
    `"${l.dayOfWeek}"`,
    l.date,
    l.className,
    l.level === 'tieuhoc' ? 'Tiểu học' : 'THCS',
    `"${l.criteriaName}"`,
    l.category,
    l.points,
    l.count,
    l.totalPoints,
    `"${l.studentName || ''}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
    `"${l.inspectorName}"`,
    l.status,
    l.createdAt,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Nhat_Ky_Vi_Pham_Tuan_${weekNumber}_PhuocHiep.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
