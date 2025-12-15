import React from 'react';

function ResultDisplay({ resultData }) {
  if (!resultData || !resultData.equipment || !resultData.tools || !resultData.consumables) {
    return <div></div>; // 如果沒有資料，不顯示
  }

  const { project_advice, equipment, tools, consumables } = resultData;

  // 輔助函數：將清單資料轉換為 CSV 格式
  const formatListToCSV = () => {
    // CSV 標題
    let csvContent = "類別,名稱,單價,數量,總價,備註,連結\n";
    
    // 輔助函數：將單一類別資料加入 CSV
    const appendCategory = (categoryName, items) => {
      items.forEach((item) => {
        const name = `"${(item.item || '').replace(/"/g, '""')}"`; // 處理名稱中的逗號或引號
        const unitPrice = item.unit_price || 0;
        const quantity = item.quantity || 1;
        const totalPrice = unitPrice * quantity;
        const note = `"${(item.note || '').replace(/"/g, '""')}"`;
        const link = `"${(item.link || '').replace(/"/g, '""')}"`;
        
        // 🚨 輸出格式： 類別,名稱,單價,數量,總價,備註,連結
        csvContent += `${categoryName},${name},${unitPrice},${quantity},${totalPrice},${note},${link}\n`;
      });
    };

    appendCategory('機具 (Equipment)', equipment);
    appendCategory('工具 (Tools)', tools);
    appendCategory('耗材 (Consumables)', consumables);

    return csvContent;
  };

  // 下載功能
  const handleDownload = () => {
    const csvContent = formatListToCSV();
    
    // 為了確保中文正確顯示，使用 UTF-8 BOM
    const BOM = "\uFEFF"; 
    
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'makers_project_list.csv'; // 🚨 檔名改為 CSV
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('清單已下載為 makers_project_list.csv！');
  };

  const renderItems = (items) => (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          <strong>{item.item}</strong> ({item.quantity} 個, 單價 ${item.unit_price || 0}): {item.note} 
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px', color: '#adb5bd' }}>
              (建議連結)
            </a>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div style={{ 
        padding: '20px', 
        backgroundColor: '#495057', 
        borderRadius: '8px', 
        marginTop: '30px',
        textAlign: 'center',
        color: '#f8f9fa' 
    }}>
      <h2>✅ 最終清單與建議</h2>
      
      {/* 以下內容使用 div 包裹，並將其對齊方式設為左對齊，以利閱讀 */}
      <div style={{ textAlign: 'left', display: 'inline-block' }}> 
        <h3>專案建議:</h3>
        <p style={{ borderLeft: '3px solid #007bff', paddingLeft: '10px' }}>{project_advice}</p>

        <h3>一、機具 (Equipment)</h3>
        {renderItems(equipment)}

        <h3>二、工具 (Tools)</h3>
        {renderItems(tools)}

        <h3>三、耗材 (Consumables)</h3>
        {renderItems(consumables)}
      </div>

      {/* 下載按鈕 (因父元素已置中，按鈕會跟著置中) */}
      <button
        onClick={handleDownload}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        📥 下載為 CSV 購買清單
      </button>
    </div>
  );
}

export default ResultDisplay;