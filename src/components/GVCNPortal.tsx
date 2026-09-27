import React, { useState } from 'react';
import { ClassItem, ViolationLog, ClassWeekScore } from '../types';
import { 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  Clock, 
  ChevronRight, 
  Trophy, 
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';

interface GVCNPortalProps {
  classes: ClassItem[];
  logs: ViolationLog[];
  scores: ClassWeekScore[];
  selectedWeek: number;
  onAppealLog: (logId: string, reason: string) => void;
  defaultClassId?: string;
}

export const GVCNPortal: React.FC<GVCNPortalProps> = ({
  classes,
  logs,
  scores,
  selectedWeek,
  onAppealLog,
  defaultClassId,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId || classes[14]?.id || classes[0]?.id || '');
  const [appealingLogId, setAppealingLogId] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState<string>('');

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const currentScore = scores.find((s) => s.classId === selectedClassId);

  // Lọc các log của lớp trong tuần được chọn
  const classLogs = logs.filter(
    (l) => l.classId === selectedClassId && l.weekNumber === selectedWeek
  );

  const handleStartAppeal = (log: ViolationLog) => {
    setAppealingLogId(log.id);
    setAppealReason(log.appealReason || '');
  };

  const handleSendAppeal = (logId: string) => {
    if (!appealReason.trim()) {
      alert('Vui lòng nhập lý do giải trình / khiếu nại!');
      return;
    }
    onAppealLog(logId, appealReason.trim());
    setAppealingLogId(null);
    setAppealReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Class Selector for GVCN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
                  Cổng Thông Tin GVCN
                </span>
                <span className="text-xs text-slate-500">• Tuần {selectedWeek}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {currentClass ? `Lớp ${currentClass.name} - ${currentClass.homeroomTeacher}` : 'Chọn lớp'}
              </h2>
            </div>
          </div>

          {/* Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Đổi lớp xem:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <optgroup label="Khối Tiểu Học (14 Lớp)">
                {classes
                  .filter((c) => c.level === 'tieuhoc')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} - {c.homeroomTeacher}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Khối THCS (17 Lớp)">
                {classes
                  .filter((c) => c.level === 'thcs')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} - {c.homeroomTeacher}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Quick Class Summary */}
        {currentScore && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Điểm hiện tại</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {currentScore.finalScore} <span className="text-xs font-normal text-slate-400">/ 100đ</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Hạng trong Khối</span>
              <div className="text-2xl font-black text-blue-600 mt-1 flex items-center gap-1.5">
                #{currentScore.rankInLevel}
                {currentScore.hasFlag && (
                  <span className="text-xs bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                    Cờ Nhất 🏆
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Xếp loại nề nếp</span>
              <div className="text-base font-bold text-slate-800 mt-1.5">
                {currentScore.rating}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Đội cờ đỏ phụ trách</span>
              <div className="text-xs font-semibold text-slate-700 mt-1.5">
                {currentClass?.assignedInspector}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List of Violation & Commendation Logs for this class */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Biên Bản Ghi Nhận Trong Tuần {selectedWeek} • Lớp {currentClass?.name}
            </h3>
            <p className="text-xs text-slate-500">
              GVCN có thể xem xét các biên bản do Đội Cờ Đỏ ghi nhận và gửi phản hồi giải trình nếu có sai sót.
            </p>
          </div>
          <span className="text-xs bg-slate-200 font-bold px-2.5 py-1 rounded-full text-slate-700">
            {classLogs.length} biên bản
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {classLogs.map((log) => {
            const isNegative = log.totalPoints < 0;
            const isBeingAppealed = appealingLogId === log.id;

            return (
              <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {log.dayOfWeek} ({log.date})
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{log.criteriaName}</h4>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          isNegative
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {log.totalPoints > 0 ? `+${log.totalPoints}` : log.totalPoints} điểm
                      </span>

                      {/* Appeal Status Badge */}
                      {log.status === 'appealed' && (
                        <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Đang chờ Tổng phụ trách xem xét khiếu nại</span>
                        </span>
                      )}
                      {log.status === 'rejected' && (
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-500 line-through px-2 py-0.5 rounded-full">
                          Đã hủy trừ điểm (Khiếu nại thành công)
                        </span>
                      )}
                      {log.status === 'approved' && !log.appealReason && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã ghi sổ
                        </span>
                      )}
                    </div>

                    {/* Student details & Notes */}
                    {log.studentName && (
                      <p className="text-xs text-slate-700">
                        <strong>Học sinh liên quan:</strong> {log.studentName}
                      </p>
                    )}
                    {log.notes && (
                      <p className="text-xs text-slate-500 italic">
                        <strong>Ghi chú cờ đỏ:</strong> "{log.notes}"
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Người ghi nhận: <strong>{log.inspectorName}</strong>
                    </p>

                    {/* Display existing appeal note if any */}
                    {log.appealReason && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900">
                        <div className="font-bold flex items-center gap-1 text-amber-800">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Ý kiến phản hồi / Giải trình của GVCN:
                        </div>
                        <p className="mt-0.5">{log.appealReason}</p>
                        {log.appealResponse && (
                          <div className="mt-2 pt-2 border-t border-amber-200/60 text-slate-700">
                            <strong>Phản hồi của Tổng phụ trách:</strong> {log.appealResponse}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action: Khiếu nại Button (only for negative points & not already resolved) */}
                  {isNegative && log.status !== 'rejected' && (
                    <div>
                      {!isBeingAppealed ? (
                        <button
                          onClick={() => handleStartAppeal(log)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{log.appealReason ? 'Cập nhật giải trình' : 'Gửi giải trình / Khiếu nại'}</span>
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Inline Appeal Input Box */}
                {isBeingAppealed && (
                  <div className="mt-3 bg-blue-50/60 border border-blue-200 rounded-xl p-3 space-y-2">
                    <label className="block text-xs font-bold text-blue-900">
                      Nhập lý do khiếu nại hoặc giải trình gửi Tổng phụ trách:
                    </label>
                    <textarea
                      rows={2}
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder="VD: Em Nam đã có giấy xin phép nghỉ ốm của phụ huynh gửi cô từ sáng, cờ đỏ chưa cập nhật..."
                      className="w-full text-xs bg-white border border-blue-200 rounded-lg p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setAppealingLogId(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={() => handleSendAppeal(log.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi Lên Tổng Phụ Trách</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {classLogs.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-xs font-semibold text-slate-600">
                Tuần này lớp {currentClass?.name} chưa có biên bản vi phạm nào!
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nề nếp lớp đang được duy trì rất tốt với điểm xuất phát 100 điểm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
