import templates from '../data/templates.json';

const dictionary = {
  "[person]": ["דני", "יוסי", "רוני", "משה"],
  "[person1]": ["דני", "יוסי", "רוני", "משה"],
  "[person2]": ["אבי", "רון", "גיא", "חיים"],
  "[person3]": ["שלמה", "יעקב", "אלי", "דוד"],
  "[container]": ["כוס", "קערה", "בקבוק", "כד"],
  "[drink1]": ["קפה", "תה", "מיץ", "שוקו"],
  "[drink2]": ["חלב", "מים", "סוכר", "קולה"],
  "[fraction1]": ["שישית", "חמישית", "רבע", "שליש"],
  "[fraction2]": ["שליש", "חצי", "רבע"],
  "[fraction3]": ["חצי", "שליש", "רבע"],
  "[workplace]": ["מפעל", "מוסך", "נגרייה"],
  "[workers]": ["פועלים", "עובדים", "טכנאים"],
  "[worker]": ["פועל", "עובד", "טכנאי"],
  "[time1]": ["שעתיים", "שלוש שעות", "ארבע שעות"],
  "[time2]": ["5 שעות", "6 שעות", "4 שעות"],
  "[time3]": ["5 שעות", "4 שעות", "6 שעות"],
  "[time4]": ["שעתיים", "שלוש שעות", "4 שעות"],
  "[total_items1]": ["74", "80", "90"],
  "[total_items2]": ["73", "82", "91"],
  "[sum]": ["1244", "1500", "2000"],
  "[digit]": ["3", "4", "5"],
  "[position]": ["ימני", "שמאלי"],
  "[shape]": ["מעגל", "ריבוע", "משולש", "מצולע"],
  "[number]": ["חמישה", "שישה", "שבעה"],
  "[number1]": ["13", "15", "20", "שלושה"],
  "[number2]": ["12", "14", "10"],
  "[result]": ["74", "100", "150"]
};

// Simple pseudo-random hash to keep options consistent for a specific question text
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export const generateQuestion = (index) => {
  const templateObj = templates[index % templates.length];
  let text = templateObj.template;
  
  // Replace all placeholders dynamically
  const regex = /\[.*?\]/g;
  text = text.replace(regex, (match) => {
    if (dictionary[match]) {
      const options = dictionary[match];
      return options[Math.floor(Math.random() * options.length)];
    }
    return "X"; // Fallback
  });

  const h = hashString(text);
  
  // Generate some plausible options based on the question type
  let options = [];
  if (text.includes("יותר")) {
    options = [dictionary["[drink1]"][0], dictionary["[drink2]"][0], "שתה כמות שווה", "לא ניתן לדעת"];
  } else if (text.includes("מהם שני המספרים")) {
    options = [`${(h % 900) + 100}, ${(h % 50) + 10}`, `${(h % 800) + 100}, ${(h % 40) + 10}`, "1000, 244", "לא קיימים"];
  } else if (text.includes("הספק")) {
    options = [`10, 15`, `12, 14`, `8, 20`, `לא ניתן לדעת`];
  } else if (text.includes("מתי יחלוף")) {
    options = ["13:00", "14:00", "12:30", "אף פעם"];
  } else {
    options = [`${h % 100}`, `${(h % 100) + 5}`, `${(h % 100) + 10}`, "לא ניתן לדעת"];
  }
  
  // Shuffle options and pick correct index
  const correctIndex = h % 4;
  // Swap the first option (which might be the generated 'correct' one) to the correct index
  const temp = options[0];
  options[0] = options[correctIndex];
  options[correctIndex] = temp;

  return {
    questionText: text,
    category: "לוגיקה (פרוצדורלי)",
    options: options,
    correctIndex: correctIndex
  };
};
