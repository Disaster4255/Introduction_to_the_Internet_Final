import React, { useState, useEffect } from 'react';

// 🚨 預設金鑰：請替換成您實際的 AI 服務金鑰
const DEFAULT_API_KEY = "AIzaSyCZKbRlbywEQk0Ov4PaNmikXyVY9k8r404"; 

// 固定的 AI Prompt 修正 JSON 結構
const FIXED_PROMPT = `
你是一位經驗豐富的 Maker 導師，專門分析使用者的製作專案。
你的任務是根據使用者輸入的專案，引導他們完成需求分析，並最終輸出清單。

## 流程指示：
1. **首輪回覆：** 根據使用者最初的專案描述（例如：「我想做一個智慧燈」），提出 2~3 個最關鍵、具體的**封閉式或選擇式**確認問題。
2. **後續回覆：** 如果使用者給予答案，且你認為資訊仍然不足，請繼續提出 1~2 個新問題。
3. **最終輸出：** 當你認為資訊足夠時，**請停止提問**，並直接輸出以下結構的 JSON 格式清單，不要包含任何其他文字或說明：

{
  "project_advice": "給使用者的簡短製作建議與注意事項。",
  "equipment": [
    {"item": "3D 列印機", "unit_price": 8000, "quantity": 1, "note": "用於製作外殼", "link": "[如果無法提供確切的購買連結，請以該項目的名稱(item)為關鍵字，生成一個 **Google 搜尋連結**，例如：https://www.google.com/search?q=3D+列印機。請勿再使用 example.com 或空字串。]"},
    // ... 其他機具
  ],
  "tools": [
    {"item": "烙鐵套組", "unit_price": 500, "quantity": 1, "note": "用於焊接電路", "link": "[同上規則，使用該項目的名稱生成 Google 搜尋連結]"},
    // ... 其他工具
  ],
  "consumables": [
    {"item": "Arduino Nano", "unit_price": 150, "quantity": 2, "note": "微控制器核心", "link": "[同上規則，使用該項目的名稱生成 Google 搜尋連結]"},
    {"item": "PLA 線材 (1kg)", "unit_price": 700, "quantity": 1, "note": "3D 列印材料", "link": "[同上規則，使用該項目的名稱生成 Google 搜尋連結]"}
    // ... 其他耗材
  ]
}

🚨 你的最終輸出必須**嚴格遵守**以上 JSON 結構，且**只能**是單個 JSON 物件，不包含任何額外文字或 Markdown 格式包裹（如\`\`\`json）。
請現在開始你的指導。
`;

function APIKeyConfig({ onConfigChange }) {
  const [useDefaultKey, setUseDefaultKey] = useState(true); 
  const [customApiKey, setCustomApiKey] = useState('');
  
  const currentKey = useDefaultKey ? DEFAULT_API_KEY : customApiKey;

  useEffect(() => {
    onConfigChange({ 
        apiKey: currentKey, 
        prompt: FIXED_PROMPT,
        isDefault: useDefaultKey 
    });
  }, [currentKey, useDefaultKey, onConfigChange]);

  const handleCustomApiKeyChange = (e) => {
    setCustomApiKey(e.target.value);
    setUseDefaultKey(false);
  };

  const toggleUseDefault = () => {
    setUseDefaultKey(!useDefaultKey);
    if (useDefaultKey) {
      setCustomApiKey('');
    }
  };

  return (
    <div 
      className="api-key-config"
      style={{ 
        padding: '20px', 
        border: '1px solid #6c757d', 
        margin: '20px 0', 
        borderRadius: '8px',
        textAlign: 'center',
        backgroundColor: '#495057', 
        color: '#f8f9fa' 
      }}
    >
      <h3>🔑 AI 服務金鑰 (API Key) 輸入</h3>
      
      <div style={{ display: 'inline-block', textAlign: 'left', marginBottom: '15px' }}>
        <label>
          <input
            type="checkbox"
            checked={useDefaultKey}
            onChange={toggleUseDefault}
            style={{ marginRight: '5px' }}
          />
          使用服務提供者的預設金鑰
        </label>
      </div>

      {!useDefaultKey && (
        <div style={{ marginTop: '15px' }}>
          <h4>或輸入您自己的金鑰:</h4>
          <input
            type="password"
            value={customApiKey}
            onChange={handleCustomApiKeyChange}
            placeholder="請輸入您的 AI 服務金鑰 (例如：Gemini 或 OpenAI Key)"
            style={{ 
              width: '100%', 
              padding: '10px', 
              textAlign: 'left',
              backgroundColor: '#343a40', 
              color: '#f8f9fa',
              border: '1px solid #6c757d',
              borderRadius: '5px' 
            }} 
          />
        </div>
      )}
      
      <div style={{ marginTop: '10px', color: '#28a745' }}>
        {useDefaultKey && <p>✅ 正在使用預設金鑰。</p>}
        {customApiKey && <p>✅ 正在使用您輸入的金鑰。</p>}
        {!currentKey && !useDefaultKey && <p style={{color: '#ffc107'}}>請輸入金鑰或選取預設金鑰以開始 AI 分析。</p>}
      </div>

    </div>
  );
}

export default APIKeyConfig;