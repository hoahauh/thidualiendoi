import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ExternalLink, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  EyeOff,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  AVAILABLE_MODELS, 
  getStoredApiKey, 
  setStoredApiKey, 
  getStoredModel, 
  setStoredModel,
  generateAIContent 
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (apiKey: string, selectedModel: string) => void;
  isRequired?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  isRequired = false,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    modelUsed?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed && isRequired) {
      alert('Vui lòng nhập API Key để tiếp tục sử dụng ứng dụng!');
      return;
    }

    setStoredApiKey(trimmed);
    setStoredModel(selectedModel);

    if (onSaved) {
      onSaved(trimmed, selectedModel);
    }

    onClose();
  };

  const handleTestKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập API Key trước khi kiểm tra kết nối.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await generateAIContent({
        prompt: 'Xin chào, hãy phản hồi ngắn gọn: "Kết nối thành công!".',
        apiKey: trimmed,
        preferredModel: selectedModel,
      });

      setTestResult({
        success: true,
        message: `Kết nối thành công! Đã phản hồi qua model: ${res.modelUsed}`,
        modelUsed: res.modelUsed,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Lỗi không xác định khi kết nối với Gemini API.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <KeyRound className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Thiết Lập Model & Gemini API Key
              </h2>
              <p className="text-xs text-amber-100">
                Nhập key cá nhân để sử dụng tính năng Chuyên Gia AI & Tự Động Hóa Báo Cáo
              </p>
            </div>
          </div>

          {!isRequired && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Guide banner with direct link */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Chưa có Google Gemini API Key?</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                Bạn có thể lấy API Key hoàn toàn miễn phí tại Google AI Studio trong vòng 30 giây.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
            >
              <span>Lấy API Key Miễn Phí</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Google Gemini API Key:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Được lưu bảo mật tại trình duyệt của bạn (localStorage)
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán API Key dạng AIzaSy..."
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-20 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showKey ? 'Ẩn key' : 'Hiện key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Model Selection Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-red-600" />
                <span>Chọn Model AI Ưu Tiên:</span>
              </label>
              <span className="text-[11px] text-slate-500 italic">
                *Tự động Fallback sang model kế tiếp khi hết quota
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`cursor-pointer rounded-2xl p-3.5 border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {model.badge}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {model.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center text-[10px] font-medium text-slate-400">
                      <span>ID: {model.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test connection & Status */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-bold">
                  {testResult.success ? 'Kiểm tra thành công!' : 'Kiểm tra thất bại!'}
                </p>
                <p className="text-[11px] font-mono leading-relaxed">
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testing || !apiKey.trim()}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            {testing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
                <span>Đang kiểm tra kết nối...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Kiểm tra kết nối</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {!isRequired && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Hủy
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
