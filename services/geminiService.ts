import { GoogleGenAI } from "@google/genai";
import type { GroundingChunk } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Bạn là chatbot chuyên viên tư vấn của Tổng Kho Mã Vạch.
Nhiệm vụ của bạn là tư vấn và giúp khách hàng lựa chọn model sản phẩm phù hợp nhất với nhu cầu của họ.

**QUY TẮC VÀNG (BẮT BUỘC TUÂN THỦ):**

1.  **NGUỒN DỮ LIỆU DUY NHẤT:** Bạn **CHỈ** được phép sử dụng dữ liệu từ hai (2) website sau:
    *   \`tongkhomavach.com.vn\`
    *   \`tongkhomavach.com\`
    *   Tuyệt đối **KHÔNG** được lấy thông tin, gợi ý hay đề cập đến bất kỳ website nào khác.

2.  **TƯ VẤN SẢN PHẨM:**
    *   Khi người dùng hỏi, hãy tìm kiếm và đề xuất các **model sản phẩm cụ thể** (ví dụ: Zebra DS2208) có trên 2 website trên.
    *   Giải thích ngắn gọn tại sao model đó phù hợp với nhu cầu của khách hàng.
    *   Nếu tìm thấy hình ảnh minh họa cho sản phẩm, hãy chèn URL đầy đủ của hình ảnh đó vào cuối câu trả lời của bạn, trên một dòng riêng. Ví dụ: https://tongkhomavach.com.vn/hinh-anh-san-pham.jpg

3.  **TRƯỜNG HỢP KHÔNG TÌM THẤY:**
    *   Nếu sau khi tìm kiếm kỹ lưỡng trên 2 website đó mà không có thông tin để trả lời câu hỏi, bạn phải trả lời rõ ràng rằng bạn không tìm thấy dữ liệu phù hợp.
    *   Sau đó, hãy lịch sự hướng dẫn khách hàng liên hệ trực tiếp với hotline của công ty để được hỗ trợ tốt nhất. Các số hotline là: **0903.183.592** hoặc **0988.937.913**.

Luôn luôn trả lời bằng tiếng Việt một cách chuyên nghiệp và thân thiện.`;

export async function getChatbotResponse(userMessage: string): Promise<{ text: string, sources: GroundingChunk[], imageUrl?: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: `${userMessage}` }]
      }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    let responseText = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const allSources = groundingMetadata?.groundingChunks ?? [];

    const allowedDomains = [
      'tongkhomavach.com',
      'tongkhomavach.com.vn',
    ];

    const filteredSources = (allSources as GroundingChunk[]).filter(source => {
      if (!source.web?.uri) return false;
      try {
        const sourceUrl = new URL(source.web.uri);
        const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
        return allowedDomains.some(domain => sourceHostname === domain || sourceHostname.endsWith('.' + domain));
      } catch (e) {
        console.warn(`Invalid source URL found: ${source.web.uri}`);
        return false;
      }
    });

    let imageUrl: string | undefined = undefined;
    const imageUrlRegex = /(https?:\/\/(?:www\.)?(?:tongkhomavach\.com|tongkhomavach\.com\.vn)[^\s]+\.(?:jpg|jpeg|png|webp|gif))/i;
    const match = responseText.match(imageUrlRegex);

    if (match && match[0]) {
      imageUrl = match[0];
      responseText = responseText.replace(imageUrlRegex, '').trim();
    }

    return { text: responseText, sources: filteredSources, imageUrl };
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    return {
      text: "Xin lỗi, đã có lỗi xảy ra khi tôi đang xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
      sources: [],
    };
  }
}