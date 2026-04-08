import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Routines from "./pages/Routines";
import Learning from "./pages/Learning";
import Skills from "./pages/Skills";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Journal from "./pages/Journal";
import SearchPage from "./pages/Search";
import StoryPage from "./pages/Story";
import StoriesPage from "./pages/Stories";
import ChatPage from "./pages/Chat";
import SettingsPage from "./pages/Settings";
import HealthPage from "./pages/Health";
import TodosPage from "./pages/Todos";
import LedgerPage from "./pages/Ledger";
import CheckupsPage from "./pages/Checkups";
import GetStartedPage from "./pages/GetStarted";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
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
      </BrowserRouter>
    </ErrorBoundary>
  );
}
