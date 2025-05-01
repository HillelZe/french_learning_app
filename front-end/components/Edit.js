import { useState, useEffect } from "react";
import axios from "axios";
export default function Edit({ db, setUpdated }) {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);

  function handleSearch() {
    const filtered = db.filter(
      (item) =>
        item.french.toLowerCase().includes(search.toLowerCase()) ||
        item.hebrew.toLowerCase().includes(search.toLowerCase())
    );

    setResult(filtered);
  }
  async function onUpdate(french, hebrew, userID, ID, setWordUpdatedStatus) {
    try {
      const response = await modifyWord(hebrew, french, userID, ID);
      console.log(response);

      if (response?.statusCode === 200) {
        setUpdated(false);
        setWordUpdatedStatus("Word updated successfully");
      } else throw new Error("Server returned status " + response.statusCode);
    } catch (error) {
      console.error("Error updating word:", error);
      setWordUpdatedStatus("Error updating word.");
    }
  }
  async function onDelete(userID, ID) {
    try {
      const response = await deleteWord(userID, ID);
      console.log(response);

      if (response?.statusCode === 200) {
        setUpdated(false);
        setResult((prev) => prev.filter((item) => item.ID !== ID));
      } else throw new Error("Server returned status " + response.statusCode);
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2>search</h2>
        <input type="text" onChange={(e) => setSearch(e.target.value)} />
        <button type="button" onClick={() => handleSearch()}>
          Go
        </button>
      </div>
      {result.length !== 0 &&
        result?.map((item, index) => (
          <ResultItem
            key={item.ID}
            onDelete={onDelete}
            onUpdate={onUpdate}
            hebrewWord={item.hebrew}
            frenchWord={item.french}
            ID={item.ID}
            userID={item.userID}
          />
        ))}
    </div>
  );
}
function ResultItem({
  onDelete,
  onUpdate,
  frenchWord,
  hebrewWord,
  ID,
  userID,
}) {
  const [french, setFrench] = useState(frenchWord);
  const [hebrew, setHebrew] = useState(hebrewWord);
  const [wordUpdateStatus, setWordUpdateStatus] = useState("");
  return (
    <div>
      <input value={french} onChange={(e) => setFrench(e.target.value)} />
      <input
        style={{ textAlign: "right" }}
        value={hebrew}
        onChange={(e) => setHebrew(e.target.value)}
      />
      <button
        type="button"
        onClick={() =>
          onUpdate(french, hebrew, userID, ID, setWordUpdateStatus)
        }
      >
        update
      </button>
      <button type="button" onClick={() => onDelete(userID, ID)}>
        delete
      </button>
      <label>{wordUpdateStatus}</label>
    </div>
  );
}
async function modifyWord(hebrew, french, userID, ID) {
  try {
    const apiEndpoint =
      "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/modifyWord";

    const dataToSend = {
      hebrew: hebrew,
      french: french,
      userID: userID,
      ID: ID.toString(),
    };
    console.log(dataToSend);
    const response = await axios.post(apiEndpoint, dataToSend);
    const responseData = response.data;
    return responseData;
  } catch (error) {
    console.error("Error sending data to Lambda function", error);
  }
}
async function deleteWord(userID, ID) {
  try {
    const apiEndpoint =
      "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/deleteWord";

    const dataToSend = {
      userID: userID,
      ID: ID.toString(),
    };
    console.log(dataToSend);
    const response = await axios.post(apiEndpoint, dataToSend);
    const responseData = response.data;
    return responseData;
  } catch (error) {
    console.error("Error sending data to Lambda function", error);
  }
}
