import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI if API key exists
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// System Instruction as specified by user
const SYSTEM_INSTRUCTION = `
Bạn là một Chuyên gia Phân tích Hệ thống (System Analyst) và Kiến trúc sư Phần mềm (Software Architect) chuyên về lĩnh vực EdTech (Công nghệ giáo dục). Bạn có kinh nghiệm sâu rộng trong việc thiết kế các ứng dụng quản lý nội bộ cho trường học, đặc biệt là các hệ thống đánh giá thi đua, quản lý nề nếp và tự động hóa quy trình báo cáo trên nền tảng Cloud (Google Workspace).

Mục tiêu cốt lõi của bạn là hỗ trợ người dùng hiện thực hóa ý tưởng xây dựng ứng dụng quản lý thi đua cho Liên đội trường TH&THCS Phước Hiệp (31 lớp: Khối Tiểu học 1-5 và Khối THCS 6-9).
Quy tắc phản hồi:
1. Phân quyền nghiêm ngặt (Tổng phụ trách Admin, Đội cờ đỏ, GVCN).
2. Cấu trúc Google Sheets khoa học (Danh mục, Nhập liệu Log, Tính toán, Dashboard).
3. Logic tính toán: Điểm chuẩn 100đ/tuần, cộng thưởng/trừ phạt chặt chẽ.
4. Tính cập nhật: Real-time, Google Apps Script, Webhook.
5. Báo cáo: Trực quan, mẫu chào cờ đầu tuần, xuất Excel/PDF.

CẤU TRÚC PHẢN HỒI BẮT BUỘC 5 PHẦN:
1. Phân tích yêu cầu: Tóm tắt ngắn gọn tính năng/vấn đề đang thảo luận.
2. Giải pháp kỹ thuật:
   - Cấu trúc Database (Các cột cần có trong Google Sheets).
   - Logic xử lý (Code Apps Script hoặc công thức Excel/Google Sheets chi tiết).
3. Thiết kế Giao diện (UI): Mô tả các nút bấm, form nhập liệu hoặc biểu đồ, trải nghiệm người dùng.
4. Lưu ý nghiệp vụ: Các rủi ro về dữ liệu hoặc mẹo sử dụng cho Tổng phụ trách Đội & GVCN.
5. Kết luận/Bước tiếp theo: Đề xuất hành động kế tiếp để hoàn thiện ứng dụng.
`;

// AI Consultant API
app.post('/api/ai-consultant', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Nội dung yêu cầu không được để trống.' });
    }

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured
      return res.json({
        reply: `### 1. Phân tích yêu cầu\nYêu cầu tư vấn: "${prompt}". Hệ thống đang hoạt động ở chế độ phân tích mô phỏng kiến trúc dữ liệu cho Liên đội TH&THCS Phước Hiệp (31 lớp).\n\n### 2. Giải pháp kỹ thuật\n- **Cấu trúc Sheet đề xuất:**\n  + Sheet \`DanhMuc_Lop_TieuChi\`: Mã lớp, Tên lớp, Khối (TH/THCS), GVCN, Điểm gốc (100đ).\n  + Sheet \`NhatKy_NhapLieu\`: Timestamp, Tuần, Thứ, Lớp vi phạm, Tiêu chí, Điểm trừ/cộng, Người chấm (Cờ đỏ), Minh chứng, Trạng thái duyệt.\n- **Công thức Google Sheets:** \`=100 + SUMIFS(NhatKy_NhapLieu!F:F, NhatKy_NhapLieu!D:D, A2, NhatKy_NhapLieu!B:B, $H$1)\`\n\n### 3. Thiết kế Giao diện (UI)\n- Form chấm chéo mobile-friendly: Chọn nhanh ngày, chọn lớp trực thuộc, danh sách lỗi phân nhóm có checkbox và counter số lượt vi phạm.\n- Bảng điều khiển Tổng phụ trách: Bộ lọc theo Khối, nút Phê duyệt / Điều chỉnh một chạm, biểu đồ nhiệt vi phạm theo ngày.\n\n### 4. Lưu ý nghiệp vụ\n- Cần cơ chế khóa sổ sau 17h00 thứ Bảy để GVCN kịp đối soát trước lễ Chào cờ thứ Hai.\n- Mỗi biên bản trừ điểm nặng (>5đ) phải có ghi rõ tên học sinh và sự xác nhận của cờ đỏ trưởng.\n\n### 5. Kết luận/Bước tiếp theo\nĐề xuất cấu hình Webhook Google Apps Script để tự động đẩy dữ liệu từ ứng dụng lên Google Drive của nhà trường.`
      });
    }

    const fullPrompt = `${context ? `[Bối cảnh dữ liệu hiện tại của trường TH&THCS Phước Hiệp:\n${context}]\n\n` : ''}Câu hỏi từ người dùng:\n${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: 'Không thể kết nối với Chuyên gia AI. Vui lòng thử lại.',
      details: error.message,
    });
  }
});

// Setup Vite in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

startServer();
