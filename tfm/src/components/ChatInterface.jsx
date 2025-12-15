import React, { useState, useCallback } from 'react';
import ResultDisplay from './ResultDisplay';
// 🚨 引入新的 API 呼叫函式
import { callGeminiAPI } from '../utils/GeminiFetcher'; 

// 輔助函數：檢查 AI 的回應是否為有效的 JSON 清單
// 🚨 關鍵修正：支援從 Markdown 格式中提取 JSON 字串
const isJsonResult = (text) => {
    let jsonString = text.trim();

    // 1. 嘗試從 Markdown 格式中提取 JSON 字串 (```json{...}```)
    if (jsonString.startsWith('```')) {
        const match = jsonString.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (match && match[1]) {
            jsonString = match[1];
        } else {
            // 如果是以 ``` 開頭但不是標準的 ```json{...}``` 格式，則失敗
            return { isJson: false, data: null };
        }
    }
    
    // 2. 最終檢查是否以 { 開頭
    if (!jsonString.startsWith('{')) {
        return { isJson: false, data: null };
    }

    // 3. 嘗試解析 JSON
    try {
        const data = JSON.parse(jsonString);
        // 4. 檢查是否包含我們預期的核心類別
        // ⚠️ 備註: 您的截圖中 AI 輸出了 "equinment"，可能為 AI 拼寫錯誤，但為了代碼健壯性，我們檢查標準的 "equipment"
        if (data.equipment && data.tools && data.consumables) {
            return { isJson: true, data: data };
        }
        return { isJson: false, data: null };
    } catch (e) {
        console.error("JSON 解析失敗:", e);
        return { isJson: false, data: null };
    }
};


function ChatInterface({ config }) { 
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const isKeyReady = !!config.apiKey; 
  // 🚨 完整的系統提示詞：FIXED_PROMPT + JSON 輸出指令
  const fullSystemPrompt = config.prompt + "\n\n🚨 你的最終輸出必須且只能是單個 JSON 物件，不包含任何額外文字。"; 

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isAnalyzing || finalResult || !isKeyReady) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setIsAnalyzing(true);

    const newConversation = [...conversation, { sender: 'user', text: userMessage }];
    setConversation(newConversation);

    try {
      // 🚨 使用單獨的 API 呼叫函式來處理所有 API 細節
      const rawResponseText = await callGeminiAPI(
        config.apiKey,
        fullSystemPrompt,
        newConversation
      );

      let aiResponseText = rawResponseText;
      
      // 4. 判斷 AI 回應是否為最終清單 (JSON)
      // 🚨 使用修正後的 isJsonResult 
      const { isJson, data: resultData } = isJsonResult(aiResponseText); 

      if (isJson) {
          // 如果成功解析 JSON，設置最終結果並更新對話
          setFinalResult(resultData);
          setConversation(prev => [...prev, { sender: 'ai', text: '✅ 清單已生成！' }]);
      } else {
          // 如果不是 JSON，視為多輪對話的下一個問題
          setConversation(prev => [...prev, { sender: 'ai', text: aiResponseText }]);
      }

    } catch (error) {
      console.error('Gemini 服務請求出錯:', error);
      setConversation(prev => [...prev, { sender: 'ai', text: `Gemini 服務請求出錯：${error.message}` }]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [userInput, isAnalyzing, conversation, finalResult, fullSystemPrompt, isKeyReady, config.apiKey]);

  // ... (JSX 渲染邏輯不變)

  return (
    <div 
      className="chat-interface"
      style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px', 
        backgroundColor: '#495057', 
        borderRadius: '10px',
        textAlign: 'center',
        color: '#f8f9fa' 
      }}
    >
      <h2 style={{ textAlign: 'center' }}>💬 專案需求分析</h2>
        {/* ... (對話框內容渲染邏輯不變) */}
      <div style={{ 
        border: '1px solid #6c757d', 
        height: '400px', 
        overflowY: 'auto', 
        padding: '15px', 
        marginBottom: '15px', 
        borderRadius: '5px', 
        backgroundColor: '#c3c3c3', 
        color: '#212529', 
        textAlign: 'left' 
      }}>
        {conversation.length === 0 && (
          <p style={{ color: '#666', textAlign: 'center' }}>
            {!isKeyReady ? 
                '請先在上方輸入您的 AI 服務金鑰或選取預設金鑰。' : 
                '請在下方輸入欄位輸入您想要製作的專案，例如：「我想做一個可以監測溫度的智慧盆栽。」'
            }
          </p>
        )}
        {conversation.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <span style={{
              display: 'inline-block',
              padding: '8px 15px',
              borderRadius: '15px',
              backgroundColor: msg.sender === 'user' ? '#007bff' : '#adb5bd',
              color: msg.sender === 'user' ? 'white' : '#212529',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>{msg.sender === 'user' ? '您' : 'AI 導師'}：</strong> {msg.text}
            </span>
          </div>
        ))}
        {isAnalyzing && (
          <div style={{ textAlign: 'left', marginTop: '10px' }}>
            <span style={{ color: '#666' }}>AI 正在思考...</span>
          </div>
        )}
      </div>

      {/* 輸入表單 */}
      {!finalResult && (
        <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={!isKeyReady ? "請先輸入金鑰..." : (conversation.length === 0 ? "輸入您想要做的專案..." : "回答 AI 的問題...")}
            disabled={isAnalyzing || !isKeyReady}
            style={{ 
              flexGrow: 1, 
              padding: '10px', 
              borderRadius: '5px 0 0 5px', 
              border: '1px solid #6c757d',
              backgroundColor: '#343a40',
              color: '#f8f9fa'
            }}
          />
          <button
            type="submit"
            disabled={isAnalyzing || !userInput.trim() || !isKeyReady}
            style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '0 5px 5px 0', cursor: 'pointer' }}
          >
            {isAnalyzing ? '分析中...' : '送出'}
          </button>
        </form>
      )}

      {/* 最終清單顯示區塊 */}
      {finalResult && <ResultDisplay resultData={finalResult} />}
    </div>
  );
}

export default ChatInterface;