import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DashboardPreview from "./components/DashboardPreview";
import LogoCloud from "./components/LogoCloud";
import Features from "./components/Features";
import Benefits from "./components/Benefits";
import HowItWorks from "./components/HowItWorks";
import Integrations from "./components/Integrations";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Comparison from "./components/Comparison";
import FAQ from "./components/FAQ";
import Blog from "./components/Blog";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import ShiftAuth from "./pages/auth";
import GoalIntake from "./components/GoalIntake";
import ShiftDash from "./pages/dash";
import DebriefScreen from "./components/DebriefScreen";
import ResultScreen from "./components/ResultScreen";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [view, setView] = useState<
    "landing" | "auth" | "goal" | "dash" | "debrief" | "result"
  >("landing");

  // Store data across screens
  const [goalData, setGoalData] = useState<{
    goal: string;
    roadmap: any;
  } | null>(null);
  const [debriefData, setDebriefData] = useState<any>(null);
  const [taskTitle, setTaskTitle] = useState("");

  // Handlers
  const handleGetStarted = () => setView("auth");
  const handleAuthSuccess = () => setView("goal");

  const handleGoalComplete = (goal: string, roadmap: any) => {
    setGoalData({ goal, roadmap });
    setTaskTitle(roadmap.todayTask?.title || "Build the landing page");
    setView("dash");
  };

  // 👇 NEW: Called from dashboard when focus session ends
  const handleFocusEnd = () => {
    setView("debrief");
  };

  // 👇 NEW: Called from debrief when submitted
  const handleDebriefComplete = (debrief: {
    rawText: string;
    link?: string;
    aiSummary: string;
  }) => {
    setDebriefData(debrief);
    setView("result");
  };

  // 👇 NEW: Called from result when "Done for today" is clicked
  const handleDoneToday = () => {
    setView("dash");
  };

  // Auth screen
  if (view === "auth") {
    return <ShiftAuth onAuthSuccess={handleAuthSuccess} />;
  }

  // Goal Intake
  if (view === "goal") {
    return <GoalIntake onComplete={handleGoalComplete} />;
  }

  // Debrief
  if (view === "debrief") {
    return (
      <DebriefScreen taskTitle={taskTitle} onComplete={handleDebriefComplete} />
    );
  }

  // Result
  if (view === "result") {
    return (
      <ResultScreen
        goal={goalData?.goal || "Launch your startup"}
        milestone={
          goalData?.roadmap?.milestones?.find(
            (m: any) => m.status === "current"
          )?.title || "Current milestone"
        }
        streak={6}
        debriefSummary={debriefData?.aiSummary || ""}
        onDone={handleDoneToday}
      />
    );
  }

  // Dashboard
  if (view === "dash") {
    return <ShiftDash goalData={goalData} onFocusEnd={handleFocusEnd} />;
  }

   // Landing page
   return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen">
        {/* Fixed ambient background, shared across the whole page */}
        <div className="shift-canvas">
          <div className="orb" style={{ width: 560, height: 560, top: -180, left: '8%', background: 'radial-gradient(circle, #8335FD, transparent 70%)' }} />
          <div className="orb" style={{ width: 480, height: 480, top: 260, right: '2%', background: 'radial-gradient(circle, #f2b84b, transparent 70%)', opacity: 0.14 }} />
          <div className="orb" style={{ width: 640, height: 640, bottom: -260, left: '30%', background: 'radial-gradient(circle, #4b3fb0, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero onGetStarted={handleGetStarted}/>
          <DashboardPreview />
          <LogoCloud />
          <Features />
          <HowItWorks />
          <Benefits />
          <Integrations />
          <Testimonials />
          <Comparison />
          <Pricing />
          <FAQ />
          <Blog />
          <Newsletter />
          <Footer />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;