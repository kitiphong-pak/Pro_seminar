import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import CoffeeBean from "./pages/CoffeeBean";
import CoffeeMenu from "./pages/CoffeeMenu";
import WorldCoffee from "./pages/WorldCoffee";
import History from "./pages/History";
import GeneCoffee from "./pages/GeneCoffee";
import Roasting from "./pages/Roasting";
import Articles from "./pages/Articles";
import Profile from "./pages/Profile";
import Process from "./pages/Process";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Extraction from "./pages/Extraction";
import Suggestion from "./pages/Suggestion";
import Quiz from "./pages/Quiz";
import QuizDetail from "./pages/QuizDetail";
import Select from "./simulator/Select";
import Customcoffee from "./simulator/Espresso";
import { Helmet } from "react-helmet";

function App() {
  return (
    <BrowserRouter>
      {/* Move Helmet outside of Routes */}
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2DhKNuXjbwN5th9XDEK7N+OaXsmRnN4p5bKf8Eh6D6+Kfh2wLyoe2B+mN2zSts3ug=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Helmet>
      <Routes>
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Home />} />

        <Route path="/history" element={<History />} />
        <Route path="/geneCoffee" element={<GeneCoffee />} />
        <Route path="/roasting" element={<Roasting />} />
        <Route path="/extraction" element={<Extraction />} />
        <Route path="/process" element={<Process />} />
        <Route path="/worldCoffee" element={<WorldCoffee />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/coffee_bean" element={<CoffeeBean />} />

        <Route path="/coffee_menu" element={<CoffeeMenu />} />

        <Route path="/select" element={<Select/>}/>

        <Route path="/customcoffee" element={<Customcoffee/>} />

        <Route path="/suggestion" element={<Suggestion />} />

        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/:id" element={<QuizDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
