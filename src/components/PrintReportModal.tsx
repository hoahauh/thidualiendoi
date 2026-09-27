import React, { useState } from 'react';
import { ClassWeekScore } from '../types';
import { 
  X, 
  Printer, 
  Award, 
  Flag, 
  FileText, 
  Presentation, 
  RefreshCw, 
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exportFlagSalutePresentation } from '../services/pptxService';
import { exportWeeklyDocxReport } from '../services/docxService';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: ClassWeekScore[];
  selectedWeek: number;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  scores,
  selectedWeek,
}) => {
  if (!isOpen) return null;

  const [exportingPptx, setExportingPptx] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tieuHocScores = scores
    .filter((s) => s.level === 'tieuhoc')
    .sort((a, b) => a.rankInLevel - b.rankInLevel);

  const thcsScores = scores
    .filter((s) => s.level === 'thcs')
    .sort((a, b) => a.rankInLevel - b.rankInLevel);

  const topTieuHoc = tieuHocScores[0];
  const topTHCS = thcsScores[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportPPTX = async () => {
    setExportingPptx(true);
    setStatusMessage(null);
    try {
      await exportFlagSalutePresentation(scores, selectedWeek);
      setStatusMessage({
        type: 'success',
        text: `Đã xuất thành công file trình chiếu PowerPoint Tuần ${selectedWeek}!`,
      });
    } catch (err: any) {
      console.error('PPTX export error:', err);
      setStatusMessage({
        type: 'error',
        text: `Lỗi xuất file PowerPoint: ${err.message || 'Không thể tạo file .pptx'}`,
      });
    } finally {
      setExportingPptx(false);
    }
  };

  const handleExportDOCX = async () => {
    setExportingDocx(true);
    setStatusMessage(null);
    try {
      await exportWeeklyDocxReport(scores, selectedWeek);
      setStatusMessage({
        type: 'success',
        text: `Đã xuất thành công văn bản báo cáo Word (.docx) Tuần ${selectedWeek}!`,
      });
    } catch (err: any) {
      console.error('DOCX export error:', err);
      setStatusMessage({
        type: 'error',
        text: `Lỗi xuất văn bản Word: ${err.message || 'Không thể tạo file .docx'}`,
      });
    } finally {
      setExportingDocx(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold">
              Báo Cáo Thi Đua Chào Cờ Đầu Tuần {selectedWeek}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Export PPTX button */}
            <button
              onClick={handleExportPPTX}
              disabled={exportingPptx}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Tạo file trình chiếu PowerPoint 5 slide cho lễ chào cờ"
            >
              {exportingPptx ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tạo slide...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-3.5 h-3.5 text-slate-950" />
                  <span>Xuất Slide (.PPTX)</span>
                </>
              )}
            </button>

            {/* Export DOCX button */}
            <button
              onClick={handleExportDOCX}
              disabled={exportingDocx}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Tạo văn bản Word chuẩn thể thức báo cáo gửi BGH"
            >
              {exportingDocx ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tạo Word...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Xuất Word (.DOCX)</span>
                </>
              )}
            </button>

            {/* Print A4 button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In A4</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status notification banner if any */}
        {statusMessage && (
          <div
            className={`p-2.5 px-4 text-xs font-medium flex items-center justify-between print:hidden ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-b border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold underline hover:opacity-75"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Printable Paper Area (A4 style) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-900 bg-white font-serif" id="print-area">
          {/* Header Quốc hiệu & Đội */}
          <div className="flex flex-col sm:flex-row justify-between items-start text-xs border-b pb-4 mb-6 gap-4">
            <div className="text-center sm:text-left space-y-0.5">
              <p className="font-bold uppercase tracking-wider text-[11px]">ĐỘI TNTP HỒ CHÍ MINH</p>
              <p className="font-black uppercase text-xs">LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP</p>
              <p className="text-[10px] text-slate-500 font-sans italic">Số: {selectedWeek}/BC-LĐPH</p>
            </div>

            <div className="text-center space-y-0.5 sm:text-right">
              <p className="font-bold uppercase text-[11px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold underline text-[11px]">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-[10px] text-slate-500 font-sans italic mt-1">Phước Hiệp, ngày 28 tháng 09 năm 2026</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-red-700">
              BÁO CÁO THI ĐUA NỀ NẾP TUẦN {selectedWeek}
            </h1>
            <p className="text-xs italic text-slate-600 font-sans">
              (Phục vụ buổi sinh hoạt dưới cờ sáng Thứ Hai • Năm học 2025 - 2026)
            </p>
          </div>

          {/* Section 1: Nhận xét nề nếp */}
          <div className="mb-6 space-y-2 text-xs leading-relaxed font-sans">
            <h3 className="font-bold uppercase text-red-800 border-b border-red-200 pb-1 flex items-center gap-1.5 font-serif text-sm">
              I. ĐÁNH GIÁ NỀ NẾP CHUNG TOÀN TRƯỜNG (31 LỚP HỌC)
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                <strong>Ưu điểm:</strong> Đa số 31 lớp duy trì tốt việc truy bài 15 phút đầu giờ; đồng phục và đeo khăn quàng đỏ thực hiện tương đối nghiêm túc; phong trào hoa điểm 10 ghi nhận nhiều tiết học xuất sắc ở cả hai cấp học.
              </li>
              <li>
                <strong>Tồn tại cần khắc phục:</strong> Một số học sinh vẫn còn hiện tượng đi học sát giờ trống; khu vực nhà xe của khối THCS đôi lúc chưa xếp xe gọn gàng; công tác trực nhật vệ sinh cuối buổi cần được GVCN nhắc nhở kiểm tra thường xuyên hơn.
              </li>
            </ul>
          </div>

          {/* Section 2: Cờ Luân Lưu Vinh Danh */}
          <div className="mb-6 p-4 bg-amber-50/70 border border-amber-300 rounded-xl flex flex-wrap items-center justify-around gap-4 text-center font-sans">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                🚩 CỜ NHẤT KHỐI TIỂU HỌC (1-5)
              </span>
              <div className="text-lg font-black text-slate-900">
                LỚP {topTieuHoc?.className} • {topTieuHoc?.finalScore} ĐIỂM
              </div>
              <p className="text-xs text-slate-600">GVCN: {topTieuHoc?.homeroomTeacher}</p>
            </div>

            <div className="h-10 w-px bg-amber-200 hidden sm:block"></div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
                🚩 CỜ NHẤT KHỐI THCS (6-9)
              </span>
              <div className="text-lg font-black text-slate-900">
                LỚP {topTHCS?.className} • {topTHCS?.finalScore} ĐIỂM
              </div>
              <p className="text-xs text-slate-600">GVCN: {topTHCS?.homeroomTeacher}</p>
            </div>
          </div>

          {/* Section 3: Bảng xếp hạng 2 khối */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-xs font-sans">
            {/* Khối Tiểu học */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-800 mb-2 font-serif border-b pb-1">
                BẢNG ĐIỂM KHỐI TIỂU HỌC (14 LỚP)
              </h4>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th className="border border-slate-300 p-1 text-center w-8">Hạng</th>
                    <th className="border border-slate-300 p-1">Lớp</th>
                    <th className="border border-slate-300 p-1 text-center">Điểm</th>
                    <th className="border border-slate-300 p-1 text-center">Xếp Loại</th>
                  </tr>
                </thead>
                <tbody>
                  {tieuHocScores.map((s) => (
                    <tr key={s.classId} className={s.rankInLevel === 1 ? 'bg-amber-100/60 font-bold' : ''}>
                      <td className="border border-slate-300 p-1 text-center">{s.rankInLevel}</td>
                      <td className="border border-slate-300 p-1">
                        {s.className} {s.rankInLevel === 1 ? '🚩' : ''}
                      </td>
                      <td className="border border-slate-300 p-1 text-center font-bold">{s.finalScore}</td>
                      <td className="border border-slate-300 p-1 text-center text-[10px]">{s.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Khối THCS */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-800 mb-2 font-serif border-b pb-1">
                BẢNG ĐIỂM KHỐI THCS (17 LỚP)
              </h4>
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th className="border border-slate-300 p-1 text-center w-8">Hạng</th>
                    <th className="border border-slate-300 p-1">Lớp</th>
                    <th className="border border-slate-300 p-1 text-center">Điểm</th>
                    <th className="border border-slate-300 p-1 text-center">Xếp Loại</th>
                  </tr>
                </thead>
                <tbody>
                  {thcsScores.map((s) => (
                    <tr key={s.classId} className={s.rankInLevel === 1 ? 'bg-red-100/60 font-bold' : ''}>
                      <td className="border border-slate-300 p-1 text-center">{s.rankInLevel}</td>
                      <td className="border border-slate-300 p-1">
                        {s.className} {s.rankInLevel === 1 ? '🚩' : ''}
                      </td>
                      <td className="border border-slate-300 p-1 text-center font-bold">{s.finalScore}</td>
                      <td className="border border-slate-300 p-1 text-center text-[10px]">{s.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chữ ký */}
          <div className="flex justify-between items-start pt-6 font-sans text-xs">
            <div className="text-center w-48 space-y-16">
              <p className="font-bold uppercase">DUYỆT CỦA BGH NHÀ TRƯỜNG</p>
              <p className="font-bold text-slate-700">(Ký và đóng dấu)</p>
            </div>

            <div className="text-center w-48 space-y-16">
              <div>
                <p className="font-bold uppercase">TỔNG PHỤ TRÁCH ĐỘI</p>
                <p className="text-[10px] text-slate-500 italic">(Đã ký xác nhận)</p>
              </div>
              <p className="font-bold text-slate-800">Thầy Nguyễn Văn Thành</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
