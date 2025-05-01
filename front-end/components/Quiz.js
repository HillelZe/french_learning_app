import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import FrenchKeyboard from "./frenchKeyboard";
import EditSynonyms from "./EditSynonyms";
//this function gets an array and a fraction,
//and returns a randomely picked fraction of the original array.
function randomSubArray(arr, frac) {
  let num;
  const length = arr.length;
  for (let i = 0; i < length * (1 - frac); i++) {
    num = Math.floor(Math.random() * arr.length);
    arr.splice(num, 1);
  }
  return arr;
}
//this function gets an array of words rated from 0-5 and creates a sub array that includes
//different ratio of words from each group according to their rating.
function createQuiz(db) {
  const ltw = db.filter((item) => item.lastTimeWrong);
  const g0 = db.filter((item) => item.rate === 0);
  const g1 = db.filter((item) => item.rate === 1);
  const g2 = db.filter((item) => item.rate === 2);
  let g3 = db.filter((item) => item.rate === 3);
  g3 = randomSubArray(g3, 1 / 3);
  let g4 = db.filter((item) => item.rate === 4);
  g4 = randomSubArray(g4, 1 / 5);
  let g5 = db.filter((item) => item.rate === 5);
  g5 = randomSubArray(g5, 1 / 25); //temporary change
  let total = [...g0, ...g1, ...g2, ...g3, ...g4, ...g5];
  //add every word that the user answered wrongly in his last quiz
  for (let key in ltw)
    if (!total.includes(ltw[key])) {
      total.push(ltw[key]);
    }
  return total;
}
let numOfQuestions;
function Quiz({ db, setStatus, setStat }) {
  const numOfPermitedTries = 2;
  const maxRate = 5;
  const [wordsSet, setWordsSet] = useState(createQuiz(db));
  const [currentWord, setCurrentWord] = useState(getNewWord(wordsSet));
  const [answerIsCorrect, setAnswerIsCorrect] = useState(false);
  const [numOfTries, setNumOfTries] = useState(1);
  const [answer, setAnswer] = useState("");
  const [showEditSynonyms, setShowEditSynonyms] = useState(false);
  const [numOfCorrectAnswer, setNumOfCorrectAnswer] = useState(0);
  //is there a way delete this state and use only inputRef.current.selectionStart?
  const [cursorLocation, setCursorLocation] = useState(null); //this state is used for the virtual key board.
  const inputRef = useRef(null);
  let newWordsSet;
  function currentDay() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // Note: Months start from 0 (January is 0, February is 1, and so on)
    const day = currentDate.getDate();
    return `${day}.${month}.${year}`;
  }

  //this function update the rate of a word, and lastTimeWrong
  async function updateRate(wordID, newRate, lastTimeWrong) {
    try {
      const apiEndpoint =
        "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/updateRate";

      const dataToSend = {
        wordID: wordID,
        newRate: newRate,
        lastTimeWrong: lastTimeWrong,
      };
      console.log(dataToSend);
      const response = await axios.post(apiEndpoint, dataToSend);
      console.log(response.data);
    } catch (err) {
      console.error("Error updating word rate:", err);
      throw err;
    }
  }
  //this function add 1 from the rate of the current word
  function updateUp(wordID, currentRate) {
    updateRate(wordID, currentRate + 1, false);
  }
  //this function subtract 1 from the rate of the current word
  function updateDown(wordID, currentRate) {
    updateRate(wordID, currentRate - 1, true);
  }

  //this function gets a french word and read it out loud
  function wordToSpeak(word) {
    if ("speechSynthesis" in window) {
      var utterance = new SpeechSynthesisUtterance();
      utterance.text = word;
      utterance.lang = "fr-FR";
      speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in this browser.");
    }
  }
  //the function get a data base of words and returns a random word
  function getNewWord(dataBase) {
    const num = Math.floor(Math.random() * dataBase.length);
    const newWord = dataBase[num];
    return newWord;
  }
  function handleSubmit(e) {
    e.preventDefault();
    //if it wasnt already answered correctly
    if (!answerIsCorrect) {
      //if the current answer is correct
      if (answer.toLowerCase() === currentWord.french.toLowerCase()) {
        wordToSpeak(currentWord.french);
        setAnswerIsCorrect(true);

        setNumOfCorrectAnswer(numOfCorrectAnswer + 1);
        if (
          numOfTries === 1 &&
          currentWord.rate < maxRate &&
          currentWord.updateDate !== currentDay()
        ) {
          updateUp(currentWord.ID, currentWord.rate);
        }
      } else {
        if (numOfTries === numOfPermitedTries) {
          wordToSpeak(currentWord.french);
        }
        if (numOfTries === numOfPermitedTries + 1) {
          if (currentWord.rate > 0) {
            updateDown(currentWord.ID, currentWord.rate);
          }
          //delete the previous word.
          newWordsSet = [
            ...wordsSet.slice(0, wordsSet.indexOf(currentWord)),
            ...wordsSet.slice(wordsSet.indexOf(currentWord) + 1),
          ];
          setWordsSet(newWordsSet);
          setCurrentWord(getNewWord(newWordsSet));
          setAnswerIsCorrect(false);
          setNumOfTries(1);
          setAnswer("");
          return;
        }
        setNumOfTries(numOfTries + 1);
      }
    } else {
      //if it was answered correctly fetch the next word
      //delete the previous word.
      newWordsSet = [
        ...wordsSet.slice(0, wordsSet.indexOf(currentWord)),
        ...wordsSet.slice(wordsSet.indexOf(currentWord) + 1),
      ];
      setWordsSet(newWordsSet);
      setCurrentWord(getNewWord(newWordsSet));
      setAnswerIsCorrect(false);
      setNumOfTries(1);
      setAnswer("");
    }
  }
  //this function handle an insertion of a char from the virtual keyboard
  function insertChar(char) {
    if (inputRef.current.selectionStart === inputRef.current.selectionEnd) {
      setAnswer(
        answer.substring(0, inputRef.current.selectionStart) +
          char +
          answer.substring(inputRef.current.selectionStart)
      );
    } else {
      setAnswer(
        answer.substring(0, inputRef.current.selectionStart) +
          char +
          answer.substring(inputRef.current.selectionEnd)
      );
    }
    // Update the cursor position after the component re-renders
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          cursorLocation + 1,
          cursorLocation + 1
        );
      }
    }, 0);
    setCursorLocation(cursorLocation + 1);
  }
  useEffect(() => {
    numOfQuestions = wordsSet.length;
  }, []);
  //questions are over
  if (wordsSet.length === 0) {
    setStat(
      `${numOfCorrectAnswer}/${numOfQuestions} correct answers. Your grade is ${Math.round(
        (100 * numOfCorrectAnswer) / numOfQuestions
      )}!`
    );
    setStatus("memorize"); //changing the status also refetch the db for the next quiz
    return;
  }
  return (
    <form className="tab-content" onSubmit={handleSubmit}>
      <h4 className="num-of-questions">{`question left: ${wordsSet.length}`}</h4>

      <label style={{ gridColumn: "2/3", margin: "9px 0px", Align: "right" }}>
        word:
      </label>
      <input
        style={{ textAlign: "right", gridColumnStart: 3 }}
        type="text"
        value={currentWord.hebrew}
        disabled
      />
      <label
        style={{
          gridColumn: "1/3",
          gridRowStart: 3,
          Align: "right",
          margin: "9px 0px",
        }}
      >
        answer:
      </label>
      <input
        style={{ gridColumnStart: 3, gridRowStart: 3 }}
        type="text"
        ref={inputRef}
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setCursorLocation(e.target.selectionStart);
        }}
        onClick={(e) => setCursorLocation(e.target.selectionStart)}
      />
      <div
        className="info"
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          alignItems: "center",
          columnGap: "10px",
        }}
      >
        <label>
          {answerIsCorrect
            ? "you are correct!"
            : numOfTries > 1 && numOfTries <= numOfPermitedTries
            ? "try again"
            : numOfTries === numOfPermitedTries + 1
            ? `wrong answer. the correct answer is: ${currentWord.french}`
            : ""}
        </label>
        <label>
          {currentWord.synonyms &&
            currentWord.synonyms.length > 0 &&
            `Synonyms: ${currentWord.synonyms.join(", ")}`}
        </label>
      </div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginTop: "16px",
          gridColumn: "1 / -1", // span all columns
        }}
      >
        <button
          style={{
            width: 100,
            height: 20,
          }}
        >
          {answerIsCorrect || numOfTries > numOfPermitedTries
            ? "Next"
            : "Submit"}
        </button>
        {answerIsCorrect ||
          (numOfTries > numOfPermitedTries && (
            <button
              type="button"
              onClick={() => setShowEditSynonyms(true)}
              style={{
                //justifySelf: "center",
                width: 120,
                height: 20,
              }}
            >
              Edit Synonyms
            </button>
          ))}
        {(answerIsCorrect || numOfTries > numOfPermitedTries) && (
          <button
            className="speaker-botton"
            type="button"
            onClick={() => wordToSpeak(currentWord.french)}
          >
            &#128266;
          </button>
        )}
      </div>

      <div
        style={{
          gridRow: 5,
          gridColumn: "1 / 5",
        }}
      >
        <FrenchKeyboard insertChar={insertChar} />
      </div>

      {showEditSynonyms && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <button
              type="button"
              onClick={() => setShowEditSynonyms(false)}
              style={{ float: "right" }}
            >
              X
            </button>
            <h3>Edit Synonyms</h3>
            <EditSynonyms currentWord={currentWord} />
          </div>
        </div>
      )}
    </form>
  );
}
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "300px",
  position: "relative",
};
export default Quiz;
