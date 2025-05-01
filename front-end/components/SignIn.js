import { useState } from "react";
import { Auth } from "aws-amplify";
import { amplifyConfig } from "../awsConfig";
import { jwtDecode } from "jwt-decode";
import { Amplify } from "aws-amplify";

// Configure Amplify (only once)
Amplify.configure(amplifyConfig);

function SignIn({ setUserId, setDb, setIdToken }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const signInToCognito = async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      if (idToken) {
        setIdToken(idToken);
        const decoded = jwtDecode(idToken);
        setUserId(decoded.sub);
      } else {
        console.error("No ID token found");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    await signInToCognito(userName, password);
  }

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
}

export default SignIn;
