// src/utils/GeminiFetcher.js

const AI_SERVICE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

// 輔助函數：將對話歷史轉換為 Gemini API 所需的 contents 格式
const formatContentsForAPI = (history) => {
    let contents = [];
    history.forEach(msg => {
        const role = (msg.sender === 'user') ? 'user' : 'model';
        // 排除我們自己插入的清單生成確認訊息
        if (msg.sender === 'ai' && msg.text.includes('✅ 清單已生成')) {
            return; 
        }
        contents.push({ 
            role: role, 
            parts: [{ text: msg.text }] 
        });
    });
    return contents;
};

/**
 * 呼叫 Google Gemini API 處理對話和清單生成請求。
 * * @param {string} apiKey - 用户的 Gemini API Key。
 * @param {string} fullSystemPrompt - 完整的系統指令 (包含 FIXED_PROMPT 和 JSON 輸出指令)。
 * @param {Array<Object>} conversationHistory - 格式化的對話歷史。
 * @returns {Promise<string>} - AI 返回的原始文字或 JSON 字串。
 */
export const callGeminiAPI = async (apiKey, fullSystemPrompt, conversationHistory) => {
    
    // 格式化對話歷史
    const conversationContents = formatContentsForAPI(conversationHistory);

    // 🚨 修正 1：移除 role: 'system' 訊息，並將系統提示詞合併到第一個使用者訊息中
    
    // 複製內容，防止修改原始陣列
    const finalContents = [...conversationContents]; 
    
    // 檢查第一個訊息是否為使用者訊息
    if (finalContents.length > 0 && finalContents[0].role === 'user') {
        // 將系統提示詞插入到第一個使用者訊息的開頭
        const originalUserText = finalContents[0].parts[0].text;
        finalContents[0].parts[0].text = `[系統指令：${fullSystemPrompt}]\n\n使用者輸入：${originalUserText}`;
    } 
    // 注意：如果 conversationHistory 是空的，這段邏輯不會執行，但在 ChatInterface.jsx 中，conversation 至少包含使用者輸入後才調用 API。

    // 建立最終的 JSON Payload
    const payload = {
        // 🚨 再次確認：移除 systemInstruction 頂層欄位
        contents: finalContents, // 使用已經處理過系統指令的新內容陣列
        
        // 🚨 再次確認：移除 generationConfig 中的 responseMimeType
        generationConfig: { 
            temperature: 0.5, 
        }
    };

    // API URL 包含 API Key 查詢參數
    const fetchUrl = `${AI_SERVICE_URL}?key=${apiKey}`;

    try {
        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API 請求失敗: ${errorData.error.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
            // 檢查是否有安全攔截訊息
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                 throw new Error(`AI 服務拒絕了請求，原因：${data.promptFeedback.blockReason}`);
            }
            throw new Error("AI 服務沒有返回有效的內容。");
        }
        
        // 提取 AI 回覆的文字內容
        return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};