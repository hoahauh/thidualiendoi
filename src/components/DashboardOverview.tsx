import React, { useState } from 'react';
import { ClassWeekScore, SchoolLevel } from '../types';
import { 
  Trophy, 
  Award, 
  Flag, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Download, 
  Filter, 
  CheckCircle2, 
  ChevronRight,
  Presentation,
  FileText,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportFlagSalutePresentation } from '../services/pptxService';
import { exportWeeklyDocxReport } from '../services/docxService';

interface DashboardOverviewProps {
  scores: ClassWeekScore[];
  selectedWeek: number;
  onSelectClassDetails: (classId: string) => void;
  onExportCSV: () => void;
  onOpenPrint: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  scores,
  selectedWeek,
  onSelectClassDetails,
  onExportCSV,
  onOpenPrint,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | SchoolLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc theo cấp học và tìm kiếm
  const filteredScores = scores
    .filter((s) => {
      if (levelFilter === 'all') return true;
      return s.level === levelFilter;
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.className.toLowerCase().includes(q) ||
        s.homeroomTeacher.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Sắp xếp theo hạng tương ứng với filter
      if (levelFilter === 'all') return a.rankOverall - b.rankOverall;
      return a.rankInLevel - b.rankInLevel;
    });

  // Tìm lớp dẫn đầu khối Tiểu học và THCS
  const topTieuHoc = scores.find((s) => s.level === 'tieuhoc' && s.rankInLevel === 1);
  const topTHCS = scores.find((s) => s.level === 'thcs' && s.rankInLevel === 1);

  // Thống kê nhanh
  const avgScore =
    scores.length > 0
      ? (scores.reduce((acc, curr) => acc + curr.finalScore, 0) / scores.length).toFixed(1)
      : '100';

  const totalViolationsCount = scores.reduce(
    (acc, curr) => acc + (curr.totalDeduction > 0 ? 1 : 0),
    0
  );

