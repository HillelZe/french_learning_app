import { useState, useEffect } from "react";
import { config as AWSConfig } from "aws-sdk";
import axios from "axios";
import Quiz from "./Quiz";
import Grammar from "./Grammar";
import AddWord from "./AddWord";
import SignIn from "./SignIn";
import MemorizeList from "./MemorizeList";
import Info from "./Info";
import Edit from "./Edit";

function Tab({ title, setActiveTab, activeTab }) {
  return (
    <button
      className={activeTab === title ? "tab active" : "tab"}
      onClick={() => setActiveTab(title)}
    >
      {title}
    </button>
  );
}
//
export default function App() {
  const [db, setDb] = useState(null); // holds the words data base
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("memorize");
  const [stat, setStat] = useState("");
  const [activeTab, setActiveTab] = useState("Quiz");
  const [updated, setUpdated] = useState(false); //when data is fetched its changed to true, when a new word is added to false
  const [idToken, setIdToken] = useState();
  useEffect(() => {
    // Function to retrieve the user's words
    async function getUserWords(userIDValue) {
      try {
        const apiEndpoint =
          "https://50q73u8je0.execute-api.eu-north-1.amazonaws.com/prod/getUserWords";

        const dataToSend = {
          userID: userIDValue,
        };
        console.log(dataToSend);
        const response = await axios.post(apiEndpoint, dataToSend);
        setDb(JSON.parse(response.data.body));
      } catch (err) {
        console.error("Error getting items:", err);
        throw err;
      }
    }

    if (userId) getUserWords(userId);
    setUpdated(true);
  }, [userId, status, updated]);

  return (
    <div>
      <Tab title="Quiz" activeTab={activeTab} setActiveTab={setActiveTab} />
      <Tab title="Grammar" activeTab={activeTab} setActiveTab={setActiveTab} />
      <Tab
        title="Add Words"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Tab title="Info" activeTab={activeTab} setActiveTab={setActiveTab} />
      <Tab title="Setting" activeTab={activeTab} setActiveTab={setActiveTab} />

      {!userId && (
        <SignIn setUserId={setUserId} setDb={setDb} setIdToken={setIdToken} />
      )}
      {activeTab === "Quiz" && db != null && status === "memorize" && (
        <div>
          <h4>{stat}</h4>
          <MemorizeList
            words={db.filter((item) => item.rate === 0 || item.lastTimeWrong)}
            setStatus={setStatus}
          />
        </div>
      )}
      {activeTab === "Quiz" && db != null && status === "quiz" && (
        <Quiz db={db} setStatus={setStatus} setStat={setStat} />
      )}
      {activeTab === "Grammar" && db != null && <Grammar words={db} />}
      {activeTab === "Add Words" && userId && (
        <div>
          <AddWord
            userId={userId}
            setUpdated={setUpdated}
            setQuizStatus={setStatus}
            idToken={idToken}
          />
          <Edit db={db} setUpdated={setUpdated} />
        </div>
      )}
      {activeTab === "Info" && db != null && <Info db={db} />}
    </div>
  );
}
