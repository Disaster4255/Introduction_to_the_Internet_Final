import React, { useState, useCallback } from 'react';
import APIKeyConfig from './components/APIKeyConfig'; // 🚨 引用新名稱
import ChatInterface from './components/ChatInterface';
import './assets/style.css'; 

function App() {
  // 🚨 新增 isDefault 狀態，用於儲存配置資訊
  const [config, setConfig] = useState({ apiKey: '', prompt: '', isDefault: true }); 

  // 接收 APIKeyConfig 傳來的配置 (金鑰 + Prompt + 是否預設)
  const handleConfigChange = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <div className="makers-app">
      {/* Hero Section (已垂直/水平置中) */}
      <header className="hero-section">
        <h1>MAKERS 材料清單生成</h1>
        <p>專案需要的機具、工具、材料都能在這裡拿到建議與價格</p>
      </header>

      {/* 漸變背景容器 (main-content-bg) - 現為純深灰色 */}
      <div className="main-content-bg">
        <main>
          <section 
            className="main-content-section" 
            style={{ 
              maxWidth: '800px', 
              margin: '0 auto', /* 讓內容區塊置中 */
              padding: '0 15px'
            }}
          >
            {/* 1. API 金鑰設定區塊 */}
            <APIKeyConfig onConfigChange={handleConfigChange} /> 

            <hr style={{ margin: '40px 0', borderColor: '#6c757d' }} />

            {/* 2. 對話與分析區塊 */}
            {/* 傳入整個配置物件 */}
            <ChatInterface config={config} /> 

          </section>
        </main>
      </div>
      {/* 您可以在這裡加入 Footer.jsx, Links.jsx 等元件 */}
    </div>
  );
}

export default App;