  const totalRewardsCount = scores.reduce(
    (acc, curr) => acc + (curr.rewardPoints > 0 ? 1 : 0),
    0
  );

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleExportPPTX = async () => {
    setIsExportingPptx(true);
    try {
      await exportFlagSalutePresentation(scores, selectedWeek);
    } catch (err: any) {
      alert(`Lỗi xuất PowerPoint: ${err.message}`);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handleExportDOCX = async () => {
    setIsExportingDocx(true);
    try {
      await exportWeeklyDocxReport(scores, selectedWeek);
    } catch (err: any) {
      alert(`Lỗi xuất Word: ${err.message}`);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Khối Tiểu Học Dẫn Đầu */}
        <div 
          onClick={triggerConfetti}
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-md cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-0.5 relative overflow-hidden"
        >
          <div className="absolute right-2 -bottom-2 opacity-15">
            <Trophy className="w-28 h-28" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Khối Tiểu Học (1-5)
            </span>
            <Flag className="w-5 h-5 text-amber-200 fill-amber-200" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black flex items-center gap-2">
              Lớp {topTieuHoc?.className || 'Đang cập nhật'}
              <span className="text-xs bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md font-bold">
                Cờ Nhất 🏆
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              GVCN: {topTieuHoc?.homeroomTeacher || 'N/A'}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/20 text-xs">
            <span>Điểm đạt: <strong>{topTieuHoc?.finalScore} điểm</strong></span>
            <span className="text-[11px] bg-white/25 px-1.5 py-0.5 rounded-sm">Xếp loại: {topTieuHoc?.rating}</span>
          </div>
        </div>

        {/* Card 2: Khối THCS Dẫn Đầu */}
        <div 
          onClick={triggerConfetti}
          className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl p-4 text-white shadow-md cursor-pointer hover:shadow-lg transition-transform hover:-translate-y-0.5 relative overflow-hidden"
        >
          <div className="absolute right-2 -bottom-2 opacity-15">
            <Award className="w-28 h-28" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Khối THCS (6-9)
            </span>
            <Flag className="w-5 h-5 text-red-200 fill-red-200" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black flex items-center gap-2">
              Lớp {topTHCS?.className || 'Đang cập nhật'}
              <span className="text-xs bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded-md font-bold">
                Cờ Nhất 🚩
              </span>
            </div>
            <p className="text-xs text-red-100 mt-1">
              GVCN: {topTHCS?.homeroomTeacher || 'N/A'}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/20 text-xs">
            <span>Điểm đạt: <strong>{topTHCS?.finalScore} điểm</strong></span>
            <span className="text-[11px] bg-white/25 px-1.5 py-0.5 rounded-sm">Xếp loại: {topTHCS?.rating}</span>
          </div>
        </div>

        {/* Card 3: Điểm Trung Bình Toàn Trường */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Mặt bằng nề nếp</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1.5">
              {avgScore} <span className="text-xs font-normal text-slate-500">/ 100 điểm</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Quy mô: <strong>31 lớp</strong> (14 TH + 17 THCS)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Chuẩn điểm: 100đ/tuần</span>
            <span className="text-emerald-600 font-semibold">Tích cực</span>
          </div>
        </div>

        {/* Card 4: Khen Thưởng & Vi Phạm */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider">Biến động điểm tuần</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Lớp có hoa điểm tốt / khen thưởng:
              </span>
              <strong className="text-emerald-700 font-bold">{totalRewardsCount} lớp</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Lớp có biên bản trừ điểm:
              </span>
              <strong className="text-rose-700 font-bold">{totalViolationsCount} lớp</strong>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onOpenPrint}
              className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Xem mẫu Chào cờ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onExportCSV}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Ranking Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          {/* Level Filter Tabs */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                levelFilter === 'all'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn trường (31 Lớp)
            </button>
            <button
              onClick={() => setLevelFilter('tieuhoc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                levelFilter === 'tieuhoc'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối Tiểu Học (14 Lớp)
            </button>
            <button
              onClick={() => setLevelFilter('thcs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                levelFilter === 'thcs'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Khối THCS (17 Lớp)
            </button>
          </div>

          {/* Search Box & Quick Action */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm lớp, tên GVCN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <button
              onClick={handleExportPPTX}
              disabled={isExportingPptx}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-2xs disabled:opacity-50"
              title="Xuất slide PowerPoint trình chiếu chào cờ đầu tuần"
            >
              {isExportingPptx ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Presentation className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Slide (.PPTX)</span>
            </button>

            <button
              onClick={handleExportDOCX}
              disabled={isExportingDocx}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-2xs disabled:opacity-50"
              title="Xuất văn bản Word báo cáo BGH nhà trường"
            >
              {isExportingDocx ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Word (.DOCX)</span>
            </button>

            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
              title="Xuất danh sách điểm thi đua ra file Excel/CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-16 text-center">Hạng</th>
                <th className="py-3 px-3">Lớp & Khối</th>
                <th className="py-3 px-3">Giáo Viên Chủ Nhiệm</th>
                <th className="py-3 px-2 text-center">Chuẩn</th>
                <th className="py-3 px-2 text-center text-rose-600">Trừ CC</th>
                <th className="py-3 px-2 text-center text-rose-600">Trừ TP</th>
                <th className="py-3 px-2 text-center text-rose-600">Trừ HT</th>
                <th className="py-3 px-2 text-center text-rose-600">Trừ VS</th>
                <th className="py-3 px-2 text-center text-rose-600">Trừ HĐ</th>
                <th className="py-3 px-2 text-center text-emerald-600">Thưởng</th>
                <th className="py-3 px-3 text-center font-black text-slate-900">Tổng Điểm</th>
                <th className="py-3 px-3 text-center">Xếp Loại</th>
                <th className="py-3 px-3 text-center">Cờ Luân Lưu</th>
                <th className="py-3 px-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScores.map((item) => {
                const rankToDisplay =
                  levelFilter === 'all' ? item.rankOverall : item.rankInLevel;

                let rankBadgeClass = 'bg-slate-100 text-slate-600';
                if (rankToDisplay === 1) rankBadgeClass = 'bg-amber-100 text-amber-800 font-black border border-amber-300';
                else if (rankToDisplay === 2) rankBadgeClass = 'bg-slate-200 text-slate-800 font-bold';
                else if (rankToDisplay === 3) rankBadgeClass = 'bg-amber-50 text-amber-900 font-bold border border-amber-200';

                let ratingBadgeClass = 'bg-slate-100 text-slate-700';
                if (item.rating === 'Xuất sắc') ratingBadgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
                else if (item.rating === 'Tốt') ratingBadgeClass = 'bg-blue-50 text-blue-700 border border-blue-200 font-medium';
                else if (item.rating === 'Khá') ratingBadgeClass = 'bg-amber-50 text-amber-700 border border-amber-200 font-medium';
                else if (item.rating === 'Trung bình') ratingBadgeClass = 'bg-orange-50 text-orange-700 border border-orange-200';
                else ratingBadgeClass = 'bg-rose-50 text-rose-700 border border-rose-200 font-bold';

                return (
                  <tr
                    key={item.classId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.hasFlag ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Hạng */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${rankBadgeClass}`}
                      >
                        {rankToDisplay}
                      </span>
                    </td>

                    {/* Tên Lớp & Khối */}
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800">{item.className}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold uppercase ${
                            item.level === 'tieuhoc'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.level === 'tieuhoc' ? 'Tiểu học' : 'THCS'}
                        </span>
                      </div>
                    </td>

                    {/* GVCN */}
                    <td className="py-2.5 px-3 text-slate-600">
                      {item.homeroomTeacher}
                    </td>

                    {/* Điểm chuẩn 100 */}
                    <td className="py-2.5 px-2 text-center text-slate-400 font-medium">
                      100
                    </td>

                    {/* Trừ Chuyên Cần */}
                    <td className="py-2.5 px-2 text-center font-medium">
                      {item.chuyenCanDeduction > 0 ? (
                        <span className="text-rose-600 font-semibold">-{item.chuyenCanDeduction}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Trừ Tác Phong */}
                    <td className="py-2.5 px-2 text-center font-medium">
                      {item.dongPhucDeduction > 0 ? (
                        <span className="text-rose-600 font-semibold">-{item.dongPhucDeduction}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Trừ Học Tập */}
                    <td className="py-2.5 px-2 text-center font-medium">
                      {item.hocTapDeduction > 0 ? (
                        <span className="text-rose-600 font-semibold">-{item.hocTapDeduction}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Trừ Vệ Sinh */}
                    <td className="py-2.5 px-2 text-center font-medium">
                      {item.veSinhDeduction > 0 ? (
                        <span className="text-rose-600 font-semibold">-{item.veSinhDeduction}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Trừ Hoạt Động */}
                    <td className="py-2.5 px-2 text-center font-medium">
                      {item.hoatDongDeduction > 0 ? (
                        <span className="text-rose-600 font-semibold">-{item.hoatDongDeduction}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Điểm Thưởng */}
                    <td className="py-2.5 px-2 text-center font-medium">
                      {item.rewardPoints > 0 ? (
                        <span className="text-emerald-600 font-bold">+{item.rewardPoints}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Tổng Điểm */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm font-black text-slate-900">
                        {item.finalScore}
                      </span>
                    </td>

                    {/* Xếp Loại */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] ${ratingBadgeClass}`}>
                        {item.rating}
                      </span>
                    </td>

                    {/* Cờ Thi Đua */}
                    <td className="py-2.5 px-3 text-center">
                      {item.hasFlag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 animate-pulse">
                          <Flag className="w-3 h-3 fill-amber-950" />
                          <span>Cờ Nhất</span>
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Chi Tiết */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onSelectClassDetails(item.classId)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                      >
                        Xem biên bản
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredScores.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-400">
                    Không tìm thấy lớp học nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            * Điểm xuất phát chuẩn: <strong>100 điểm/tuần</strong>. Thuật toán tự động cộng điểm thưởng phong trào và trừ điểm các tiêu chí nề nếp.
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Xuất sắc (≥95đ)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Tốt (85-94đ)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Khá (70-84đ)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Yếu (&lt;50đ)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
