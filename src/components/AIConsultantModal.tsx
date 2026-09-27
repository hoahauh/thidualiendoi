import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Copy, 
  Check, 
  Lightbulb,
  KeyRound,
  AlertTriangle,
  AlertCircle,
  Cpu,
  CheckCircle2,
  Play,
  Layers,
  MessageSquare
} from 'lucide-react';
import { ClassItem, ViolationLog } from '../types';
import { 
  generateAIContent, 
  getStoredApiKey, 
  getStoredModel,
  AVAILABLE_MODELS,
  FALLBACK_CHAIN
} from '../services/geminiService';

interface AIConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  logs: ViolationLog[];
  selectedWeek: number;
  onOpenSettings: () => void;
}

type StepStatus = 'idle' | 'running' | 'completed' | 'error';

interface StepState {
  status: StepStatus;
  result: string;
  modelUsed?: string;
  error?: string;
}

export const AIConsultantModal: React.FC<AIConsultantModalProps> = ({
  isOpen,
  onClose,
  classes,
  logs,
  selectedWeek,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'3steps' | 'chat'>('3steps');

  // 3-step pipeline state
  const [step1, setStep1] = useState<StepState>({ status: 'idle', result: '' });
  const [step2, setStep2] = useState<StepState>({ status: 'idle', result: '' });
  const [step3, setStep3] = useState<StepState>({ status: 'idle', result: '' });
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [currentStepAttemptInfo, setCurrentStepAttemptInfo] = useState<string>('');

  // Interactive chat state
  const [inputPrompt, setInputPrompt] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const activeModelId = getStoredModel();
  const activeModelObj = AVAILABLE_MODELS.find((m) => m.id === activeModelId) || AVAILABLE_MODELS[0];

  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; isError?: boolean; modelUsed?: string }>>([
    {
      role: 'assistant',
      content: `Xin chào Thầy/Cô Tổng phụ trách và Ban Giám hiệu Trường TH&THCS Phước Hiệp!

Tôi là **Chuyên gia Phân tích Hệ thống & Kiến trúc sư EdTech**, sẵn sàng tư vấn toàn diện về:
1. Kiến trúc dữ liệu 31 lớp học (14 Tiểu học, 17 THCS).
2. Tự động hóa quy trình chấm chéo Đội cờ đỏ và đồng bộ Google Sheets.
3. Tối ưu hóa thuật toán cộng/trừ điểm và xuất báo cáo Chào cờ đầu tuần.

Mời Thầy/Cô chuyển sang tab "Quy trình 3 Bước" để phân tích tự động hoặc trao đổi trực tiếp tại đây!`,
    },
  ]);

  // Context summary for TH&THCS Phước Hiệp
  const contextSummary = `Trường TH&THCS Phước Hiệp: Tổng số 31 lớp (Khối 1: 3 lớp, Khối 2: 3 lớp, Khối 3: 3 lớp, Khối 4: 3 lớp, Khối 5: 2 lớp; Khối 6: 4 lớp, Khối 7: 4 lớp, Khối 8: 4 lớp, Khối 9: 5 lớp). Tuần hiện tại: Tuần ${selectedWeek}. Số biên bản vi phạm đã ghi nhận: ${logs.length}. Điểm xuất phát chuẩn: 100 điểm/tuần.`;

  // Calculate overall progress for 3-step pipeline
  const calculateProgress = (): number => {
    let count = 0;
    if (step1.status === 'completed') count++;
    if (step2.status === 'completed') count++;
    if (step3.status === 'completed') count++;
    return Math.round((count / 3) * 100);
  };

  const isPipelineComplete = step1.status === 'completed' && step2.status === 'completed' && step3.status === 'completed';
  const hasPipelineFailed = step1.status === 'error' || step2.status === 'error' || step3.status === 'error';

  // Helper to execute a single step with fallback chain & auto-retry according to AI_INSTRUCTIONS.md
  const executeStep = async (
    stepIndex: 1 | 2 | 3,
    stepTitle: string,
    prompt: string
  ): Promise<{ text: string; modelUsed: string }> => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      throw new Error('MISSING_API_KEY: Vui lòng nhập Gemini API Key của bạn để sử dụng tính năng này.');
    }

    const selected = getStoredModel();
    const modelChain = [selected, ...FALLBACK_CHAIN.filter((m) => m !== selected)];
    const errors: string[] = [];

    for (let i = 0; i < modelChain.length; i++) {
      const model = modelChain[i];
      setCurrentStepAttemptInfo(`Đang thực hiện Bước ${stepIndex} với model: ${model} (Lần thử ${i + 1}/${modelChain.length})`);

      try {
        const res = await generateAIContent({
          prompt,
          context: contextSummary,
          preferredModel: model,
        });
        return { text: res.text, modelUsed: res.modelUsed };
      } catch (err: any) {
        console.warn(`[Step ${stepIndex}] Model ${model} thất bại. Tự động thử model tiếp theo...`, err);
        errors.push(`[${model}] ${err.message || 'Lỗi API'}`);
      }
    }

    throw new Error(`${errors.join(' | ')}`);
  };

  // Run the 3-step pipeline
  const handleRun3Steps = async () => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      onOpenSettings();
      return;
    }

    setPipelineRunning(true);
    setPipelineError(null);

    // ==========================================
    // STEP 1: Phân tích yêu cầu & dữ liệu nề nếp
    // ==========================================
    let step1ResultText = step1.result;
    if (step1.status !== 'completed') {
      setStep1({ status: 'running', result: '' });
      try {
        const step1Prompt = `BƯỚC 1: Hãy đóng vai Chuyên gia EdTech, phân tích chuyên sâu dữ liệu thi đua Tuần ${selectedWeek} của 31 lớp Trường TH&THCS Phước Hiệp (14 Tiểu học, 17 THCS). Nhận diện các lỗi vi phạm phổ biến (Chuyên cần, Trang phục, Học tập, Vệ sinh, Hoạt động Đội), đánh giá sự công tâm của Đội cờ đỏ và xếp loại thi đua sơ bộ.`;
        const res1 = await executeStep(1, 'Phân Tích Yêu Cầu & Nề Nếp', step1Prompt);
        step1ResultText = res1.text;
        setStep1({ status: 'completed', result: res1.text, modelUsed: res1.modelUsed });
      } catch (err: any) {
        const errMsg = err.message || '429 RESOURCE_EXHAUSTED';
        setStep1({ status: 'error', result: '', error: errMsg });
        // Set pending columns to "Đã dừng do lỗi" as requested in AI_INSTRUCTIONS.md
        setStep2({ status: 'error', result: '', error: 'Đã dừng do Bước 1 gặp lỗi' });
        setStep3({ status: 'error', result: '', error: 'Đã dừng do Bước 1 gặp lỗi' });
        setPipelineError(`429 RESOURCE_EXHAUSTED: ${errMsg}`);
        setPipelineRunning(false);
        return;
      }
    }

    // ==========================================
    // STEP 2: Giải pháp kỹ thuật & Cấu trúc Google Sheets
    // ==========================================
    let step2ResultText = step2.result;
    if (step2.status !== 'completed') {
      setStep2({ status: 'running', result: '' });
      try {
        const step2Prompt = `BƯỚC 2: Dựa trên kết quả phân tích Bước 1:\n"${step1ResultText.slice(0, 300)}..."\nHãy thiết kế giải pháp kỹ thuật cụ thể: Cấu trúc 4 sheet chuẩn Google Sheets (DanhMuc_Lop_TieuChi, NhatKy_NhapLieu, BangTinh_DiemTuan, Dashboard_BaoCao), công thức tính điểm chuẩn 100đ, code Webhook Google Apps Script để nhận dữ liệu chấm chéo real-time.`;
        const res2 = await executeStep(2, 'Giải Pháp Kỹ Thuật & Google Sheets', step2Prompt);
        step2ResultText = res2.text;
        setStep2({ status: 'completed', result: res2.text, modelUsed: res2.modelUsed });
      } catch (err: any) {
        const errMsg = err.message || '429 RESOURCE_EXHAUSTED';
        // Keep Step 1 completed, only mark Step 2 and pending Step 3 as error!
        setStep2({ status: 'error', result: '', error: errMsg });
        setStep3({ status: 'error', result: '', error: 'Đã dừng do Bước 2 gặp lỗi' });
        setPipelineError(`429 RESOURCE_EXHAUSTED: ${errMsg}`);
        setPipelineRunning(false);
        return;
      }
    }

    // ==========================================
    // STEP 3: Thiết kế UI, Báo Cáo Chào Cờ & Lưu Ý Nghiệp Vụ
    // ==========================================
    if (step3.status !== 'completed') {
      setStep3({ status: 'running', result: '' });
      try {
        const step3Prompt = `BƯỚC 3: Dựa trên giải pháp kỹ thuật Bước 2, hãy hoàn thiện:
1. Thiết kế Giao diện (UI) bảng vinh danh và form chấm chéo mobile.
2. Bài diễn văn nhận xét nề nếp chào cờ sáng Thứ Hai cho Thầy Tổng phụ trách (tuyên dương Cờ Nhất, nhắc nhở tồn tại).
3. Lưu ý nghiệp vụ và mẹo quản trị chống gian lận điểm giữa các lớp.
4. Kế hoạch hành động tuần tiếp theo.`;
        const res3 = await executeStep(3, 'Báo Cáo Chào Cờ & Nghiệp Vụ', step3Prompt);
        setStep3({ status: 'completed', result: res3.text, modelUsed: res3.modelUsed });
      } catch (err: any) {
        const errMsg = err.message || '429 RESOURCE_EXHAUSTED';
        setStep3({ status: 'error', result: '', error: errMsg });
        setPipelineError(`429 RESOURCE_EXHAUSTED: ${errMsg}`);
        setPipelineRunning(false);
        return;
      }
    }

    setPipelineRunning(false);
    setCurrentStepAttemptInfo('');
  };

  // Reset pipeline
  const handleResetPipeline = () => {
    setStep1({ status: 'idle', result: '' });
    setStep2({ status: 'idle', result: '' });
    setStep3({ status: 'idle', result: '' });
    setPipelineError(null);
    setCurrentStepAttemptInfo('');
  };

  // Handle single chat query
  const handleSendChat = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || chatLoading) return;

    const apiKey = getStoredApiKey();
    if (!apiKey) {
      onOpenSettings();
      return;
    }

    const userMsg = { role: 'user' as const, content: query };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setChatLoading(true);

    try {
      const res = await generateAIContent({
        prompt: query,
        context: contextSummary,
        preferredModel: activeModelId,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.text,
          modelUsed: res.modelUsed,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ĐÃ DỪNG DO LỖI: ${err.message || '429 RESOURCE_EXHAUSTED'}\n\nVui lòng kiểm tra lại API key hoặc đổi model dự phòng trong Settings.`,
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const progressPercent = calculateProgress();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                Chuyên Gia Tư Vấn & Kiến Trúc Sư EdTech
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">
                  {activeModelObj.name}
                </span>
              </h2>
              <p className="text-xs text-amber-100">
                Hệ thống phân tích 3 bước tự động hóa & Fallback Chain chuẩn AI_INSTRUCTIONS.md
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
              title="Cài đặt API Key & Chọn Model"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Cài Đặt Key</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Progress Bar Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('3steps')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === '3steps'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Quy Trình 3 Bước Tự Động (AI Instructions)</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'chat'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hỏi Đáp Trực Tiếp</span>
            </button>
          </div>

          {activeTab === '3steps' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRun3Steps}
                disabled={pipelineRunning || isPipelineComplete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                {pipelineRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Xử Lý...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{hasPipelineFailed ? 'Thử Lại Bước Lỗi' : 'Chạy Phân Tích 3 Bước'}</span>
                  </>
                )}
              </button>

              {(step1.status !== 'idle' || hasPipelineFailed) && (
                <button
                  onClick={handleResetPipeline}
                  disabled={pipelineRunning}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Làm Mới
                </button>
              )}
            </div>
          )}
        </div>

        {/* TAB 1: 3-STEP PIPELINE VIEW */}
        {activeTab === '3steps' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-100/50">
            {/* Progress Bar Component */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Tiến Trình Xử Lý:</span>
                  <strong className={isPipelineComplete ? 'text-emerald-600' : hasPipelineFailed ? 'text-rose-600' : 'text-amber-600'}>
                    {progressPercent}%
                  </strong>
                </span>

                <span className="font-bold text-xs">
                  {isPipelineComplete && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Hoàn tất thành công toàn bộ 3 bước!</span>
                    </span>
                  )}
                  {hasPipelineFailed && (
                    <span className="text-rose-600 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Đã dừng do lỗi</span>
                    </span>
                  )}
                  {pipelineRunning && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang thực hiện tự động...</span>
                    </span>
                  )}
                  {!pipelineRunning && !isPipelineComplete && !hasPipelineFailed && (
                    <span className="text-slate-400">Sẵn sàng phân tích</span>
                  )}
                </span>
              </div>

              {/* Real Progress Bar: Turns green ONLY when successfully complete */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 transition-all duration-500 rounded-full ${
                    isPipelineComplete
                      ? 'bg-emerald-500'
                      : hasPipelineFailed
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {currentStepAttemptInfo && (
                <p className="text-[11px] text-amber-700 font-mono bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {currentStepAttemptInfo}
                </p>
              )}

              {/* Raw Error banner in Red */}
              {pipelineError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Lỗi API: {pipelineError}</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed font-mono">
                    Hệ thống đã tự động thử các model trong danh sách fallback nhưng đều gặp lỗi quota hoặc kết nối. Các bước còn lại đã được chuyển sang trạng thái <strong>"Đã dừng do lỗi"</strong>. Vui lòng bấm nút <strong>Settings (API Key)</strong> để đổi key khác.
                  </p>
                </div>
              )}
            </div>

            {/* 3 Step Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Step 1 */}
              <div
                className={`bg-white rounded-2xl border flex flex-col p-4 shadow-2xs transition-all ${
                  step1.status === 'completed'
                    ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                    : step1.status === 'error'
                    ? 'border-rose-300 bg-rose-50/20'
                    : step1.status === 'running'
                    ? 'border-amber-400 ring-1 ring-amber-400/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1">
                    <span>1. Phân Tích Dữ Liệu</span>
                  </span>
                  {step1.status === 'completed' && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Hoàn tất
                    </span>
                  )}
                  {step1.status === 'running' && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Đang chạy
                    </span>
                  )}
                  {step1.status === 'error' && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Đã dừng do lỗi
                    </span>
                  )}
                  {step1.status === 'idle' && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      Chờ xử lý
                    </span>
                  )}
                </div>

                <div className="flex-1 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-80">
                  {step1.result ? (
                    <div className="whitespace-pre-wrap font-sans space-y-1">{step1.result}</div>
                  ) : step1.status === 'running' ? (
                    <div className="flex items-center gap-2 text-slate-400 italic py-8 justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Đang phân tích 31 lớp học...</span>
                    </div>
                  ) : step1.status === 'error' ? (
                    <p className="text-rose-600 font-mono text-[11px] p-2 bg-rose-50 rounded-lg">
                      {step1.error || '429 RESOURCE_EXHAUSTED'}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic text-center py-8">
                      Bấm "Chạy Phân Tích 3 Bước" để bắt đầu xử lý Step 1.
                    </p>
                  )}
                </div>

                {step1.modelUsed && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    Model: {step1.modelUsed}
                  </div>
                )}
              </div>

              {/* Card 2: Step 2 */}
              <div
                className={`bg-white rounded-2xl border flex flex-col p-4 shadow-2xs transition-all ${
                  step2.status === 'completed'
                    ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                    : step2.status === 'error'
                    ? 'border-rose-300 bg-rose-50/20'
                    : step2.status === 'running'
                    ? 'border-amber-400 ring-1 ring-amber-400/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1">
                    <span>2. Giải Pháp Kỹ Thuật</span>
                  </span>
                  {step2.status === 'completed' && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Hoàn tất
                    </span>
                  )}
                  {step2.status === 'running' && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Đang chạy
                    </span>
                  )}
                  {step2.status === 'error' && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Đã dừng do lỗi
                    </span>
                  )}
                  {step2.status === 'idle' && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      Chờ xử lý
                    </span>
                  )}
                </div>

                <div className="flex-1 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-80">
                  {step2.result ? (
                    <div className="whitespace-pre-wrap font-sans space-y-1">{step2.result}</div>
                  ) : step2.status === 'running' ? (
                    <div className="flex items-center gap-2 text-slate-400 italic py-8 justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Đang tạo cấu trúc Sheets & Webhook...</span>
                    </div>
                  ) : step2.status === 'error' ? (
                    <p className="text-rose-600 font-mono text-[11px] p-2 bg-rose-50 rounded-lg">
                      {step2.error || 'Đã dừng do lỗi ở bước trước'}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic text-center py-8">
                      Sẽ tự động kích hoạt sau khi Bước 1 hoàn thành.
                    </p>
                  )}
                </div>

                {step2.modelUsed && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    Model: {step2.modelUsed}
                  </div>
                )}
              </div>

              {/* Card 3: Step 3 */}
              <div
                className={`bg-white rounded-2xl border flex flex-col p-4 shadow-2xs transition-all ${
                  step3.status === 'completed'
                    ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                    : step3.status === 'error'
                    ? 'border-rose-300 bg-rose-50/20'
                    : step3.status === 'running'
                    ? 'border-amber-400 ring-1 ring-amber-400/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1">
                    <span>3. Báo Cáo Chào Cờ</span>
                  </span>
                  {step3.status === 'completed' && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Hoàn tất
                    </span>
                  )}
                  {step3.status === 'running' && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Đang chạy
                    </span>
                  )}
                  {step3.status === 'error' && (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Đã dừng do lỗi
                    </span>
                  )}
                  {step3.status === 'idle' && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      Chờ xử lý
                    </span>
                  )}
                </div>

                <div className="flex-1 text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-80">
                  {step3.result ? (
                    <div className="whitespace-pre-wrap font-sans space-y-1">{step3.result}</div>
                  ) : step3.status === 'running' ? (
                    <div className="flex items-center gap-2 text-slate-400 italic py-8 justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Đang soạn thảo báo cáo Chào cờ & Nghiệp vụ...</span>
                    </div>
                  ) : step3.status === 'error' ? (
                    <p className="text-rose-600 font-mono text-[11px] p-2 bg-rose-50 rounded-lg">
                      {step3.error || 'Đã dừng do lỗi ở bước trước'}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic text-center py-8">
                      Sẽ tự động kích hoạt sau khi Bước 2 hoàn thành.
                    </p>
                  )}
                </div>

                {step3.modelUsed && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    Model: {step3.modelUsed}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE CHAT VIEW */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick prompt pills */}
            <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Gợi ý:
              </span>
              {[
                'Tối ưu hóa công thức tính điểm và thuật toán xếp loại cho 31 lớp',
                'Quy trình giải quyết khiếu nại giữa GVCN và Đội cờ đỏ',
                'Thiết kế đợt thi đua cao điểm chào mừng Ngày Nhà giáo 20/11',
              ].map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(promptText)}
                  className="text-xs bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors shadow-2xs font-medium"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Chat message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const isError = msg.isError;
                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div
                        className={`w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 mt-1 shadow-xs ${
                          isError ? 'bg-rose-600' : 'bg-amber-500'
                        }`}
                      >
                        {isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-red-600 text-white rounded-tr-xs'
                          : isError
                          ? 'bg-rose-50 border border-rose-300 text-rose-900 rounded-tl-xs shadow-2xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans space-y-2">
                        {msg.content}
                      </div>

                      {!isUser && !isError && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                          {msg.modelUsed && (
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <Cpu className="w-3 h-3 text-slate-400" />
                              <span>{msg.modelUsed}</span>
                            </span>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.content);
                              setCopiedIndex(index);
                              setTimeout(() => setCopiedIndex(null), 2000);
                            }}
                            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium ml-auto"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {chatLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-600 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Chuyên gia đang phân tích câu hỏi của bạn...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input box */}
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Hỏi về nề nếp, công thức điểm, quy trình cờ đỏ..."
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputPrompt.trim()}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
