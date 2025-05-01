import { useState } from "react";
import axios from "axios";
//grammar is the main component which include Quiz and setting.
//only one of them is shown at a given time.

export default function Grammar({ words }) {
  const [sentences, setSentences] = useState([]);
  return (
    //at the beginig Setting is active. when the user submit it and gets the
    //sentences its replaced by Quiz.
    <div>
      {sentences.length === 0 ? (
        <Setting words={words} setSentences={setSentences} />
      ) : (
        <Quiz sentences={sentences} setSentences={setSentences} />
      )}
    </div>
  );
}
function Quiz({ sentences, setSentences }) {
  const [curSentence, setCurSentence] = useState(
    sentences[sentences.length - 1] || ""
  );
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  //gets the feedback on the user answer from the api.
  async function getFeedback() {
    try {
      const payload = {
        sentence: curSentence,
        answer: answer,
      };
      console.log(payload);
      const response = await axios.post(
        "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/getSentanceFeedback",
        payload,
        { responseType: "text" }
      );
      console.log("POST response:", response.data);
      setFeedback(JSON.parse(response.data).body || response.data);
    } catch (error) {
      console.error("Error with POST request:", error);
    }
  }
  //submit the user answer
  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("waiting...");
    await getFeedback();
  }
  //load the next Sentence and erase the previous feedback and answer
  function handleNext(event) {
    event.preventDefault();
    setCurSentence(getNext());
    setFeedback("");
    setAnswer("");
  }
  //retrieve the next sentence from sentences and delete the old one.
  function getNext() {
    const ans = sentences[sentences.length - 2];
    setSentences(sentences.slice(0, -1));
    return ans;
  }
  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <h2>question left: {sentences.length}</h2>
      <textarea className="textarea-sentence" value={curSentence} readOnly />
      <textarea
        className="textarea-answer"
        onChange={(e) => {
          setAnswer(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (feedback.length !== 0) handleNext(e);
            else handleSubmit(e);
          }
        }}
        value={answer}
      />
      <textarea className="textarea-feedback" value={feedback} readOnly />

      {feedback.length === 0 ? (
        <button onClick={handleSubmit} style={{ width: `50px` }}>
          submit
        </button>
      ) : (
        <button onClick={handleNext} style={{ width: `50px` }}>
          Next
        </button>
      )}
    </form>
  );
}
function Setting({ words, setSentences }) {
  const [level, setLevel] = useState("A1");
  const [numOfQuestions, setNumOfQuestions] = useState(3);
  const [topics, setTopics] = useState([]);
  const grammarTopics = [
    "Present",
    "Pronominal Verbs",
    "Passé Composé",
    "Imparfait",
    "Futur Simple",
    "Futur Antérieur",
    "Plus-que-parfait",
    "Présent Conditionnel",
    "Past Conditionnel",
    "Present Subjunctive",
    "Past Subjunctive",
    "The Infinitif Mood",
    "Present Participle",
    "Gerund",
    "voix passive",
    "le discours indirect",
    "l'impératif",
  ];

  function handleCheckboxChange(topic) {
    if (topics.includes(topic)) {
      setTopics(topics.filter((item) => item !== topic));
    } else {
      setTopics([...topics, topic]);
    }
  }
  function getRandomWords(num) {
    const total = words.length;
    let ans = [];
    for (let i = 0; i < num; i++) {
      ans.push(words[Math.floor(Math.random() * total)].french);
    }
    return ans;
  }
  // Function to make a POST request
  async function handlePostRequest() {
    const wordsToUse = getRandomWords(numOfQuestions);
    try {
      const payload = {
        level: level,
        numOfQuestions: numOfQuestions,
        topics: topics,
        words: wordsToUse,
      };
      console.log(wordsToUse);
      const response = await axios.post(
        "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/getSentences",
        payload
      );

      const sentencesText = response.data.body;
      setSentences(
        sentencesText
          .substring(1, sentencesText.length - 1) //remove quotation marks
          .split("\\n")
      );

      console.log("POST response:", response.data);
    } catch (error) {
      console.error("Error with POST request:", error);
    }
  }
  function selectAll() {
    setTopics(grammarTopics);
  }
  return (
    <div>
      <h2>Level:</h2>
      <select
        name="level"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      >
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
      </select>

      <h2>Number of Questions:</h2>
      <input
        type="number"
        value={numOfQuestions}
        onChange={(e) => setNumOfQuestions(e.target.value)}
      />

      <h3>Choose Grammar Topics:</h3>
      <button onClick={selectAll}>select all</button>
      <div className="grammar-container">
        {grammarTopics.map((topic, index) => (
          <div key={index} className="grammar-item">
            <input
              type="checkbox"
              name={topic}
              checked={topics.includes(topic)}
              onChange={() => handleCheckboxChange(topic)}
            />
            <label>{topic}</label>
          </div>
        ))}
      </div>

      <button onClick={handlePostRequest}>Start</button>
    </div>
  );
}
