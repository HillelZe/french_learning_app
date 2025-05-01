import React from "react";

export default function FrenchKeyboard({ insertChar }) {
  const frenchChars = [
    "à",
    "â",
    "ç",
    "é",
    "è",
    "ê",
    "ë",
    "î",
    "ï",
    "ô",
    "ù",
    "û",
    "ü",
    "ÿ",
  ];

  function handleCharClick(e, char) {
    e.preventDefault();
    insertChar(char);
  }
  return (
    <div className="FrenchKeyBoard">
      {frenchChars.map((char, index) => (
        <button
          className="keys"
          type="button"
          key={index}
          onClick={(e) => handleCharClick(e, char)}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
