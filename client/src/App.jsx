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
// simulator เดิม — ปิดชั่วคราว
// import Select from "./simulator/Select";
// import Customcoffee from "./simulator/Espresso";
import BrewSimulator from "./simulator2/BrewSimulator";
import { HelmetProvider, Helmet } from "react-helmet-async";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA=="
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
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route path="/coffee_bean" element={<CoffeeBean />} />

        <Route path="/coffee_menu" element={<CoffeeMenu />} />

        {/* simulator เดิม — ปิดชั่วคราว
        <Route path="/select" element={<Select/>}/>
        <Route path="/customcoffee" element={<Customcoffee/>} />
        */}
        <Route path="/brew" element={<BrewSimulator />} />

        <Route path="/suggestion" element={<Suggestion />} />

        <Route path="/quiz" element={<Quiz />} />
        <Route
          path="/quiz/:id"
          element={
            <RequireAuth>
              <QuizDetail />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
