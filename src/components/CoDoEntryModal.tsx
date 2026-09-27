import React, { useState } from 'react';
import { ClassItem, CriteriaItem, ViolationLog, SchoolLevel } from '../types';
import { 
  X, 
  Check, 
  Plus, 
  Minus, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface CoDoEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  criteria: CriteriaItem[];
  currentWeek: number;
  isLocked: boolean;
  onSaveLogs: (newLogs: ViolationLog[]) => void;
  defaultClassId?: string;
  inspectorName?: string;
}

export const CoDoEntryModal: React.FC<CoDoEntryModalProps> = ({
  isOpen,
  onClose,
  classes,
  criteria,
  currentWeek,
  isLocked,
  onSaveLogs,
  defaultClassId,
  inspectorName = 'Đội Cờ Đỏ Trực Tuần',
}) => {
  if (!isOpen) return null;

  const [selectedDay, setSelectedDay] = useState<'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7'>('Thứ 2');
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId || classes[0]?.id || '');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [inspector, setInspector] = useState(inspectorName);
  
  // Lưu số lượng vi phạm cho từng tiêu chí: { [criteriaId]: { count: number, studentName: string, notes: string } }
  const [selectedEntries, setSelectedEntries] = useState<Record<string, { count: number; studentName: string; notes: string }>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const days: ('Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7')[] = [
    'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'
  ];

  const categories = [
    { key: 'all', label: 'Tất cả tiêu chí' },
    { key: 'chuyencan', label: 'Chuyên cần' },
    { key: 'dongphuc', label: 'Trang phục' },
    { key: 'hoctap', label: 'Học tập' },
    { key: 'vesinh', label: 'Vệ sinh' },
    { key: 'hoatdong', label: 'Hoạt động Đội' },
  ];

  const filteredCriteria = criteria.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const updateCount = (crId: string, delta: number) => {
    setSelectedEntries((prev) => {
      const current = prev[crId] || { count: 0, studentName: '', notes: '' };
      const newCount = Math.max(0, current.count + delta);
      if (newCount === 0 && !current.studentName && !current.notes) {
        const copy = { ...prev };
        delete copy[crId];
        return copy;
      }
      return {
        ...prev,
        [crId]: { ...current, count: newCount },
      };
    });
  };

  const updateField = (crId: string, field: 'studentName' | 'notes', val: string) => {
    setSelectedEntries((prev) => {
      const current = prev[crId] || { count: 1, studentName: '', notes: '' };
      return {
        ...prev,
        [crId]: {
          ...current,
          count: current.count === 0 ? 1 : current.count,
          [field]: val,
        },
      };
    });
  };

  // Tính tổng điểm thay đổi dự kiến
  const activeEntriesList = Object.entries(selectedEntries).filter(
    ([_, val]) => val.count > 0
  );

  const netPointsChange = activeEntriesList.reduce((acc, [crId, val]) => {
    const cr = criteria.find((c) => c.id === crId);
    if (!cr) return acc;
    return acc + cr.points * val.count;
  }, 0);

  const handleSave = () => {
    if (isLocked) {
      alert('Tuần này đã được Tổng phụ trách khóa sổ. Không thể nhập thêm dữ liệu!');
      return;
    }

    if (!selectedClass) {
      alert('Vui lòng chọn lớp được kiểm tra!');
      return;
    }

    if (activeEntriesList.length === 0) {
      alert('Vui lòng chọn ít nhất một tiêu chí vi phạm hoặc biểu dương!');
      return;
    }

    const nowIso = new Date().toISOString();
    const newLogs: ViolationLog[] = activeEntriesList.map(([crId, val], index) => {
      const cr = criteria.find((c) => c.id === crId)!;
      return {
        id: `log-${Date.now()}-${index}`,
        weekNumber: currentWeek,
        dayOfWeek: selectedDay,
        date: new Date().toISOString().split('T')[0],
        classId: selectedClass.id,
        className: selectedClass.name,
        level: selectedClass.level,
        criteriaId: cr.id,
        criteriaName: cr.name,
        category: cr.category,
        points: cr.points,
        count: val.count,
        totalPoints: cr.points * val.count,
        studentName: val.studentName.trim() || undefined,
        notes: val.notes.trim() || undefined,
        inspectorName: inspector.trim() || 'Cờ Đỏ Trực Tuần',
        status: 'approved',
        createdAt: nowIso,
      };
    });

    onSaveLogs(newLogs);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedEntries({});
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
              🚩
            </div>
            <div>
              <h2 className="text-base font-bold">Biên Bản Chấm Chéo Nề Nếp • Tuần {currentWeek}</h2>
              <p className="text-xs text-red-100">
                Dành cho Đội Cờ Đỏ & Ban Chỉ Huy Liên Đội TH&THCS Phước Hiệp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Alert if locked */}
        {isLocked && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Lưu ý:</strong> Sổ thi đua tuần {currentWeek} đã bị KHÓA bởi Tổng phụ trách. Bạn không thể ghi nhận thêm biên bản.
            </span>
          </div>
        )}

        {/* Selection Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Day of Week */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Ngày Trực
              </label>
              <div className="flex rounded-xl bg-white border border-slate-200 p-0.5">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      selectedDay === d
                        ? 'bg-red-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d.replace('Thứ ', 'T')}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Under Inspection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Lớp Được Chấm Chéo (31 Lớp)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <optgroup label="Khối Tiểu Học (14 Lớp)">
                  {classes
                    .filter((c) => c.level === 'tieuhoc')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} - GVCN: {c.homeroomTeacher}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Khối THCS (17 Lớp)">
                  {classes
                    .filter((c) => c.level === 'thcs')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} - GVCN: {c.homeroomTeacher}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Inspector Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Họ Tên Cờ Đỏ Chấm
              </label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                placeholder="VD: Nguyễn Tuấn Kiệt (9A1)"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Assigned Inspector Hint */}
          {selectedClass && (
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>
                Phân công trực chéo: <strong>{selectedClass.assignedInspector}</strong> phụ trách lớp <strong>{selectedClass.name}</strong>
              </span>
              <span className="text-slate-400">Phòng học: {selectedClass.room}</span>
            </div>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.key
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Criteria Checklist */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {filteredCriteria.map((cr) => {
            const entry = selectedEntries[cr.id] || { count: 0, studentName: '', notes: '' };
            const isSelected = entry.count > 0;

            return (
              <div
                key={cr.id}
                className={`pt-3 first:pt-0 transition-colors ${
                  isSelected ? 'bg-amber-50/40 p-3 rounded-xl border border-amber-200' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        {cr.code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{cr.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cr.points < 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {cr.points > 0 ? `+${cr.points}` : cr.points} điểm / {cr.unit}
                      </span>
                    </div>
                    {cr.description && (
                      <p className="text-[11px] text-slate-500 mt-1">{cr.description}</p>
                    )}
                  </div>

                  {/* Counter Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateCount(cr.id, -1)}
                      disabled={entry.count <= 0}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900">
                      {entry.count}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCount(cr.id, 1)}
                      className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-inputs when count > 0 */}
                {isSelected && (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-200/60">
                    <div>
                      <input
                        type="text"
                        placeholder="Họ tên học sinh vi phạm (nếu có)..."
                        value={entry.studentName}
                        onChange={(e) => updateField(cr.id, 'studentName', e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Ghi chú chi tiết (tiết, vị trí, minh chứng)..."
                        value={entry.notes}
                        onChange={(e) => updateField(cr.id, 'notes', e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Summary & Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600">
              Đã chọn: <strong>{activeEntriesList.length} mục</strong>
            </span>
            <span
              className={`font-black text-sm ${
                netPointsChange < 0
                  ? 'text-rose-600'
                  : netPointsChange > 0
                  ? 'text-emerald-600'
                  : 'text-slate-600'
              }`}
            >
              Điểm tác động: {netPointsChange > 0 ? `+${netPointsChange}` : netPointsChange} điểm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={isLocked || activeEntriesList.length === 0}
              onClick={handleSave}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition-all flex items-center gap-1.5 ${
                isSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã Lưu Biên Bản!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu Biên Bản Chấm Chéo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
