import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import EmailVerify from "./components/EmailVerify"; // ✅ New import
import ChatPage from "./components/ChatPage";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<Feed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>

          {/* ✅ Email verification route */}
          <Route path="/verify-email/:token" element={<EmailVerify />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
