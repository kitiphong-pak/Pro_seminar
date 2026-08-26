import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import RequireAuth from "./components/RequireAuth";

const NotFound = lazy(() => import("./pages/NotFound"));
const CoffeeBean = lazy(() => import("./pages/CoffeeBean"));
const CoffeeMenu = lazy(() => import("./pages/CoffeeMenu"));
const WorldCoffee = lazy(() => import("./pages/WorldCoffee"));
const History = lazy(() => import("./pages/History"));
const GeneCoffee = lazy(() => import("./pages/GeneCoffee"));
const Roasting = lazy(() => import("./pages/Roasting"));
const Articles = lazy(() => import("./pages/Articles"));
const Profile = lazy(() => import("./pages/Profile"));
const Process = lazy(() => import("./pages/Process"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Extraction = lazy(() => import("./pages/Extraction"));
const Suggestion = lazy(() => import("./pages/Suggestion"));
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizDetail = lazy(() => import("./pages/QuizDetail"));
// simulator เดิม — ปิดชั่วคราว
// import Select from "./simulator/Select";
// import Customcoffee from "./simulator/Espresso";
const BrewSimulator = lazy(() => import("./simulator2/BrewSimulator"));

function PageLoading() {
  return (
    <div className="min-h-screen bg-beige-light dark:bg-dark-brown flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-dark-brown dark:border-brown-superlight border-t-transparent animate-spin" />
    </div>
  );
}

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
      <Suspense fallback={<PageLoading />}>
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
      </Suspense>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
