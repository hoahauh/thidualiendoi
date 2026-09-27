import React from 'react';
import { ClassItem, ViolationLog, ClassWeekScore } from '../types';
import { X, Award, Flag, AlertCircle, CheckCircle2, User, Calendar } from 'lucide-react';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem?: ClassItem;
  score?: ClassWeekScore;
  logs: ViolationLog[];
  selectedWeek: number;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  classItem,
  score,
  logs,
  selectedWeek,
}) => {
  if (!isOpen || !classItem || !score) return null;

  const classLogs = logs.filter(
    (l) => l.classId === classItem.id && l.weekNumber === selectedWeek
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-lg">
              {classItem.name}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-amber-400">
                  {classItem.level === 'tieuhoc' ? 'Khối Tiểu Học' : 'Khối THCS'}
                </span>
                <span className="text-xs text-slate-400">• Tuần {selectedWeek}</span>
              </div>
              <h2 className="text-base font-bold">
                Lớp {classItem.name} • GVCN: {classItem.homeroomTeacher}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Summary Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hạng Khối</span>
              <div className="text-2xl font-black text-blue-600 mt-1 flex items-center justify-center gap-1">
                #{score.rankInLevel}
                {score.hasFlag && <Flag className="w-4 h-4 text-amber-500 fill-amber-500" />}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Điểm</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {score.finalScore}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Xếp Loại</span>
              <div className="text-sm font-bold text-slate-800 mt-2">
                {score.rating}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sĩ Số</span>
              <div className="text-base font-bold text-slate-800 mt-1.5">
                {classItem.studentCount} HS
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
            <span>Phòng học: <strong>{classItem.room}</strong></span>
            <span>Đội Cờ Đỏ Chấm: <strong>{classItem.assignedInspector}</strong></span>
          </div>
        </div>

        {/* Breakdown by category */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Chi tiết điểm các nhóm nề nếp</h4>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Điểm chuẩn</span>
              <strong className="text-slate-800">100đ</strong>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
              <span className="text-[10px] text-rose-600 block">Chuyên cần</span>
              <strong className="text-rose-700">-{score.chuyenCanDeduction}đ</strong>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
              <span className="text-[10px] text-rose-600 block">Tác phong</span>
              <strong className="text-rose-700">-{score.dongPhucDeduction}đ</strong>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
              <span className="text-[10px] text-rose-600 block">Học tập</span>
              <strong className="text-rose-700">-{score.hocTapDeduction}đ</strong>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
              <span className="text-[10px] text-rose-600 block">Vệ sinh</span>
              <strong className="text-rose-700">-{score.veSinhDeduction}đ</strong>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-emerald-600 block">Cộng thưởng</span>
              <strong className="text-emerald-700">+{score.rewardPoints}đ</strong>
            </div>
          </div>
        </div>

        {/* Logs list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase">
            Biên bản ghi nhận trong tuần ({classLogs.length})
          </h4>

          {classLogs.map((l) => (
            <div
              key={l.id}
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                l.totalPoints > 0
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">
                    {l.dayOfWeek} ({l.date})
                  </span>
                  <span className="text-slate-500">• {l.criteriaName}</span>
                </div>
                <span
                  className={`font-black px-2 py-0.5 rounded-full ${
                    l.totalPoints > 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {l.totalPoints > 0 ? `+${l.totalPoints}` : l.totalPoints}đ
                </span>
              </div>

              {l.studentName && (
                <p className="text-slate-600">
                  <strong>Học sinh:</strong> {l.studentName}
                </p>
              )}
              {l.notes && (
                <p className="text-slate-500 italic">
                  <strong>Ghi chú:</strong> {l.notes}
                </p>
              )}
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>Cờ đỏ: {l.inspectorName}</span>
                <span>Trạng thái: {l.status === 'approved' ? 'Đã duyệt' : l.status}</span>
              </div>
            </div>
          ))}

          {classLogs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tuần này lớp chưa có biên bản vi phạm nào!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
