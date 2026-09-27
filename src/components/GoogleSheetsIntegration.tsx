import React, { useState } from 'react';
import { GoogleSheetsConfig, ClassWeekScore, ViolationLog } from '../types';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../data/initialData';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Globe, 
  Zap,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { downloadScoresCSV, downloadLogsCSV } from '../utils/calculator';

interface GoogleSheetsIntegrationProps {
  config: GoogleSheetsConfig;
  onUpdateConfig: (newConfig: GoogleSheetsConfig) => void;
  scores: ClassWeekScore[];
  logs: ViolationLog[];
  selectedWeek: number;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  config,
  onUpdateConfig,
  scores,
  logs,
  selectedWeek,
}) => {
  const [webAppUrl, setWebAppUrl] = useState(config.webAppUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isErrorStatus, setIsErrorStatus] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveConfig = () => {
    onUpdateConfig({
      ...config,
      webAppUrl: webAppUrl.trim(),
    });
    alert('Đã lưu cấu hình Google Apps Script!');
  };

  const handleRealSync = async (isSimulation = false) => {
    setIsSyncing(true);
    setIsErrorStatus(false);
    setSyncStatus('Đang chuẩn bị payload đồng bộ 31 lớp và nhật ký...');

    const timestamp =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ' ' +
      new Date().toLocaleDateString('vi-VN');

    if (isSimulation || !webAppUrl.trim()) {
      setTimeout(() => {
        setIsSyncing(false);
        if (!webAppUrl.trim()) {
          setIsErrorStatus(true);
          setSyncStatus(
            'Chưa có URL Web App! Vui lòng sao chép mã Code.gs bên dưới, dán vào Apps Script của Google Sheet và triển khai lấy URL Web App dán vào ô trên.'
          );
        } else {
          setSyncStatus(
            `[Mô phỏng] Đồng bộ thành công cấu trúc 31 lớp và ${logs.length} biên bản lúc ${timestamp}!`
          );
          onUpdateConfig({
            ...config,
            lastSynced: timestamp,
          });
        }
      }, 800);
      return;
    }

    try {
      const payload = {
        action: 'SYNC_ALL',
        weekNumber: selectedWeek,
        weekScores: scores,
        logs: logs.filter((l) => l.weekNumber === selectedWeek),
        timestamp: new Date().toISOString(),
      };

      setSyncStatus('Đang gửi HTTP POST tới Google Apps Script Web App...');

      // Send as text/plain with no-cors to prevent CORS preflight OPTIONS rejection
      await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      setIsSyncing(false);
      setIsErrorStatus(false);
      setSyncStatus(
        `Đã phát tín hiệu đồng bộ thành công tới Google Apps Script lúc ${timestamp}! Dữ liệu đang được ghi vào các sheet của bạn.`
      );
      onUpdateConfig({
        ...config,
        webAppUrl: webAppUrl.trim(),
        lastSynced: timestamp,
      });
    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      setIsSyncing(false);
      setIsErrorStatus(true);
      setSyncStatus(
        `Lỗi kết nối tới Google Apps Script: ${err.message || 'Không thể gửi dữ liệu'}. Hãy đảm bảo Web App được cấp quyền "Bất kỳ ai (Anyone)".`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  Google Workspace Cloud Integration
                </span>
                <span className="text-xs text-slate-500">• 4 Sheets Chuẩn Hóa</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Đồng Bộ Dữ Liệu Google Sheets & Google Apps Script
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadScoresCSV(scores, selectedWeek)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải Bảng Điểm (.CSV)</span>
            </button>
            <button
              onClick={() => downloadLogsCSV(logs, selectedWeek)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải Log Vi Phạm (.CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Sheets Architecture Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2">
            1
          </div>
          <h4 className="text-xs font-black text-slate-900">Sheet DanhMuc_Lop_TieuChi</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Lưu danh mục 31 lớp học (14 TH, 17 THCS), danh sách GVCN, biểu điểm chuẩn nề nếp và hệ số.
          </p>
          <div className="mt-3 text-[10px] font-mono bg-slate-50 p-2 rounded-md text-slate-600">
            A: Mã lớp | B: Tên lớp | C: Khối | D: GVCN | E: Điểm gốc (100đ)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs mb-2">
            2
          </div>
          <h4 className="text-xs font-black text-slate-900">Sheet NhatKy_NhapLieu</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Ghi nhận từng biên bản do Đội Cờ Đỏ chấm chéo hàng ngày từ Thứ 2 đến Thứ 7 theo thời gian thực.
          </p>
          <div className="mt-3 text-[10px] font-mono bg-slate-50 p-2 rounded-md text-slate-600">
            Timestamp | Tuần | Thứ | Lớp | Tiêu chí | Điểm | Người chấm
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs mb-2">
            3
          </div>
          <h4 className="text-xs font-black text-slate-900">Sheet BangTinh_DiemTuan</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Tự động tổng hợp điểm chuẩn 100đ, trừ điểm 5 nhóm nề nếp, cộng hoa điểm 10 và xếp loại.
          </p>
          <div className="mt-3 text-[10px] font-mono bg-slate-50 p-2 rounded-md text-slate-600">
            =100 - SUMIFS(Log!Điểm, Lớp, Tuần) + SUM(Thưởng)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 font-bold flex items-center justify-center text-xs mb-2">
            4
          </div>
          <h4 className="text-xs font-black text-slate-900">Sheet Dashboard_BaoCao</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Bảng vinh danh, top 3 nhận Cờ Luân Lưu, biểu đồ tỷ lệ vi phạm phục vụ Lễ Chào Cờ đầu tuần.
          </p>
          <div className="mt-3 text-[10px] font-mono bg-slate-50 p-2 rounded-md text-slate-600">
            Cờ Nhất Tiểu học: 1A1 | Cờ Nhất THCS: 9A1
          </div>
        </div>
      </div>

      {/* Sync Webhook Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Kết Nối Webhook Tự Động (Google Apps Script Web App)</h3>
          </div>
          {config.lastSynced && (
            <span className="text-xs text-slate-500">
              Đồng bộ gần nhất: <strong>{config.lastSynced}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Lưu URL
          </button>
          <button
            onClick={() => handleRealSync(false)}
            disabled={isSyncing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang gửi...' : 'Đồng Bộ Lên Sheets'}</span>
          </button>
        </div>

        {syncStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              isErrorStatus
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {isErrorStatus ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Complete Code.gs Source Code Box */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
        <div className="p-4 bg-slate-800/80 flex items-center justify-between text-white border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold font-mono">Code.gs (Google Apps Script API)</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã Sao Chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao Chép Mã Apps Script</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 bg-slate-950 overflow-x-auto max-h-96">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
            {GOOGLE_APPS_SCRIPT_TEMPLATE}
          </pre>
        </div>

        <div className="p-3 bg-slate-900 text-[11px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
          <span>
            💡 <strong>Hướng dẫn triển khai:</strong> Mở Google Sheets &gt; <em>Tiện ích mở rộng</em> &gt; <em>Apps Script</em> &gt; Dán đoạn mã trên &gt; <em>Triển khai dưới dạng Ứng dụng web (Web App)</em> &gt; Cho phép quyền truy cập <em>"Bất kỳ ai (Anyone)"</em>.
          </span>
        </div>
      </div>
    </div>
  );
};
