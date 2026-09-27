import React, { useState } from 'react';
import { ClassItem, CriteriaItem, ViolationLog, CriteriaCategory } from '../types';
import { 
  ShieldAlert, 
  MessageSquare, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Lock, 
  Unlock, 
  Layers, 
  Users, 
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminManagerProps {
  classes: ClassItem[];
  criteria: CriteriaItem[];
  logs: ViolationLog[];
  selectedWeek: number;
  isLocked: boolean;
  onToggleLock: () => void;
  onResolveAppeal: (logId: string, approve: boolean, responseNote: string) => void;
  onAddCriteria: (newCriteria: CriteriaItem) => void;
  onDeleteCriteria: (criteriaId: string) => void;
  onUpdateClassInspector: (classId: string, assignedInspector: string) => void;
}

export const AdminManager: React.FC<AdminManagerProps> = ({
  classes,
  criteria,
  logs,
  selectedWeek,
  isLocked,
  onToggleLock,
  onResolveAppeal,
  onAddCriteria,
  onDeleteCriteria,
  onUpdateClassInspector,
}) => {
  const [activeTab, setActiveTab] = useState<'appeals' | 'criteria' | 'classes'>('appeals');

  // Appeals handling
  const pendingAppeals = logs.filter((l) => l.status === 'appealed');
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});

  // Add new criteria form
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<CriteriaCategory>('chuyencan');
  const [newPoints, setNewPoints] = useState<number>(-2);
  const [newUnit, setNewUnit] = useState('lượt');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      alert('Vui lòng nhập mã và tên tiêu chí!');
      return;
    }

    const categoryNames: Record<CriteriaCategory, string> = {
      chuyencan: 'Chuyên cần & Nề nếp',
      dongphuc: 'Trang phục & Tác phong',
      hoctap: 'Học tập & 15 phút',
      vesinh: 'Vệ sinh & Môi trường',
      hoatdong: 'Hoạt động Đội & Phong trào',
    };

    const item: CriteriaItem = {
      id: `cr-custom-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      category: newCategory,
      categoryName: categoryNames[newCategory],
      name: newName.trim(),
      points: Number(newPoints),
      unit: newUnit.trim() || 'lượt',
      description: newDesc.trim() || undefined,
      isReward: Number(newPoints) > 0,
    };

    onAddCriteria(item);
    setShowAddCriteria(false);
    setNewName('');
    setNewCode('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Control Banner for Admin */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-red-700 bg-red-100/60 px-2 py-0.5 rounded-full">
                  Phân Quyền Tổng Phụ Trách (Admin)
                </span>
                <span className="text-xs text-slate-500">• Tuần {selectedWeek}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Quản Trị Hệ Thống & Xét Duyệt Thi Đua
              </h2>
            </div>
          </div>

          {/* Quick Lock/Unlock Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleLock}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isLocked
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sổ Đang Khóa (Bấm để Mở)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Sổ Đang Mở (Bấm để Khóa Sổ Tuần)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('appeals')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'appeals'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Xử Lý Giải Trình / Khiếu Nại</span>
            {pendingAppeals.length > 0 && (
              <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {pendingAppeals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('criteria')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'criteria'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Biểu Điểm & Tiêu Chí ({criteria.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'classes'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Phân Công 31 Lớp Học</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Appeals */}
      {activeTab === 'appeals' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Danh Sách Khiếu Nại Cần Tổng Phụ Trách Phê Duyệt ({pendingAppeals.length})
              </h3>
              <p className="text-xs text-slate-500">
                Xem xét minh chứng do Giáo viên chủ nhiệm giải trình để quyết định hoàn điểm hoặc giữ nguyên điểm trừ.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingAppeals.map((log) => {
              const currentNote = responseNotes[log.id] || '';

              return (
                <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                          Lớp {log.className} ({log.level === 'tieuhoc' ? 'Tiểu học' : 'THCS'})
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {log.dayOfWeek} ({log.date})
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{log.criteriaName}</h4>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          {log.totalPoints} điểm
                        </span>
                      </div>

                      {log.studentName && (
                        <p className="text-xs text-slate-600">
                          <strong>Học sinh bị ghi nhận:</strong> {log.studentName} (Cờ đỏ ghi: {log.inspectorName})
                        </p>
                      )}

                      {/* GVCN's explanation */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950">
                        <span className="font-bold block text-amber-900">
                          Ý kiến giải trình của Giáo viên chủ nhiệm:
                        </span>
                        <p className="mt-1">{log.appealReason}</p>
                      </div>

                      {/* TPT's response input */}
                      <div className="pt-1">
                        <input
                          type="text"
                          value={currentNote}
                          onChange={(e) =>
                            setResponseNotes((prev) => ({ ...prev, [log.id]: e.target.value }))
                          }
                          placeholder="Nhập lý do phản hồi (VD: Đã xác minh có đơn phép, đồng ý hủy trừ điểm)..."
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-hidden focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          onResolveAppeal(log.id, false, currentNote || 'Giữ nguyên điểm trừ sau khi kiểm tra lại biên bản cờ đỏ.')
                        }
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <X className="w-4 h-4 text-rose-600" />
                        <span>Bác Bỏ (Giữ Trừ)</span>
                      </button>

                      <button
                        onClick={() =>
                          onResolveAppeal(log.id, true, currentNote || 'Đã duyệt giải trình của GVCN. Hủy biên bản trừ điểm.')
                        }
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Chấp Thuận (Hoàn Điểm)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {pendingAppeals.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-600">
                  Hiện không có khiếu nại nào đang chờ xử lý!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tất cả các biên bản vi phạm của 31 lớp đang ở trạng thái thống nhất.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Criteria Manager */}
      {activeTab === 'criteria' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Biểu Điểm Thi Đua Liên Đội ({criteria.length} Tiêu chí)
              </h3>
              <p className="text-xs text-slate-500">
                Chuẩn hóa các khung điểm cộng / điểm trừ cho 5 nhóm nề nếp học đường.
              </p>
            </div>
            <button
              onClick={() => setShowAddCriteria(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Tiêu Chí Mới</span>
            </button>
          </div>

          {/* Add Criteria Form */}
          {showAddCriteria && (
            <form onSubmit={handleCreateCriteria} className="p-4 bg-amber-50/50 border-b border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900">Cấu hình tiêu chí thi đua mới</h4>
                <button
                  type="button"
                  onClick={() => setShowAddCriteria(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mã tiêu chí</label>
                  <input
                    type="text"
                    placeholder="VD: CC06"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên tiêu chí</label>
                  <input
                    type="text"
                    placeholder="VD: Không tham gia chào cờ"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nhóm nề nếp</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CriteriaCategory)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  >
                    <option value="chuyencan">Chuyên cần & Nề nếp</option>
                    <option value="dongphuc">Trang phục & Tác phong</option>
                    <option value="hoctap">Học tập & 15 phút</option>
                    <option value="vesinh">Vệ sinh & Môi trường</option>
                    <option value="hoatdong">Hoạt động Đội & Phong trào</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Điểm (Âm = Trừ, Dương = Cộng)
                  </label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="lượt / học sinh / buổi"
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mô tả / Hướng dẫn ghi nhận</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Quy định cụ thể để cờ đỏ chấm chính xác..."
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCriteria(false)}
                  className="px-3 py-1.5 text-xs text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-red-700"
                >
                  Lưu Tiêu Chí
                </button>
              </div>
            </form>
          )}

          {/* Criteria Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Mã</th>
                  <th className="py-2.5 px-3">Tên Tiêu Chí</th>
                  <th className="py-2.5 px-3">Nhóm</th>
                  <th className="py-2.5 px-3 text-center">Định Mức Điểm</th>
                  <th className="py-2.5 px-3">Đơn Vị</th>
                  <th className="py-2.5 px-3">Mô Tả Quy Định</th>
                  <th className="py-2.5 px-3 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criteria.map((cr) => (
                  <tr key={cr.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-700">{cr.code}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{cr.name}</td>
                    <td className="py-2 px-3 text-slate-600">{cr.categoryName}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-black text-xs ${
                          cr.points < 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {cr.points > 0 ? `+${cr.points}` : cr.points} đ
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500">{cr.unit}</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{cr.description || '—'}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa tiêu chí "${cr.name}"?`)) {
                            onDeleteCriteria(cr.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Xóa tiêu chí"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Classes Configuration */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Danh Sách 31 Lớp Học & Phân Công Chấm Chéo Cờ Đỏ
              </h3>
              <p className="text-xs text-slate-500">
                Trường TH&THCS Phước Hiệp: 14 lớp Tiểu học (Khối 1-5) và 17 lớp THCS (Khối 6-9).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Tên Lớp</th>
                  <th className="py-2.5 px-3">Khối Cấp</th>
                  <th className="py-2.5 px-3">Giáo Viên Chủ Nhiệm</th>
                  <th className="py-2.5 px-3 text-center">Sĩ Số</th>
                  <th className="py-2.5 px-3">Phòng Học</th>
                  <th className="py-2.5 px-3">Đội Cờ Đỏ Phụ Trách Chấm Chéo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((cls, idx) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-black text-slate-900">{cls.name}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          cls.level === 'tieuhoc'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {cls.level === 'tieuhoc' ? 'Tiểu học' : 'THCS'}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-700">{cls.homeroomTeacher}</td>
                    <td className="py-2 px-3 text-center font-bold text-slate-600">{cls.studentCount} HS</td>
                    <td className="py-2 px-3 text-slate-500">{cls.room}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={cls.assignedInspector}
                        onChange={(e) => onUpdateClassInspector(cls.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 w-full max-w-xs focus:bg-white focus:border-red-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
