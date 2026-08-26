import { useState, useMemo, useEffect } from 'react';
import './index.css';
import { useGameState } from './store/useGameState.jsx';
import curriculum from './data/curriculum.json';

// Removed procedural generation

export const AVAILABLE_SKINS = [
  { id: 'default', name: 'רובוט ורוד', cost: 0, color: 'hotpink', spriteBase: null },
  { id: 'warrior', name: 'לוחם רובלוקס', cost: 0, color: '#333', spriteBase: '/warrior_' },
  { id: 'mage', name: 'קוסם רובלוקס', cost: 0, color: '#4a148c', spriteBase: '/mage_' },
  { id: 'charibear', name: 'דובי-זארד (Legendary)', cost: 1000, color: '#FF5722', sprite: '/charibear.jpg' },
  { id: 'centaur', name: 'קנטאור אפי (Legendary)', cost: 2000, color: '#795548', sprite: '/centaur.jpg' },
];

function Home() {
  const { lifetimeCoins, highScore, startGame, goToShop } = useGameState();
  return (
    <div className="app-container home-screen">
      <div className="home-content fade-in">
        <h1 className="home-title">Math Quest</h1>
        <div className="mascot-container">
          <img src="/mascot.png" alt="Math Mascot" className="mascot-img floating" />
        </div>
        
        <div className="stats-board">
          <div className="stat-item">
            <span className="stat-label">שיא אישי</span>
            <span className="stat-value">🏆 {highScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">סך הכל מטבעות</span>
            <span className="stat-value">💎 {lifetimeCoins}</span>
          </div>
        </div>
        
        <button className="duo-btn duo-btn-primary play-btn bounce" onClick={startGame}>
          התחל משחק!
        </button>
        <button className="duo-btn duo-btn-secondary" style={{marginTop: '10px'}} onClick={goToShop}>
          חנות סקינים 🛒
        </button>
      </div>
    </div>
  );
}

function Shop() {
  const { lifetimeCoins, ownedSkins, currentSkin, buySkin, equipSkin, goHome } = useGameState();
  
  return (
    <div className="app-container home-screen">
      <div className="home-content fade-in">
        <h2 className="home-title" style={{fontSize: '28px'}}>חנות סקינים</h2>
        <div className="stats-board" style={{padding: '10px 20px'}}>
          <div className="stat-item">
            <span className="stat-label">התקציב שלך</span>
            <span className="stat-value">💎 {lifetimeCoins}</span>
          </div>
        </div>
        
        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', width: '100%'}}>
          {AVAILABLE_SKINS.map(skin => {
             const isOwned = ownedSkins.includes(skin.id);
             const isEquipped = currentSkin === skin.id;
             return (
               <div key={skin.id} style={{
                 border: `3px solid ${isEquipped ? 'var(--blue-main)' : 'var(--gray-border)'}`, 
                 padding: '15px', borderRadius: '16px', textAlign: 'center', backgroundColor: 'white', flex: '1 1 40%'
               }}>
                  <div style={{width: '60px', height: '60px', backgroundColor: skin.color, margin: '0 auto 10px', borderRadius: '12px'}}></div>
                  <h4 style={{marginBottom: '10px'}}>{skin.name}</h4>
                  {!isOwned ? (
                    <button className="duo-btn duo-btn-secondary" style={{padding: '8px', fontSize: '14px'}} onClick={() => buySkin(skin.id, skin.cost)}>קנה ({skin.cost}💎)</button>
                  ) : (
                    <button className="duo-btn duo-btn-primary" style={{padding: '8px', fontSize: '14px'}} disabled={isEquipped} onClick={() => equipSkin(skin.id)}>
                      {isEquipped ? 'מצויד' : 'צייד'}
                    </button>
                  )}
               </div>
             )
          })}
        </div>
        <button className="duo-btn duo-btn-secondary play-btn" style={{marginTop: 'auto'}} onClick={goHome}>חזור למסך הראשי</button>
      </div>
    </div>
  )
}

function TopBar({ onToggleInventory }) {
  const { coins, weeklyPassStatus, progressInBiome, buyWeeklyPass, inventory } = useGameState();

  const handleBuyPass = () => {
    const success = buyWeeklyPass();
    if (!success) {
      alert("לא מספיק מטבעות! צריך 100 מטבעות.");
    } else {
      alert("רכשת את ה-Weekly Pass!");
    }
  };

  return (
    <header className="top-bar" style={{ pointerEvents: 'auto', background: 'rgba(30, 60, 114, 0.9)', color: 'white', padding: '16px', borderRadius: '0 0 16px 16px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progressInBiome}%`, backgroundColor: '#ffc107' }}></div>
        </div>
        <small style={{ fontWeight: 'bold' }}>התקדמות לעולם הבא: {progressInBiome}%</small>
      </div>
      <div className="stats">
        <button onClick={onToggleInventory} style={{ background: '#8b5a2b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>
           🎒 מלאי
        </button>
        <span className="gems" style={{marginRight: '10px', color: '#ffc107'}}>💎 {coins}</span>
        <button 
           className="duo-btn duo-btn-secondary" 
           style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'white', borderColor: 'white', boxShadow: '0 4px 0 white' }}
           onClick={handleBuyPass}
           disabled={weeklyPassStatus}
        >
           {weeklyPassStatus ? 'Weekly Pass 🌟' : 'קנה Pass (100💎)'}
        </button>
      </div>
    </header>
  );
}

function InventoryUI({ onClose }) {
  const { inventory, craftSword, buildHouse } = useGameState();
  
  return (
    <div className="craft-panel slide-in-down" style={{
      position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
      width: '90%', maxWidth: '400px',
      padding: '20px', pointerEvents: 'auto', zIndex: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, textShadow: '2px 2px 0 #000' }}>🎒 המלאי שלי</h2>
        <button onClick={onClose} style={{ background: '#d32f2f', color: 'white', border: '2px solid #b71c1c', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div className="craft-question-box" style={{ padding: '10px', textAlign: 'center', fontSize: '16px' }}>🪵 עץ: {inventory.wood}</div>
        <div className="craft-question-box" style={{ padding: '10px', textAlign: 'center', fontSize: '16px' }}>🪨 אבן: {inventory.stone}</div>
        <div className="craft-question-box" style={{ padding: '10px', textAlign: 'center', fontSize: '16px' }}>🥕 אוכל לחיות: {inventory.food}</div>
        <div className="craft-question-box" style={{ padding: '10px', textAlign: 'center', fontSize: '16px' }}>🗝️ מפתחות: {inventory.key}</div>
        
        <button 
          className="craft-option-btn"
          onClick={() => craftSword() ? alert('יצרת חרב!') : alert('חסר עץ או שיש לך כבר חרב')}
          style={{ padding: '10px', fontSize: '14px' }}>
          🗡️ צור חרב (2 עץ)
        </button>
        <button 
          className="craft-option-btn"
          onClick={() => buildHouse() ? alert('בנית בית!') : alert('חסרה אבן או שכבר בנית בית')}
          style={{ padding: '10px', fontSize: '14px' }}>
          🏠 בנה בית (5 אבנים)
        </button>
      </div>
    </div>
  );
}

function Game() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [usedLifeline, setUsedLifeline] = useState(false);
  const { currentQuestionIndex, nextQuestion, handleAnswer, handleLifelineAnswer, useKey, coins, addCoins } = useGameState();

  const questionObj = useMemo(() => curriculum[currentQuestionIndex % curriculum.length], [currentQuestionIndex]);
  const currentOptions = questionObj.options;

  const handleBuyHint = () => {
    if (showHint) return;
    const success = useKey();
    if (success) {
      setShowHint(true);
    } else if (coins >= 10) {
      addCoins(-10); // Deduct 10 coins
      setShowHint(true);
    } else {
      alert("אין לך מספיק מטבעות או מפתחות לקבל רמז!");
    }
  };

  const handleOptionClick = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
    
    const correct = index === questionObj.correctIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    handleAnswer(correct);
  };

  const handleLifeline = () => {
    setUsedLifeline(true);
    setIsCorrect(false); // They didn't really get it correct, but we'll show feedback
    setShowFeedback(true);
    handleLifelineAnswer(); // New function in useGameState
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setShowHint(false);
    setUsedLifeline(false);
    const isGameOver = currentQuestionIndex >= 100; // Arbitrary for now
    nextQuestion(isGameOver);
  };

  return (
    <div style={{ pointerEvents: 'none', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

      <main className="craft-panel slide-in-right" style={{ pointerEvents: 'auto', padding: '20px', margin: '20px' }}>
        <h2 style={{ textShadow: '2px 2px 0 #000', marginBottom: '15px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
           שאלה {currentQuestionIndex + 1} ({questionObj.category})
        </h2>
        <div className="exercise-area" style={{ flexDirection: 'column' }}>
          <div className="craft-question-box" style={{ width: '100%', marginBottom: '20px' }}>
            <p>{questionObj.question}</p>
          </div>
        </div>

        <div className="options-area" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {currentOptions.map((option, index) => (
            <button
              key={index}
              className={`craft-option-btn ${selectedOption === index ? 'craft-option-selected' : ''}`}
              onClick={() => handleOptionClick(index)}
            >
              {option}
            </button>
          ))}
        </div>
        
        {!showFeedback && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            {!showHint && (
              <button 
                 onClick={handleBuyHint} 
                 style={{ flex: 1, padding: '8px', background: '#ffc107', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                 💡 עזרה במשוואה (מפתח או 10💎)
              </button>
            )}
            <button 
               onClick={handleLifeline} 
               style={{ width: '100%', padding: '12px', background: '#e91e63', color: 'white', border: '3px solid #c2185b', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', fontWeight: '900', marginTop: '10px', textShadow: '1px 1px 0px #000', boxShadow: '0 4px 0 #c2185b' }}>
               🛟 אל תנחש סתם! לחץ כאן כדי לראות את דרך הפתרון (ללא ניקוד)
            </button>
          </div>
        )}
        {showHint && (
          <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', color: '#333', textAlign: 'center', fontWeight: 'bold' }}>
            רמז: {questionObj.hint || 'המשוואה תוצג כאן'}
          </div>
        )}
      </main>

      <footer className="bottom-bar" style={{ pointerEvents: 'auto' }}>
        {showFeedback && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
             <h3 style={{ color: isCorrect ? 'green' : (usedLifeline ? 'orange' : 'red'), margin: '10px 0', textAlign: 'center' }}>
               {isCorrect 
                 ? 'תשובה נכונה! 🎉\nהרווחת יהלומים ומשאבים!' 
                 : (usedLifeline ? 'השתמשת בחבל הצלה. לא קיבלת ניקוד.' : 'תשובה שגויה...')}
             </h3>
             <div style={{ background: '#fff', color: '#000', padding: '15px', borderRadius: '10px', marginBottom: '10px', width: '100%' }}>
               <strong>דרך הפתרון:</strong><br />
               {questionObj.solution || 'הפתרון המלא יוצג כאן.'}
             </div>
             <button 
               className="duo-btn duo-btn-primary" 
               onClick={handleNext}
             >
               {(isCorrect || usedLifeline) ? 'המשך בדרך' : 'הבנתי, תן לי שאלה חדשה'}
             </button>
          </div>
        )}
      </footer>
    </div>
  );
}

function Summary() {
  const { sessionScore, coins, goHome } = useGameState();
  return (
    <div className="app-container home-screen">
      <div className="home-content fade-in">
        <h2>כל הכבוד! סיימת!</h2>
        <div className="stats-board">
          <div className="stat-item">
            <span className="stat-label">תשובות נכונות</span>
            <span className="stat-value">✅ {sessionScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">הרווחת מטבעות</span>
            <span className="stat-value">💎 {coins}</span>
          </div>
        </div>
        <button className="duo-btn duo-btn-primary play-btn" onClick={goHome}>
          חזור למסך הראשי
        </button>
      </div>
    </div>
  );
}

import { Canvas } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { World } from './World';

function ThreeWorldContainer() {
  const { currentSkin, currentBiome } = useGameState();
  const activeSkin = AVAILABLE_SKINS.find(s => s.id === currentSkin) || AVAILABLE_SKINS[0];
  
  // Logic for character evolution based on Biome (0, 1, 2 => stage 1, 2, 3)
  let resolvedSprite = activeSkin.sprite;
  if (activeSkin.spriteBase) {
    const stage = Math.min(3, currentBiome + 1); // Stage 1, 2, or 3
    resolvedSprite = `${activeSkin.spriteBase}${stage}.jpg`;
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <World skinColor={activeSkin.color} skinSprite={resolvedSprite} />
      </Canvas>
    </div>
  );
}

function App() {
  const { currentScreen, isAnsweringMath } = useGameState();
  const [showInventory, setShowInventory] = useState(false);
  const [subscribeKeys] = useKeyboardControls();

  useEffect(() => {
    return subscribeKeys(
      (state) => state.inventory,
      (pressed) => {
        if (pressed && currentScreen === 'game' && !isAnsweringMath) {
          setShowInventory(prev => !prev);
        }
      }
    );
  }, [subscribeKeys, currentScreen, isAnsweringMath]);
  
  // Only the active UI screen gets pointer events so the 3D canvas can be clicked
  const pointerEvents = currentScreen === 'home' || currentScreen === 'summary' || currentScreen === 'shop' || isAnsweringMath || showInventory ? 'auto' : 'none';

  return (
    <>
      {/* 3D Game World */}
      <ThreeWorldContainer />

      {/* 2D UI Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: '600px', height: '100%', display: 'flex', flexDirection: 'column', pointerEvents: 'auto' }}>
            {currentScreen === 'home' && <Home />}
            {currentScreen === 'shop' && <Shop />}
            {currentScreen === 'game' && (
              <div className="app-container" style={{ pointerEvents: 'none' }}>
                <TopBar onToggleInventory={() => setShowInventory(!showInventory)} />
                {isAnsweringMath ? <Game /> : <div className="crosshair" style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', color:'white', fontSize:'24px'}}>+</div>}
                {showInventory && <InventoryUI onClose={() => setShowInventory(false)} />}
              </div>
            )}
            {currentScreen === 'summary' && <Summary />}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
