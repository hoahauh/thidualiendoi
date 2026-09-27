import React from 'react';
import { Role } from '../types';
import { 
  ShieldAlert, 
  UserCheck, 
  GraduationCap, 
  Eye, 
  Sparkles, 
  Printer, 
  FileSpreadsheet, 
  Calendar,
  Lock,
  Unlock,
  Award,
  KeyRound
} from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onOpenAI: () => void;
  onOpenPrint: () => void;
  onOpenSheets: () => void;
  onOpenNewViolation: () => void;
  onOpenApiKeySettings: () => void;
  hasApiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  selectedWeek,
  onSelectWeek,
  isLocked,
  onToggleLock,
  onOpenAI,
  onOpenPrint,
  onOpenSheets,
  onOpenNewViolation,
  onOpenApiKeySettings,
  hasApiKey = false,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
              <Award className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/30">
                  Liên đội TNTP Hồ Chí Minh
                </span>
                <span className="text-xs text-red-100 hidden sm:inline">• Năm học 2025 - 2026</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                HỆ THỐNG THI ĐUA NỀ NẾP • TRƯỜNG TH&THCS PHƯỚC HIỆP
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Settings (API Key) Button - Always visible with red label as required by AI_INSTRUCTIONS.md */}
            <button
              onClick={onOpenApiKeySettings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 border border-slate-200"
              title="Thiết lập Gemini Model & API Key (Lấy key tại aistudio.google.com/api-keys)"
            >
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Settings (API Key)</span>
              <span className="text-[10px] font-black text-red-600 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded-md animate-pulse">
                Lấy API key để sử dụng app
              </span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95"
              title="Chuyên gia Tư vấn & Kiến trúc sư EdTech (Gemini Fallback Chain)"
            >
              <Sparkles className="w-4 h-4 text-amber-900 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Chuyên Gia AI</span>
            </button>

            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-medium text-xs rounded-xl transition-colors border border-white/20"
              title="In bản tin thi đua chào cờ đầu tuần"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In Báo Cáo Chào Cờ</span>
            </button>

            <button
              onClick={onOpenSheets}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium text-xs rounded-xl transition-colors border border-emerald-400/30"
              title="Cấu hình Google Sheets & Apps Script"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Google Sheets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Navigation & Control Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Role Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onSelectRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'admin'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Tổng Phụ Trách (Admin)</span>
          </button>

          <button
            onClick={() => onSelectRole('codo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'codo'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Đội Cờ Đỏ / Sao Đỏ</span>
          </button>

          <button
            onClick={() => onSelectRole('gvcn')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'gvcn'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Giáo Viên Chủ Nhiệm</span>
          </button>

          <button
            onClick={() => onSelectRole('public')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'public'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bảng Vinh Danh</span>
          </button>
        </div>

        {/* Week Selector & Admin Lock Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Tuần:</span>
            <select
              value={selectedWeek}
              onChange={(e) => onSelectWeek(Number(e.target.value))}
              className="bg-transparent font-bold text-red-600 focus:outline-hidden cursor-pointer"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w}
                </option>
              ))}
            </select>
          </div>

          {currentRole === 'admin' && (
            <button
              onClick={onToggleLock}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                isLocked
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={isLocked ? 'Tuần đã khóa: Cờ đỏ không thể nhập mới' : 'Tuần đang mở: Cho phép chấm chéo'}
            >
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đã Khóa Sổ</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Đang Mở Sổ</span>
                </>
              )}
            </button>
          )}

          {/* Quick Chấm Nhanh button */}
          <button
            onClick={onOpenNewViolation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95"
          >
            <span>+ Chấm Chéo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
