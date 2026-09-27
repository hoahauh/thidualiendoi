import { ClassWeekScore } from '../types';
import { loadScript } from '../utils/scriptLoader';

/**
 * Service to generate beautiful PowerPoint presentation (.pptx)
 * for Monday Morning Flag Salute (Chào cờ đầu tuần)
 * Based on SKILL EDUCATION pptx-official principles
 */

async function getPptxGen(): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).PptxGenJS) {
    return (window as any).PptxGenJS;
  }

  // Load jszip and pptxgenjs bundle from CDN
  try {
    await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
  } catch (e) {
    console.error('Failed to load PptxGenJS CDN, retrying alternative CDN...', e);
    await loadScript('https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
  }

  return (window as any).PptxGenJS;
}

export async function exportFlagSalutePresentation(
  scores: ClassWeekScore[],
  weekNumber: number
): Promise<void> {
  const PptxGenJS = await getPptxGen();
  if (!PptxGenJS) {
    throw new Error('Không thể tải thư viện PptxGenJS. Vui lòng kiểm tra lại kết nối mạng.');
  }

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = `Báo Cáo Thi Đua Chào Cờ Tuần ${weekNumber} - TH&THCS Phước Hiệp`;
  pptx.author = 'Liên đội Trường TH&THCS Phước Hiệp';

  const tieuHocScores = scores
    .filter((s) => s.level === 'tieuhoc')
    .sort((a, b) => a.rankInLevel - b.rankInLevel);

  const thcsScores = scores
    .filter((s) => s.level === 'thcs')
    .sort((a, b) => a.rankInLevel - b.rankInLevel);

  const topTieuHoc = tieuHocScores[0];
  const topTHCS = thcsScores[0];

  // Palette: Young Pioneers Crimson & Gold & Navy
  const COLOR_RED = 'C0392B';
  const COLOR_DARK_RED = '962D22';
  const COLOR_GOLD = 'F39C12';
  const COLOR_NAVY = '1E293B';
  const COLOR_LIGHT_BG = 'F8FAFC';
  const COLOR_TEXT_MUTED = '64748B';

  // ==========================================
  // SLIDE 1: COVER SLIDE
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_DARK_RED };

  // Decorative top bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: COLOR_GOLD },
  });

  // Badge Text
  slide1.addText('ĐỘI TNTP HỒ CHÍ MINH • LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP', {
    x: 0.8,
    y: 0.8,
    w: 8.4,
    h: 0.4,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_GOLD,
    tracking: 2,
  });

  // Main Title
  slide1.addText(`BÁO CÁO THI ĐUA NỀ NẾP\nTUẦN ${weekNumber}`, {
    x: 0.8,
    y: 1.4,
    w: 8.4,
    h: 1.8,
    fontSize: 34,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    lineSpacing: 42,
  });

  // Subtitle / Purpose
  slide1.addText('SINH HOẠT DƯỚI CỜ SÁNG THỨ HAI • NĂM HỌC 2025 - 2026\nĐánh giá nề nếp 31 lớp học (14 Khối Tiểu học & 17 Khối THCS)', {
    x: 0.8,
    y: 3.4,
    w: 8.4,
    h: 0.8,
    fontSize: 14,
    fontFace: 'Arial',
    color: 'FCD34D',
    lineSpacing: 22,
  });

  // Bottom motto bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 4.6,
    w: 8.4,
    h: 0.5,
    fill: { color: 'FFFFFF', transparency: 85 },
    line: { color: COLOR_GOLD, width: 1 },
  });

  slide1.addText('★ "VÌ TỔ QUỐC XÃ HỘI CHỦ NGHĨA - VÌ LÝ TƯỞNG CỦA BÁC HỒ VĨ ĐẠI - SẴN SÀNG!" ★', {
    x: 0.8,
    y: 4.6,
    w: 8.4,
    h: 0.5,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });

  // ==========================================
  // SLIDE 2: ĐÁNH GIÁ CHUNG (2 COLUMNS)
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'FFFFFF' };

  // Header banner
  slide2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: COLOR_NAVY } });
  slide2.addText(`I. ĐÁNH GIÁ NỀ NẾP CHUNG TOÀN TRƯỜNG • TUẦN ${weekNumber}`, {
    x: 0.8,
    y: 0.2,
    w: 8.4,
    h: 0.5,
    fontSize: 18,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
  });

  // Left Box: Ưu điểm
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.2,
    w: 4.0,
    h: 3.9,
    fill: { color: 'F0FDF4' },
    line: { color: '86EFAC', width: 1.5 },
    rectRadius: 0.1,
  });

  slide2.addText('✅ ƯU ĐIỂM NỔI BẬT', {
    x: 1.0,
    y: 1.4,
    w: 3.6,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: '15803D',
  });

  const uuDiemItems = [
    '31/31 lớp duy trì tốt 15 phút truy bài đầu giờ, hát Quốc ca và Đội ca nghiêm trang.',
    'Đại đa số đội viên đeo khăn quàng đỏ đầy đủ, mặc trang phục gọn gàng đúng lịch.',
    'Phong trào "Hoa điểm 10" ghi nhận nhiều giờ học tốt ở cả 2 cấp học Tiểu học & THCS.',
    'Các lớp trực nhật sạch sẽ, chăm sóc bồn hoa măng non tươi tốt, đúng lịch phân công.',
  ];

  slide2.addText(
    uuDiemItems.map((text) => ({ text, options: { bullet: true, breakLine: true, fontFace: 'Arial', fontSize: 11, color: '1E293B' } })),
    { x: 1.0, y: 1.9, w: 3.6, h: 3.0, lineSpacing: 20 }
  );

  // Right Box: Tồn tại
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 5.2,
    y: 1.2,
    w: 4.0,
    h: 3.9,
    fill: { color: 'FEF2F2' },
    line: { color: 'FCA5A5', width: 1.5 },
    rectRadius: 0.1,
  });

  slide2.addText('⚠️ TỒN TẠI CẦN KHẮC PHỤC', {
    x: 5.4,
    y: 1.4,
    w: 3.6,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    color: 'B91C1C',
  });

  const tonTaiItems = [
    'Một số học sinh khối THCS vẫn còn hiện tượng đi học sát giờ vào lớp buổi sáng.',
    'Khu vực nhà xe học sinh đôi lúc chưa xếp xe thẳng hàng theo vị trí quy định.',
    'Cần chấm dứt hiện tượng xả rác tại khu vực phía sau dãy phòng học bộ môn.',
    'Nhắc nhở đội viên tuân thủ nghiêm Luật ATGT, đội mũ bảo hiểm khi ngồi trên xe máy.',
  ];

  slide2.addText(
    tonTaiItems.map((text) => ({ text, options: { bullet: true, breakLine: true, fontFace: 'Arial', fontSize: 11, color: '1E293B' } })),
    { x: 5.4, y: 1.9, w: 3.6, h: 3.0, lineSpacing: 20 }
  );

  // ==========================================
  // SLIDE 3: VINH DANH CỜ NHẤT
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: COLOR_LIGHT_BG };

  slide3.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: COLOR_RED } });
  slide3.addText(`II. VINH DANH LỚP DẪN ĐẦU & NHẬN CỜ LUÂN LƯU • TUẦN ${weekNumber}`, {
    x: 0.8,
    y: 0.2,
    w: 8.4,
    h: 0.5,
    fontSize: 18,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
  });

  // Hero Card Left: Tiểu học
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.4,
    w: 4.0,
    h: 3.6,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_GOLD, width: 2 },
    rectRadius: 0.15,
  });

  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 1.2,
    y: 1.7,
    w: 3.2,
    h: 0.45,
    fill: { color: 'FEF3C7' },
    rectRadius: 0.08,
  });

  slide3.addText('🚩 CỜ NHẤT KHỐI TIỂU HỌC (1 - 5)', {
    x: 1.2,
    y: 1.7,
    w: 3.2,
    h: 0.45,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: 'B45309',
    align: 'center',
  });

  slide3.addText(`LỚP ${topTieuHoc?.className || '---'}`, {
    x: 1.0,
    y: 2.3,
    w: 3.6,
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY,
    align: 'center',
  });

  slide3.addText(`${topTieuHoc?.finalScore || 100} ĐIỂM • XẾP LOẠI: ${topTieuHoc?.rating || 'Xuất sắc'}`, {
    x: 1.0,
    y: 3.1,
    w: 3.6,
    h: 0.4,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: '15803D',
    align: 'center',
  });

  slide3.addText(`GVCN: ${topTieuHoc?.homeroomTeacher || 'N/A'}`, {
    x: 1.0,
    y: 3.6,
    w: 3.6,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: COLOR_TEXT_MUTED,
    align: 'center',
  });

  slide3.addText('🏆 CHÚC MỪNG TẬP THỂ XUẤT SẮC NHẤT KHỐI TIỂU HỌC!', {
    x: 1.0,
    y: 4.2,
    w: 3.6,
    h: 0.4,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: 'B45309',
    align: 'center',
  });

  // Hero Card Right: THCS
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 5.2,
    y: 1.4,
    w: 4.0,
    h: 3.6,
    fill: { color: 'FFFFFF' },
    line: { color: COLOR_RED, width: 2 },
    rectRadius: 0.15,
  });

  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 5.6,
    y: 1.7,
    w: 3.2,
    h: 0.45,
    fill: { color: 'FEE2E2' },
    rectRadius: 0.08,
  });

  slide3.addText('🚩 CỜ NHẤT KHỐI THCS (6 - 9)', {
    x: 5.6,
    y: 1.7,
    w: 3.2,
    h: 0.45,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: 'B91C1C',
    align: 'center',
  });

  slide3.addText(`LỚP ${topTHCS?.className || '---'}`, {
    x: 5.4,
    y: 2.3,
    w: 3.6,
    h: 0.8,
    fontSize: 32,
    fontFace: 'Arial',
    bold: true,
    color: COLOR_NAVY,
    align: 'center',
  });

  slide3.addText(`${topTHCS?.finalScore || 100} ĐIỂM • XẾP LOẠI: ${topTHCS?.rating || 'Xuất sắc'}`, {
    x: 5.4,
    y: 3.1,
    w: 3.6,
    h: 0.4,
    fontSize: 13,
    fontFace: 'Arial',
    bold: true,
    color: '15803D',
    align: 'center',
  });

  slide3.addText(`GVCN: ${topTHCS?.homeroomTeacher || 'N/A'}`, {
    x: 5.4,
    y: 3.6,
    w: 3.6,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    color: COLOR_TEXT_MUTED,
    align: 'center',
  });

  slide3.addText('🏆 CHÚC MỪNG TẬP THỂ XUẤT SẮC NHẤT KHỐI THCS!', {
    x: 5.4,
    y: 4.2,
    w: 3.6,
    h: 0.4,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: 'B91C1C',
    align: 'center',
  });

  // ==========================================
  // SLIDE 4: BẢNG ĐIỂM KHỐI TIỂU HỌC (14 LỚP)
  // ==========================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: 'FFFFFF' };

  slide4.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: COLOR_NAVY } });
  slide4.addText(`III. BẢNG XẾP HẠNG THI ĐUA KHỐI TIỂU HỌC (14 LỚP) • TUẦN ${weekNumber}`, {
    x: 0.8,
    y: 0.15,
    w: 8.4,
    h: 0.5,
    fontSize: 16,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
  });

  // Table Data for Primary
  const tieuHocHeaders = [
    { text: 'Hạng', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' }, fontFace: 'Arial', fontSize: 10 } },
    { text: 'Lớp', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' }, fontFace: 'Arial', fontSize: 10 } },
    { text: 'GVCN', options: { bold: true, fill: { color: 'E2E8F0' }, fontFace: 'Arial', fontSize: 10 } },
    { text: 'Điểm Trừ', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' }, fontFace: 'Arial', fontSize: 10 } },
    { text: 'Cộng Thưởng', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' }, fontFace: 'Arial', fontSize: 10 } },
    { text: 'Tổng Điểm', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' }, fontFace: 'Arial', fontSize: 10 } },
    { text: 'Xếp Loại', options: { bold: true, align: 'center', fill: { color: 'E2E8F0' }, fontFace: 'Arial', fontSize: 10 } },
  ];

  const tieuHocRows = tieuHocScores.map((s) => [
    { text: s.rankInLevel === 1 ? '1 🚩' : String(s.rankInLevel), options: { align: 'center', fontFace: 'Arial', fontSize: 9, bold: s.rankInLevel <= 3 } },
    { text: s.className, options: { align: 'center', fontFace: 'Arial', fontSize: 9, bold: true } },
    { text: s.homeroomTeacher, options: { fontFace: 'Arial', fontSize: 9 } },
    { text: `-${s.totalDeduction}`, options: { align: 'center', fontFace: 'Arial', fontSize: 9, color: 'DC2626' } },
    { text: `+${s.rewardPoints}`, options: { align: 'center', fontFace: 'Arial', fontSize: 9, color: '16A34A' } },
    { text: `${s.finalScore}`, options: { align: 'center', fontFace: 'Arial', fontSize: 9, bold: true } },
    { text: s.rating, options: { align: 'center', fontFace: 'Arial', fontSize: 9 } },
  ]);

  slide4.addTable([tieuHocHeaders, ...tieuHocRows], {
    x: 0.8,
    y: 1.0,
    w: 8.4,
    colW: [0.8, 1.0, 2.4, 1.0, 1.0, 1.1, 1.1],
    border: { color: 'CBD5E1', pt: 0.5 },
  });

  // ==========================================
  // SLIDE 5: BẢNG ĐIỂM KHỐI THCS (17 LỚP)
  // ==========================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: 'FFFFFF' };

  slide5.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: COLOR_DARK_RED } });
  slide5.addText(`IV. BẢNG XẾP HẠNG THI ĐUA KHỐI THCS (17 LỚP) • TUẦN ${weekNumber}`, {
    x: 0.8,
    y: 0.15,
    w: 8.4,
    h: 0.5,
    fontSize: 16,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
  });

  const thcsHeaders = [
    { text: 'Hạng', options: { bold: true, align: 'center', fill: { color: 'FEE2E2' }, fontFace: 'Arial', fontSize: 9 } },
    { text: 'Lớp', options: { bold: true, align: 'center', fill: { color: 'FEE2E2' }, fontFace: 'Arial', fontSize: 9 } },
    { text: 'GVCN', options: { bold: true, fill: { color: 'FEE2E2' }, fontFace: 'Arial', fontSize: 9 } },
    { text: 'Điểm Trừ', options: { bold: true, align: 'center', fill: { color: 'FEE2E2' }, fontFace: 'Arial', fontSize: 9 } },
    { text: 'Cộng Thưởng', options: { bold: true, align: 'center', fill: { color: 'FEE2E2' }, fontFace: 'Arial', fontSize: 9 } },
    { text: 'Tổng Điểm', options: { bold: true, align: 'center', fill: { color: 'FEE2E2' }, fontFace: 'Arial', fontSize: 9 } },
    { text: 'Xếp Loại', options: { bold: true, align: 'center', fill: { color: 'FEE2E2' }, fontFace: 'Arial', fontSize: 9 } },
  ];

  const thcsRows = thcsScores.map((s) => [
    { text: s.rankInLevel === 1 ? '1 🚩' : String(s.rankInLevel), options: { align: 'center', fontFace: 'Arial', fontSize: 8.5, bold: s.rankInLevel <= 3 } },
    { text: s.className, options: { align: 'center', fontFace: 'Arial', fontSize: 8.5, bold: true } },
    { text: s.homeroomTeacher, options: { fontFace: 'Arial', fontSize: 8.5 } },
    { text: `-${s.totalDeduction}`, options: { align: 'center', fontFace: 'Arial', fontSize: 8.5, color: 'DC2626' } },
    { text: `+${s.rewardPoints}`, options: { align: 'center', fontFace: 'Arial', fontSize: 8.5, color: '16A34A' } },
    { text: `${s.finalScore}`, options: { align: 'center', fontFace: 'Arial', fontSize: 8.5, bold: true } },
    { text: s.rating, options: { align: 'center', fontFace: 'Arial', fontSize: 8.5 } },
  ]);

  slide5.addTable([thcsHeaders, ...thcsRows], {
    x: 0.8,
    y: 0.95,
    w: 8.4,
    colW: [0.8, 1.0, 2.4, 1.0, 1.0, 1.1, 1.1],
    border: { color: 'CBD5E1', pt: 0.5 },
  });

  // ==========================================
  // SLIDE 6: NHIỆM VỤ TUẦN MỚI
  // ==========================================
  const slide6 = pptx.addSlide();
  slide6.background = { color: COLOR_NAVY };

  slide6.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.15, fill: { color: COLOR_GOLD } });

  slide6.addText(`V. PHƯƠNG HƯỚNG & NHIỆM VỤ TRỌNG TÂM TUẦN ${weekNumber + 1}`, {
    x: 0.8,
    y: 0.6,
    w: 8.4,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
  });

  const tasks = [
    { title: '1. Kỷ luật & Trật tự', desc: 'Duy trì nghiêm túc 15 phút truy bài đầu giờ, không tụ tập làm ồn, thực hiện dắt xe từ cổng trường.' },
    { title: '2. Nền nếp tác phong', desc: '100% đội viên đeo khăn quàng đỏ, sơ vin và mang bảng tên. Nghiêm cấm trang phục sai quy định.' },
    { title: '3. Phong trào học tốt', desc: 'Đăng ký các tiết học tốt chào mừng đợt thi đua, không có học sinh vi phạm sổ đầu bài.' },
    { title: '4. Vệ sinh môi trường', desc: 'Thu gom rác và phân loại đúng nơi, chăm sóc cây xanh, bồn hoa măng non của từng chi đội.' },
  ];

  tasks.forEach((item, idx) => {
    const yPos = 1.4 + idx * 0.9;
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: yPos,
      w: 8.4,
      h: 0.75,
      fill: { color: 'FFFFFF', transparency: 90 },
      line: { color: COLOR_GOLD, width: 1 },
      rectRadius: 0.08,
    });

    slide6.addText(item.title, {
      x: 1.0,
      y: yPos + 0.08,
      w: 8.0,
      h: 0.3,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: COLOR_GOLD,
    });

    slide6.addText(item.desc, {
      x: 1.0,
      y: yPos + 0.38,
      w: 8.0,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: 'FFFFFF',
    });
  });

  slide6.addText('CHÚC QUÝ THẦY CÔ VÀ CÁC EM HỌC SINH MỘT TUẦN MỚI THI ĐUA HỌC TỐT, DẠY TỐT!', {
    x: 0.8,
    y: 5.1,
    w: 8.4,
    h: 0.4,
    fontSize: 12,
    fontFace: 'Arial',
    bold: true,
    color: 'FCD34D',
    align: 'center',
  });

  // Save presentation
  const fileName = `Chao_Co_Tuan_${weekNumber}_TH_THCS_PhuocHiep.pptx`;
  await pptx.writeFile({ fileName });
}
