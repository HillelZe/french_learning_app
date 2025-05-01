import { useState } from "react";
import axios from "axios";
export default function EditSynonyms({ currentWord }) {
  const [newSynonyms, setNewSynonyms] = useState(currentWord.synonyms || []);
  const handleSynonymChange = (index, value) => {
    const updated = [...newSynonyms];
    updated[index] = value;
    setNewSynonyms(updated);
  };
  const handleSynonymdelete = (index) => {
    const updated = [...newSynonyms];
    updated.splice(index, 1);
    setNewSynonyms(updated);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {newSynonyms.length !== 0 &&
        newSynonyms?.map((item, index) => (
          <div key={index} style={{ display: "flex", gap: "8px" }}>
            <input
              value={item}
              onChange={(e) => handleSynonymChange(index, e.target.value)}
            />
            <button type="button" onClick={(e) => handleSynonymdelete(index)}>
              del
            </button>
          </div>
        ))}
      <button
        type="button"
        onClick={() => setNewSynonyms([...newSynonyms, ""])}
      >
        add
      </button>
      <button
        type="button"
        onClick={() => updateSynonyms(newSynonyms, currentWord.ID)}
      >
        save
      </button>
    </div>
  );
}
async function updateSynonyms(newSynonyms, ID) {
  try {
    const apiEndpoint =
      "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/updateSynonyms";

    const dataToSend = {
      synonyms: newSynonyms,
      ID: ID.toString(),
    };
    console.log(dataToSend);
    const response = await axios.post(apiEndpoint, dataToSend);
    const responseData = response.data;
    console.log(responseData);
    return responseData;
  } catch (error) {
    console.error("Error sending data to Lambda function", error);
  }
}
