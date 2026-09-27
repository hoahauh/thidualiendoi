/**
 * Gemini AI Service with Client-side execution, LocalStorage API Key,
 * Fallback Chain & Auto-Retry mechanism according to AI_INSTRUCTIONS.md
 */

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Mặc định (Khuyên dùng)',
    description: 'Tốc độ phản hồi cực nhanh, tối ưu cho xử lý dữ liệu và phản hồi tức thời.',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Suy luận nâng cao',
    description: 'Mô hình tư duy chuyên sâu, chính xác cao cho phân tích dữ liệu phức tạp.',
    isDefault: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Dự phòng ổn định',
    description: 'Mô hình dự phòng ổn định, hoạt động liên tục khi các bản preview quá tải quota.',
    isDefault: false,
  },
];

export const FALLBACK_CHAIN = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

export const API_KEY_STORAGE_KEY = 'phuoc_hiep_gemini_api_key';
export const SELECTED_MODEL_STORAGE_KEY = 'phuoc_hiep_selected_model';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return 'gemini-3-flash-preview';
  return localStorage.getItem(SELECTED_MODEL_STORAGE_KEY) || 'gemini-3-flash-preview';
}

export function setStoredModel(modelId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, modelId);
}

// System Instruction as specified by user
export const SYSTEM_INSTRUCTION = `
Bạn là một Chuyên gia Phân tích Hệ thống (System Analyst) và Kiến trúc sư Phần mềm (Software Architect) chuyên về lĩnh vực EdTech (Công nghệ giáo dục). Bạn có kinh nghiệm sâu rộng trong việc thiết kế các ứng dụng quản lý nội bộ cho trường học, đặc biệt là các hệ thống đánh giá thi đua, quản lý nề nếp và tự động hóa quy trình báo cáo trên nền tảng Cloud (Google Workspace).

Mục tiêu cốt lõi của bạn là hỗ trợ người dùng hiện thực hóa ý tưởng xây dựng ứng dụng quản lý thi đua cho Liên đội trường TH&THCS Phước Hiệp (31 lớp: Khối Tiểu học 1-5 và Khối THCS 6-9).
Quy tắc phản hồi:
1. Phân quyền nghiêm ngặt (Tổng phụ trách Admin, Đội cờ đỏ, GVCN).
2. Cấu trúc Google Sheets khoa học (Danh mục, Nhập liệu Log, Tính toán, Dashboard).
3. Logic tính toán: Điểm chuẩn 100đ/tuần, cộng thưởng/trừ phạt chặt chẽ.
4. Tính cập nhật: Real-time, Google Apps Script, Webhook.
5. Báo cáo: Trực quan, mẫu chào cờ đầu tuần, xuất Excel/PDF/PowerPoint.

CẤU TRÚC PHẢN HỒI BẮT BUỘC 5 PHẦN:
1. Phân tích yêu cầu: Tóm tắt ngắn gọn tính năng/vấn đề đang thảo luận.
2. Giải pháp kỹ thuật:
   - Cấu trúc Database (Các cột cần có trong Google Sheets).
   - Logic xử lý (Code Apps Script hoặc công thức Excel/Google Sheets chi tiết).
3. Thiết kế Giao diện (UI): Mô tả các nút bấm, form nhập liệu hoặc biểu đồ, trải nghiệm người dùng.
4. Lưu ý nghiệp vụ: Các rủi ro về dữ liệu hoặc mẹo sử dụng cho Tổng phụ trách Đội & GVCN.
5. Kết luận/Bước tiếp theo: Đề xuất hành động kế tiếp để hoàn thiện ứng dụng.
`;

export interface GenerateAIResponseParams {
  prompt: string;
  context?: string;
  apiKey?: string;
  preferredModel?: string;
  onModelAttempt?: (modelId: string, attempt: number, total: number) => void;
}

export interface GenerateAIResponseResult {
  text: string;
  modelUsed: string;
  attemptsCount: number;
}

/**
 * Direct call to Gemini REST API with Fallback Chain & Auto-Retry
 */
export async function generateAIContent({
  prompt,
  context,
  apiKey,
  preferredModel,
  onModelAttempt,
}: GenerateAIResponseParams): Promise<GenerateAIResponseResult> {
  const activeKey = (apiKey || getStoredApiKey()).trim();

  if (!activeKey) {
    throw new Error('MISSING_API_KEY: Vui lòng nhập Gemini API Key của bạn để sử dụng tính năng này.');
  }

  // Construct priority chain starting with user's selected model
  const selected = preferredModel || getStoredModel();
  const modelChain = [selected, ...FALLBACK_CHAIN.filter((m) => m !== selected)];

  const fullPrompt = `${context ? `[Bối cảnh dữ liệu hiện tại của trường TH&THCS Phước Hiệp:\n${context}]\n\n` : ''}Câu hỏi từ người dùng:\n${prompt}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: fullPrompt }],
      },
    ],
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    generationConfig: {
      temperature: 0.7,
    },
  };

  const errors: string[] = [];

  for (let i = 0; i < modelChain.length; i++) {
    const currentModel = modelChain[i];
    if (onModelAttempt) {
      onModelAttempt(currentModel, i + 1, modelChain.length);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${activeKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const errorStatus = errorJson?.error?.status || response.status;
        const errorMessage = errorJson?.error?.message || response.statusText;
        const formattedErr = `${errorStatus}: ${errorMessage}`;
        
        console.warn(`[Gemini Fallback] Model ${currentModel} thất bại (${formattedErr}). Thử model kế tiếp...`);
        errors.push(`[${currentModel}] ${formattedErr}`);
        continue; // Try next model in chain
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText) {
        throw new Error('Phản hồi từ AI không có nội dung văn bản.');
      }

      return {
        text: candidateText,
        modelUsed: currentModel,
        attemptsCount: i + 1,
      };
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Lỗi kết nối model ${currentModel}:`, err);
      errors.push(`[${currentModel}] ${err.message || 'Lỗi kết nối'}`);
      // Continue to next model
    }
  }

  // All models failed
  const finalError = errors.join(' | ');
  throw new Error(`Đã dừng do lỗi: Tất cả các model AI đều thất bại. Chi tiết: ${finalError}`);
}
