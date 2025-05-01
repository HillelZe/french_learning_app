import React, { useState } from "react";
import axios from "axios";
function removeNikkud(word) {
  const nikkudPattern = /[\u0591-\u05C7\u05F0-\u05F4]/g;
  return word.replace(nikkudPattern, "");
}
async function translate(from, to, word) {
  const endpoint =
    "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/translate";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        word: word,
        src_lang: from,
        dest_lang: to,
      }),
    });

    if (!response.ok) {
      throw new Error("Lambda call failed");
    }

    const data = await response.json();

    return removeNikkud(JSON.parse(data.body).translated_word);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function checkGender(wordToCheck) {
  const apiUrl =
    "https://90jpr65pzf.execute-api.eu-north-1.amazonaws.com/prod/checknoun";

  const requestData = {
    word: wordToCheck,
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  };

  try {
    const response = await fetch(apiUrl, requestOptions);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log(data.body.gender);
    // Return the gender value
    return data.body.gender;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    // Handle errors here or return an error message
    return null;
  }
}

function AddWord({ userId, setUpdated, setQuizStatus, idToken }) {
  const [hebrew, setHebrew] = useState("");
  const [french, setFrench] = useState("");
  const [status, setStatus] = useState("");
  const [currentWordNum, setCurrentWordNum] = useState(null);
  // this function gets a word and its translation and add it to the database
  async function addNewWord(hebrew, french) {
    try {
      const apiEndpoint =
        "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/add-word";

      const dataToSend = {
        hebrew: hebrew,
        french: french,
        userID: userId,
      };
      console.log(dataToSend);
      const response = await axios.post(apiEndpoint, dataToSend, {
        headers: { Authorization: idToken },
      });

      const responseData = response.data;
      return responseData;
    } catch (error) {
      console.error("Error sending data to Lambda function", error);
    }
  }
  async function handleTranslteFromHebrew() {
    const translation = await translate("he", "fr", hebrew);
    const gender = await checkGender(translation);
    if (gender === "masculine") {
      setFrench("un " + translation);
      setHebrew(hebrew + " (שם עצם)");
    } else if (gender === "feminine") {
      setFrench("une " + translation);
      setHebrew(hebrew + " (שם עצם)");
    } else setFrench(translation);
  }
  async function handleTranslteFromFrench() {
    const gender = await checkGender(french);
    const translation = await translate("fr", "he", french);
    if (gender === "masculine") {
      setFrench("un " + french);
      setHebrew(translation + " (שם עצם)");
    } else if (gender === "feminine") {
      setFrench("une " + french);
      setHebrew(translation + " (שם עצם)");
    } else setHebrew(translation);
  }
  function handleSubmit(e) {
    e.preventDefault();
    addNewWord(hebrew, french)
      .then((responseData) => {
        if (responseData["body-json"]["statusCode"] === 200) {
          setUpdated(false);
          setQuizStatus("memorize");
          setStatus("word added successfully!");
          setFrench("");
          setHebrew("");
        } else if (responseData["body-json"]["statusCode"] === 400)
          setStatus("word already exist!");
      })
      .catch((error) => {
        // Handle the error case
        setStatus("failed, try again.");
        console.error("Function ended with an error:", error);
      });
  }
  async function handleNextWord() {
    try {
      const apiEndpoint =
        "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/getCurrentWord";

      const dataToSend = {
        userID: userId,
      };
      console.log(dataToSend);
      const response = await axios.post(apiEndpoint, dataToSend);
      const responseData = response.data;
      console.log(responseData["body"]["current_word"]);
      setFrench(responseData["body"]["current_word"]["french"]);
      setHebrew(responseData["body"]["current_word"]["hebrew"]);
      setCurrentWordNum(responseData["body"]["current_word"]["ID"]);
    } catch (error) {
      console.error("Error fetching word", error);
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>add word</h2>
      <label>hebrew</label>
      <input
        type="text"
        value={hebrew}
        onChange={(e) => setHebrew(e.target.value)}
      />
      <button type="button" onClick={() => handleTranslteFromHebrew()}>
        &#8594;
      </button>
      <button type="button" onClick={() => handleTranslteFromFrench()}>
        &#8592;
      </button>
      <label>french</label>
      <input
        type="text"
        value={french}
        onChange={(e) => setFrench(e.target.value)}
      />

      <button> add </button>
      <button type="button" onClick={() => handleNextWord()}>
        next
      </button>
      <label>{status}</label>
    </form>
  );
}
export default AddWord;
