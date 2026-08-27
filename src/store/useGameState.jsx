import React, { createContext, useState, useContext } from 'react';

const GameStateContext = createContext();

import curriculum from '../data/curriculum.json';

const getShuffledIndices = () => {
  const arr = Array.from({length: curriculum.length}, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const GameStateProvider = ({ children }) => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'game', 'summary'
  
  // Game session stats
  const [coins, setCoins] = useState(0);
  const [weeklyPassStatus, setWeeklyPassStatus] = useState(false);
  
  const [availableQuestions, setAvailableQuestions] = useState(() => {
    const saved = localStorage.getItem('mathQuest_availableQuestions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const newShuffle = getShuffledIndices();
    localStorage.setItem('mathQuest_availableQuestions', JSON.stringify(newShuffle));
    return newShuffle;
  });
  
  const currentQuestionIndex = availableQuestions[0] !== undefined ? availableQuestions[0] : 0;
  
  // Persistent stats (mocked for Firebase later)
  const [lifetimeCoins, setLifetimeCoins] = useState(150); // Fake initial
  const [highScore, setHighScore] = useState(5); // Fake initial
  const [sessionScore, setSessionScore] = useState(0);
  
  // Skins logic
  const [ownedSkins, setOwnedSkins] = useState(['default', 'warrior', 'mage']);
  const [currentSkin, setCurrentSkin] = useState('warrior');
  
  // Interactive 3D state
  const [isAnsweringMath, setIsAnsweringMath] = useState(false);
  
  // Progression Logic
  const [currentBiome, setCurrentBiome] = useState(0); // 0: Grass, 1: Desert, 2: Lava
  const [progressInBiome, setProgressInBiome] = useState(0); // 0 to 100
  
  // Minecraft Gamification State
  const [inventory, setInventory] = useState({ wood: 0, stone: 0, sword: 0, key: 0, house: 0, food: 0 });

  // World Data
  const generateWorldObjects = () => {
    const blocks = [];
    const rocks = [];
    const size = 20; // Match the World size
    for (let i = 0; i < 72; i++) { // 72 questions
      blocks.push({
        id: i,
        x: Math.random() * size * 2 - size,
        z: Math.random() * size * 2 - size,
        difficulty: i % 3 === 0 ? 'hard' : (i % 3 === 1 ? 'medium' : 'easy')
      });
    }
    const animals = [];
    const fences = [];
    for (let i = 0; i < 15; i++) {
      rocks.push({
        id: i,
        x: Math.random() * size * 2 - size,
        z: Math.random() * size * 2 - size,
      });
    }
    for (let i = 0; i < 8; i++) {
      animals.push({
        id: i,
        type: i % 2 === 0 ? 'pig' : 'sheep',
        x: Math.random() * size * 2 - size,
        z: Math.random() * size * 2 - size,
      });
    }
    return { blocks, rocks, animals, fences };
  };

  const [worldObjects, setWorldObjects] = useState(generateWorldObjects());

  const handleLifelineAnswer = () => {
    // Lifeline preserves streak (if we had one) and doesn't give points or penalty.
    // It's essentially a safe pass.
  };

  const handleAnswer = (isCorrect, difficulty = 'medium') => {
    if (isCorrect) {
      setLifetimeCoins(prev => prev + 10);
      setSessionScore(prev => prev + 1);
      // Give wood and sometimes food
      setInventory(prev => ({ 
         ...prev, 
         wood: prev.wood + 1,
         food: prev.food + (Math.random() > 0.5 ? 1 : 0)
      })); 
      
      let points = 25; // default medium: 4 questions to advance
      if (difficulty === 'easy') points = 20; // 5 questions to advance
      if (difficulty === 'hard') points = 34; // 3 questions to advance
      
      let newProgress = progressInBiome + points; 
      if (newProgress >= 100) {
        newProgress = 0;
        setCurrentBiome(prev => Math.min(prev + 1, 14)); // Up to 15 biomes
        setLifetimeCoins(prev => prev + 50);
        setWorldObjects(generateWorldObjects()); // Respawn on biome change
      }
      setProgressInBiome(newProgress);
    } else {
      // Penalty
      setLifetimeCoins(prev => Math.max(0, prev - 5));
      setProgressInBiome(prev => Math.max(0, prev - 10)); // Push back from the gate
    }
  };

  const craftSword = () => {
    if (inventory.wood >= 2 && inventory.sword === 0) {
      setInventory(prev => ({ ...prev, wood: prev.wood - 2, sword: 1 }));
      return true;
    }
    return false;
  };

  const buildHouse = () => {
    if (inventory.stone >= 5 && inventory.house === 0) {
      setInventory(prev => ({ ...prev, stone: prev.stone - 5, house: 1 }));
      return true;
    }
    return false;
  };

  const feedAnimal = () => {
    if (inventory.food > 0) {
      setInventory(prev => ({ ...prev, food: prev.food - 1 }));
      setLifetimeCoins(prev => prev + 15); // Reward for feeding
      return true;
    }
    return false;
  };

  const buildFence = (x, z) => {
    if (inventory.wood >= 1) {
      setInventory(prev => ({ ...prev, wood: prev.wood - 1 }));
      setWorldObjects(prev => ({
        ...prev,
        fences: [...prev.fences, { id: Date.now(), x, z }]
      }));
      return true;
    }
    return false;
  };
  
  const mineStone = () => {
    if (inventory.sword > 0) {
      const dropKey = Math.random() < 0.2; // 20% chance for a key
      setInventory(prev => ({ 
        ...prev, 
        stone: prev.stone + 1, 
        key: dropKey ? prev.key + 1 : prev.key 
      }));
      return dropKey;
    }
    return false;
  };

  const useKey = () => {
    if (inventory.key > 0) {
      setInventory(prev => ({ ...prev, key: prev.key - 1 }));
      return true;
    }
    return false;
  };

  const buySkin = (skinId, cost) => {
    if (lifetimeCoins >= cost && !ownedSkins.includes(skinId)) {
      setLifetimeCoins(prev => prev - cost);
      setOwnedSkins(prev => [...prev, skinId]);
      setCurrentSkin(skinId);
      return true;
    }
    return false;
  };

  const equipSkin = (skinId) => {
    if (ownedSkins.includes(skinId)) {
      setCurrentSkin(skinId);
    }
  };

  const startGame = () => {
    setCurrentScreen('game');
    setCoins(0);
    setSessionScore(0);
    setCurrentQuestionIndex(0);
    setIsAnsweringMath(false);
  };
  
  const triggerMathBlock = () => {
    setIsAnsweringMath(true);
  };

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
    setLifetimeCoins(prev => prev + amount);
    setSessionScore(prev => prev + 1);
  };
  
  const buyWeeklyPass = () => {
    if (lifetimeCoins >= 100 && !weeklyPassStatus) {
      setLifetimeCoins(prev => prev - 100);
      setWeeklyPassStatus(true);
      return true;
    }
    return false;
  };

  const nextQuestion = (isGameOver) => {
    if (isGameOver) {
      if (sessionScore > highScore) setHighScore(sessionScore);
      setCurrentScreen('summary');
    } else {
      setAvailableQuestions(prev => {
        let nextArr = prev.slice(1);
        if (nextArr.length === 0) {
          nextArr = getShuffledIndices();
        }
        localStorage.setItem('mathQuest_availableQuestions', JSON.stringify(nextArr));
        return nextArr;
      });
      setIsAnsweringMath(false); // Close overlay after answering
    }
  };

  const goHome = () => setCurrentScreen('home');
  const goToShop = () => setCurrentScreen('shop');
  const closeMathBlock = () => setIsAnsweringMath(false);

  return (
    <GameStateContext.Provider value={{
      currentScreen,
      coins,
      weeklyPassStatus,
      lifetimeCoins,
      highScore,
      sessionScore,
      ownedSkins,
      currentSkin,
      isAnsweringMath,
      currentBiome,
      progressInBiome,
      currentQuestionIndex,
      startGame,
      triggerMathBlock,
      addCoins,
      goToShop,
      closeMathBlock,
      buyWeeklyPass,
      nextQuestion,
      goHome,
      buySkin,
      equipSkin,
      handleAnswer,
      handleLifelineAnswer,
      inventory,
      craftSword,
      buildHouse,
      mineStone,
      useKey,
      feedAnimal,
      buildFence,
      worldObjects
    }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => useContext(GameStateContext);
