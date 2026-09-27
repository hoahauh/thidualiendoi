/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Role, ClassItem, CriteriaItem, ViolationLog, GoogleSheetsConfig } from './types';
import { 
  INITIAL_CLASSES, 
  INITIAL_CRITERIA, 
  INITIAL_LOGS, 
  INITIAL_GOOGLE_SHEETS_CONFIG 
} from './data/initialData';
import { calculateScoresForWeek, downloadScoresCSV } from './utils/calculator';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { CoDoEntryModal } from './components/CoDoEntryModal';
import { GVCNPortal } from './components/GVCNPortal';
import { AdminManager } from './components/AdminManager';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { PrintReportModal } from './components/PrintReportModal';
import { AIConsultantModal } from './components/AIConsultantModal';
import { ClassDetailModal } from './components/ClassDetailModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getStoredApiKey } from './services/geminiService';
import { 
  Trophy, 
  FileSpreadsheet, 
  Settings, 
  ShieldAlert, 
  UserCheck, 
  PlusCircle, 
  Sparkles,
  HelpCircle,
  Award,
  KeyRound
} from 'lucide-react';

export default function App() {
  // Local storage states for persistence across reloads
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem('phuoc_hiep_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [criteria, setCriteria] = useState<CriteriaItem[]>(() => {
    const saved = localStorage.getItem('phuoc_hiep_criteria');
    return saved ? JSON.parse(saved) : INITIAL_CRITERIA;
  });

  const [logs, setLogs] = useState<ViolationLog[]>(() => {
    const saved = localStorage.getItem('phuoc_hiep_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = localStorage.getItem('phuoc_hiep_sheets_config');
    return saved ? JSON.parse(saved) : INITIAL_GOOGLE_SHEETS_CONFIG;
  });

  // Current session parameters
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [selectedWeek, setSelectedWeek] = useState<number>(24);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Active admin sub-tab if in admin role
  const [adminView, setAdminView] = useState<'dashboard' | 'manager' | 'sheets'>('dashboard');

  // Modals
  const [isNewViolationOpen, setIsNewViolationOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedDetailClassId, setSelectedDetailClassId] = useState<string | null>(null);

  // Key tracking & mandatory initial modal if no key is stored
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!getStoredApiKey());
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(() => !getStoredApiKey());

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('phuoc_hiep_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('phuoc_hiep_criteria', JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem('phuoc_hiep_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('phuoc_hiep_sheets_config', JSON.stringify(sheetsConfig));
  }, [sheetsConfig]);

  // Recalculate scores for selected week whenever classes or logs change
  const currentScores = useMemo(() => {
    return calculateScoresForWeek(classes, logs, selectedWeek);
  }, [classes, logs, selectedWeek]);

  // Detail Modal data
  const detailClassItem = classes.find((c) => c.id === selectedDetailClassId);
  const detailScoreItem = currentScores.find((s) => s.classId === selectedDetailClassId);

  // Handlers
  const handleSaveLogs = (newLogs: ViolationLog[]) => {
    setLogs((prev) => [...newLogs, ...prev]);
  };

  const handleAppealLog = (logId: string, reason: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: 'appealed', appealReason: reason } : l))
    );
  };

  const handleResolveAppeal = (logId: string, approve: boolean, responseNote: string) => {
    setLogs((prev) =>
      prev.map((l) => {
        if (l.id !== logId) return l;
        return {
          ...l,
          status: approve ? 'rejected' : 'approved', // If approved appeal -> reject penalty (points restored)
          appealResponse: responseNote,
        };
      })
    );
  };

  const handleAddCriteria = (newCr: CriteriaItem) => {
    setCriteria((prev) => [newCr, ...prev]);
  };

  const handleDeleteCriteria = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateClassInspector = (classId: string, inspector: string) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, assignedInspector: inspector } : c))
    );
  };

  const handleExportCSV = () => {
    downloadScoresCSV(currentScores, selectedWeek);
  };

  const handleTriggerAI = () => {
    if (!hasApiKey) {
      setIsApiKeyOpen(true);
    } else {
      setIsAIOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={(r) => {
          setCurrentRole(r);
          if (r !== 'admin') setAdminView('dashboard');
        }}
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        onOpenAI={handleTriggerAI}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenSheets={() => setAdminView('sheets')}
        onOpenNewViolation={() => setIsNewViolationOpen(true)}
        onOpenApiKeySettings={() => setIsApiKeyOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Role Helper Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-700">Đang truy cập với vai trò:</span>
            <span className="font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-200">
              {currentRole === 'admin' && 'Thầy/Cô Tổng Phụ Trách Đội (Toàn Quyền Quản Trị)'}
              {currentRole === 'codo' && 'Đội Cờ Đỏ / Sao Đỏ Trực Tuần (Nhập Điểm Chấm Chéo)'}
              {currentRole === 'gvcn' && 'Giáo Viên Chủ Nhiệm (Theo Dõi Điểm & Khiếu Nại)'}
              {currentRole === 'public' && 'Bảng Vinh Danh Nề Nếp Học Đường'}
            </span>
          </div>

          {currentRole === 'admin' && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setAdminView('dashboard')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                  adminView === 'dashboard'
                    ? 'bg-white text-red-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảng Điểm 31 Lớp
              </button>
              <button
                onClick={() => setAdminView('manager')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                  adminView === 'manager'
                    ? 'bg-white text-red-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quản Trị & Duyệt Khiếu Nại
              </button>
              <button
                onClick={() => setAdminView('sheets')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                  adminView === 'sheets'
                    ? 'bg-white text-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Sheets API
              </button>
            </div>
          )}
        </div>

        {/* View Switcher based on currentRole and adminView */}
        {currentRole === 'admin' && adminView === 'dashboard' && (
          <DashboardOverview
            scores={currentScores}
            selectedWeek={selectedWeek}
            onSelectClassDetails={(id) => setSelectedDetailClassId(id)}
            onExportCSV={handleExportCSV}
            onOpenPrint={() => setIsPrintOpen(true)}
          />
        )}

        {currentRole === 'admin' && adminView === 'manager' && (
          <AdminManager
            classes={classes}
            criteria={criteria}
            logs={logs}
            selectedWeek={selectedWeek}
            isLocked={isLocked}
            onToggleLock={() => setIsLocked(!isLocked)}
            onResolveAppeal={handleResolveAppeal}
            onAddCriteria={handleAddCriteria}
            onDeleteCriteria={handleDeleteCriteria}
            onUpdateClassInspector={handleUpdateClassInspector}
          />
        )}

        {currentRole === 'admin' && adminView === 'sheets' && (
          <GoogleSheetsIntegration
            config={sheetsConfig}
            onUpdateConfig={setSheetsConfig}
            scores={currentScores}
            logs={logs}
            selectedWeek={selectedWeek}
          />
        )}

        {currentRole === 'codo' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-red-600 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                  Khu Vực Đội Cờ Đỏ
                </span>
                <h2 className="text-2xl font-black mt-2">Chấm Chéo Nề Nếp Các Lớp • Tuần {selectedWeek}</h2>
                <p className="text-xs text-amber-100 mt-1 max-w-xl">
                  Ghi nhận khách quan, chính xác các lỗi vi phạm và hoa điểm tốt theo phân công trực chéo. Mỗi biên bản sẽ được chuyển thẳng đến GVCN và Tổng phụ trách.
                </p>
              </div>

              <button
                onClick={() => setIsNewViolationOpen(true)}
                disabled={isLocked}
                className="px-6 py-3 bg-white hover:bg-amber-50 text-red-700 font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-5 h-5 text-red-600" />
                <span>+ Lập Biên Bản Chấm Chéo</span>
              </button>
            </div>

            <DashboardOverview
              scores={currentScores}
              selectedWeek={selectedWeek}
              onSelectClassDetails={(id) => setSelectedDetailClassId(id)}
              onExportCSV={handleExportCSV}
              onOpenPrint={() => setIsPrintOpen(true)}
            />
          </div>
        )}

        {currentRole === 'gvcn' && (
          <GVCNPortal
            classes={classes}
            logs={logs}
            scores={currentScores}
            selectedWeek={selectedWeek}
            onAppealLog={handleAppealLog}
          />
        )}

        {currentRole === 'public' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white p-6 rounded-2xl shadow-md text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                <Award className="w-4 h-4 text-amber-300" />
                <span>Bảng Vinh Danh Nề Nếp & Thi Đua Toàn Trường</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                KẾT QUẢ THI ĐUA LIÊN ĐỘI TUẦN {selectedWeek}
              </h2>
              <p className="text-xs text-emerald-100 max-w-lg mx-auto">
                Trường TH&THCS Phước Hiệp • 31 Lớp học (14 Khối Tiểu học & 17 Khối THCS)
              </p>
            </div>

            <DashboardOverview
              scores={currentScores}
              selectedWeek={selectedWeek}
              onSelectClassDetails={(id) => setSelectedDetailClassId(id)}
              onExportCSV={handleExportCSV}
              onOpenPrint={() => setIsPrintOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="font-bold text-slate-700">
              Liên đội Thiếu niên Tiền phong Hồ Chí Minh • Trường TH&THCS Phước Hiệp
            </p>
            <p className="text-[11px] text-slate-400">
              Hệ thống Quản lý Thi đua & Chấm chéo Nề nếp (31 Lớp học) • Tích hợp Google Workspace & Sheets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApiKeyOpen(true)}
              className="text-slate-600 hover:text-slate-800 font-bold flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Cài Đặt API Key</span>
            </button>
            <span>•</span>
            <button
              onClick={handleTriggerAI}
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chuyên Gia AI EdTech</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPrintOpen(true)}
              className="text-slate-600 hover:text-slate-800 font-medium"
            >
              Mẫu Chào Cờ Đầu Tuần
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CoDoEntryModal
        isOpen={isNewViolationOpen}
        onClose={() => setIsNewViolationOpen(false)}
        classes={classes}
        criteria={criteria}
        currentWeek={selectedWeek}
        isLocked={isLocked}
        onSaveLogs={handleSaveLogs}
      />

      <PrintReportModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        scores={currentScores}
        selectedWeek={selectedWeek}
      />

      <AIConsultantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        classes={classes}
        logs={logs}
        selectedWeek={selectedWeek}
        onOpenSettings={() => {
          setIsAIOpen(false);
          setIsApiKeyOpen(true);
        }}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => {
          if (!hasApiKey) {
            alert('Vui lòng nhập API key để sử dụng ứng dụng!');
            return;
          }
          setIsApiKeyOpen(false);
        }}
        onSaved={(key) => {
          setHasApiKey(!!key);
          setIsApiKeyOpen(false);
        }}
        isRequired={!hasApiKey}
      />

      <ClassDetailModal
        isOpen={!!selectedDetailClassId}
        onClose={() => setSelectedDetailClassId(null)}
        classItem={detailClassItem}
        score={detailScoreItem}
        logs={logs}
        selectedWeek={selectedWeek}
      />
    </div>
  );
}
