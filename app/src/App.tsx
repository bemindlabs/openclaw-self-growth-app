import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Routines = lazy(() => import("./pages/Routines"));
const Learning = lazy(() => import("./pages/Learning"));
const Skills = lazy(() => import("./pages/Skills"));
const Goals = lazy(() => import("./pages/Goals"));
const Habits = lazy(() => import("./pages/Habits"));
const Journal = lazy(() => import("./pages/Journal"));
const SearchPage = lazy(() => import("./pages/Search"));
const StoryPage = lazy(() => import("./pages/Story"));
const StoriesPage = lazy(() => import("./pages/Stories"));
const ChatPage = lazy(() => import("./pages/Chat"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const HealthPage = lazy(() => import("./pages/Health"));
const TodosPage = lazy(() => import("./pages/Todos"));
const LedgerPage = lazy(() => import("./pages/Ledger"));
const CheckupsPage = lazy(() => import("./pages/Checkups"));
const GetStartedPage = lazy(() => import("./pages/GetStarted"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<div className="flex h-screen items-center justify-center" />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="routines" element={<Routines />} />
              <Route path="habits" element={<Habits />} />
              <Route path="todos" element={<TodosPage />} />
              <Route path="health" element={<HealthPage />} />
              <Route path="checkups" element={<CheckupsPage />} />
              <Route path="learning" element={<Learning />} />
              <Route path="skills" element={<Skills />} />
              <Route path="goals" element={<Goals />} />
              <Route path="journal" element={<Journal />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="stories" element={<StoriesPage />} />
              <Route path="stories/new" element={<StoryPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="get-started" element={<GetStartedPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
