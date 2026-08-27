import React from 'react';
import { useGameState } from './store/useGameState';

export function TeacherDashboard() {
  const { analytics, goHome } = useGameState();

  const data = Object.entries(analytics).map(([questionText, stats]) => ({
    questionText,
    ...stats,
  }));

  const totalAttempted = data.reduce((acc, curr) => acc + curr.attempts, 0);
  const totalCorrect = data.reduce((acc, curr) => acc + curr.correct, 0);
  const globalMastery = totalAttempted === 0 ? 0 : Math.round((totalCorrect / totalAttempted) * 100);

  return (
    <div className="app-container home-screen">
      <div className="home-content fade-in" style={{ padding: '20px', maxWidth: '800px', width: '100%', pointerEvents: 'auto' }}>
        <h2 className="home-title" style={{ fontSize: '28px', marginBottom: '10px' }}>דאשבורד מורה - מעקב למידה</h2>
        <p style={{ color: '#555', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>
          השאלות והתשובות נועדו לקבע את הזיכרון אצל השחקן לגבי תבניות ודרך הפתרון. כאן ניתן לראות מה רמת ההפנמה.
        </p>

        <div className="stats-board" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexDirection: 'row-reverse' }}>
          <div className="stat-item" style={{ flex: 1, backgroundColor: '#e8f5e9' }}>
            <span className="stat-label">שליטה כללית (הפנמה)</span>
            <span className="stat-value" style={{ color: '#2e7d32' }}>{globalMastery}%</span>
          </div>
          <div className="stat-item" style={{ flex: 1, backgroundColor: '#e3f2fd' }}>
            <span className="stat-label">תבניות שתורגלו</span>
            <span className="stat-value" style={{ color: '#1565c0' }}>{data.length}</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', maxHeight: '400px', overflowY: 'auto' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px', textAlign: 'right' }}>פירוט השליטה לפי שאלות שהופיעו במשחק:</h3>
          {data.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>טרם נאספו נתונים מהשחקן.</p>
          ) : (
            data.map((item, idx) => (
              <div key={idx} style={{ 
                border: '1px solid #ddd', borderRadius: '8px', padding: '10px', marginBottom: '10px',
                borderRight: '6px solid ' + (item.mastery >= 80 ? '#4caf50' : item.mastery >= 50 ? '#ff9800' : '#f44336'),
                textAlign: 'right'
              }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>{item.questionText}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', flexDirection: 'row-reverse' }}>
                  <span>ניסיונות: {item.attempts}</span>
                  <span>תשובות נכונות: {item.correct}</span>
                  <span style={{ fontWeight: 'bold', color: item.mastery >= 80 ? '#4caf50' : item.mastery >= 50 ? '#ff9800' : '#f44336' }}>
                    ציון הפנמה: {item.mastery}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="duo-btn duo-btn-secondary" style={{ marginTop: '20px', width: '100%' }} onClick={goHome}>
          חזור למסך הראשי
        </button>
      </div>
    </div>
  );
}
