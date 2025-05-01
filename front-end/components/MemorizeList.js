import React from "react";

function MemorizeList({ words, setStatus }) {
  function handleStartQuiz() {
    setStatus("quiz");
  }
  return (
    <div>
      <h3>Words to memorize:</h3>
      <table>
        <tbody>
          {words?.map((item, index) => (
            <tr key={index}>
              <td>{item.french}</td>
              <td style={{ textAlign: "right" }}>{item.hebrew}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleStartQuiz}>Start Quiz</button>
    </div>
  );
}

export default MemorizeList;
