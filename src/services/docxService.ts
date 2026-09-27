import { ClassWeekScore } from '../types';
import { loadScript } from '../utils/scriptLoader';

/**
 * Service to generate official Word document (.docx)
 * for weekly school disciplinary and competition report
 * Based on SKILL EDUCATION docx-official principles
 */

async function getDocxLib(): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).docx) {
    return (window as any).docx;
  }

  try {
    await loadScript('https://cdn.jsdelivr.net/npm/docx@9.1.1/build/index.umd.js');
  } catch (e) {
    console.error('Failed to load docx from CDN, retrying alternative CDN...', e);
    await loadScript('https://unpkg.com/docx@9.1.1/build/index.umd.js');
  }

  return (window as any).docx;
}

export async function exportWeeklyDocxReport(
  scores: ClassWeekScore[],
  weekNumber: number
): Promise<void> {
  const docxLib = await getDocxLib();
  if (!docxLib) {
    throw new Error('Không thể tải thư viện docx. Vui lòng kiểm tra lại kết nối mạng.');
  }

  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    BorderStyle,
  } = docxLib;

  const tieuHocScores = scores
    .filter((s) => s.level === 'tieuhoc')
    .sort((a, b) => a.rankInLevel - b.rankInLevel);

  const thcsScores = scores
    .filter((s) => s.level === 'thcs')
    .sort((a, b) => a.rankInLevel - b.rankInLevel);

  const topTieuHoc = tieuHocScores[0];
  const topTHCS = thcsScores[0];

  const currentDateStr = new Date().toLocaleDateString('vi-VN');

  // No-border table cell helper for Header
  const emptyBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '94A3B8' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '94A3B8' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '94A3B8' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '94A3B8' },
  };

  // Header Table (Left: Liên đội, Right: Quốc hiệu)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: emptyBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            borders: emptyBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'ĐỘI TNTP HỒ CHÍ MINH', bold: true, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'LIÊN ĐỘI TH&THCS PHƯỚC HIỆP', bold: true, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `Số: ${weekNumber}/BC-LĐPH`, italics: true, size: 18 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            borders: emptyBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, underline: {}, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `Phước Hiệp, ngày ${currentDateStr}`, italics: true, size: 18 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Score Table Rows
  const tableHeaderCell = (text: string, widthPct: number) =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: thinBorder,
      shading: { fill: 'E2E8F0' },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, bold: true, size: 17 })],
        }),
      ],
    });

  const tableDataCell = (text: string, align: any = AlignmentType.CENTER, bold = false) =>
    new TableCell({
      borders: thinBorder,
      children: [
        new Paragraph({
          alignment: align,
          children: [new TextRun({ text, bold, size: 17 })],
        }),
      ],
    });

  const scoreRows = scores.map((s) => {
    return new TableRow({
      children: [
        tableDataCell(String(s.rankInLevel), AlignmentType.CENTER, s.rankInLevel <= 3),
        tableDataCell(s.className, AlignmentType.CENTER, true),
        tableDataCell(s.level === 'tieuhoc' ? 'Tiểu học' : 'THCS', AlignmentType.CENTER),
        tableDataCell(s.homeroomTeacher, AlignmentType.LEFT),
        tableDataCell(String(s.baseScore)),
        tableDataCell(`-${s.totalDeduction}`),
        tableDataCell(`+${s.rewardPoints}`),
        tableDataCell(String(s.finalScore), AlignmentType.CENTER, true),
        tableDataCell(s.rating, AlignmentType.CENTER),
        tableDataCell(s.hasFlag ? 'Cờ Nhất 🚩' : ''),
      ],
    });
  });

  const fullScoreTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorder,
    rows: [
      new TableRow({
        children: [
          tableHeaderCell('Hạng', 8),
          tableHeaderCell('Lớp', 10),
          tableHeaderCell('Khối', 10),
          tableHeaderCell('GVCN', 24),
          tableHeaderCell('Điểm Chuẩn', 8),
          tableHeaderCell('Điểm Trừ', 8),
          tableHeaderCell('Điểm Thưởng', 8),
          tableHeaderCell('Tổng Điểm', 8),
          tableHeaderCell('Xếp Loại', 10),
          tableHeaderCell('Cờ Đội', 8),
        ],
      }),
      ...scoreRows,
    ],
  });

  // Signatures Table
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: emptyBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: emptyBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'DUYỆT CỦA BGH NHÀ TRƯỜNG', bold: true, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '(Ký và đóng dấu)', italics: true, size: 18 })],
              }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: emptyBorder,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'TỔNG PHỤ TRÁCH ĐỘI', bold: true, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '(Đã ký xác nhận)', italics: true, size: 18 })],
              }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Thầy Nguyễn Văn Thành', bold: true, size: 20 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Construct Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          headerTable,
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `BÁO CÁO THI ĐUA NỀ NẾP TUẦN ${weekNumber}`,
                bold: true,
                size: 28,
                color: 'C0392B',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `(Phục vụ Lễ Chào cờ đầu tuần và Lưu chiểu BGH Nhà trường • Năm học 2025 - 2026)`,
                italics: true,
                size: 18,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 1
          new Paragraph({
            children: [
              new TextRun({
                text: 'I. ĐÁNH GIÁ NỀ NẾP CHUNG TOÀN TRƯỜNG (31 LỚP HỌC)',
                bold: true,
                size: 22,
                color: '1E293B',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '1. Ưu điểm nổi bật:',
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Đại đa số 31 lớp duy trì rất tốt việc truy bài 15 phút đầu giờ; lễ chào cờ và hát Quốc ca, Đội ca diễn ra nghiêm túc, dõng dạc.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Đội viên chấp hành tốt quy định về đồng phục, mang bảng tên và đeo khăn quàng đỏ đầy đủ.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Phong trào "Hoa điểm 10" và tiết học tốt được hưởng ứng sôi nổi tại cả 2 cấp Tiểu học & THCS.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '2. Tồn tại cần khắc phục:',
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Một số học sinh khối THCS vẫn còn đi học sát giờ vào lớp buổi sáng; cần duy trì dắt xe vào cổng trường.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: 'Công tác vệ sinh cuối buổi tại các phòng học bộ môn cần được kiểm tra, xóa bảng sạch sẽ trước khi ra về.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 2
          new Paragraph({
            children: [
              new TextRun({
                text: 'II. VINH DANH LỚP DẪN ĐẦU & NHẬN CỜ LUÂN LƯU',
                bold: true,
                size: 22,
                color: 'C0392B',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `CỜ NHẤT KHỐI TIỂU HỌC: Lớp ${topTieuHoc?.className} đạt ${topTieuHoc?.finalScore} điểm (Xếp loại: ${topTieuHoc?.rating}) - GVCN: ${topTieuHoc?.homeroomTeacher}.`,
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `CỜ NHẤT KHỐI THCS: Lớp ${topTHCS?.className} đạt ${topTHCS?.finalScore} điểm (Xếp loại: ${topTHCS?.rating}) - GVCN: ${topTHCS?.homeroomTeacher}.`,
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 3
          new Paragraph({
            children: [
              new TextRun({
                text: 'III. BẢNG TỔNG HỢP KẾT QUẢ THI ĐUA 31 LỚP HỌC',
                bold: true,
                size: 22,
                color: '1E293B',
              }),
            ],
          }),
          fullScoreTable,
          new Paragraph({ text: '' }),

          // Section 4
          new Paragraph({
            children: [
              new TextRun({
                text: `IV. PHƯƠNG HƯỚNG & NHIỆM VỤ TRỌNG TÂM TUẦN ${weekNumber + 1}`,
                bold: true,
                size: 22,
                color: '1E293B',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: '1. Đẩy mạnh đợt thi đua cao điểm chào mừng các ngày lễ lớn trong tháng.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: '2. Tăng cường kiểm tra đột xuất nề nếp tác phong và việc xếp xe đạp tại khu vực nhà xe học sinh.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: '3. Phát động phong trào thu gom kế hoạch nhỏ giai đoạn 1 đạt và vượt chỉ tiêu Liên đội giao.',
                size: 19,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // Signatures
          signatureTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Bao_Cao_Thi_Dua_Tuan_${weekNumber}_TH_THCS_PhuocHiep.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
