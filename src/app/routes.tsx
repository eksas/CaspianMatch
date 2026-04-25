import { createBrowserRouter } from "react-router";
import { MarketingLayout } from "./layouts/marketing-layout";
import { AppLayout } from "./layouts/app-layout";
import { Landing } from "./pages/landing";
import { SignIn } from "./pages/sign-in";
import { SignUp } from "./pages/sign-up";
import { Browse } from "./pages/browse";
import { JobDetailPage } from "./pages/job-detail-page";
import { Profile } from "./pages/profile";
import { Nearby } from "./pages/nearby";
import { Interviewer } from "./pages/interviewer";
import { Mentor } from "./pages/mentor";
import { Reputation } from "./pages/reputation";
import { Community } from "./pages/community";
import { PublicProfile } from "./pages/public-profile";
import { EmployerDashboard } from "./pages/employer-dashboard";
import { PostVacancy } from "./pages/post-vacancy";
import { EmployerInbox } from "./pages/employer-inbox";
import { EmployerVacancies } from "./pages/employer-vacancies";
import { VouchPublic } from "./pages/vouch";
import { Gamification } from "./pages/gamification";
import { StressSimulator } from "./pages/stress-simulator";
import { NotFound } from "./pages/not-found";
import { RequireAuth } from "./lib/auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MarketingLayout,
    children: [
      { index: true, Component: Landing },
      { path: "sign-in", Component: SignIn },
      { path: "sign-up", Component: SignUp },
    ],
  },
  {
    path: "/app",
    Component: () => (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: Browse },
      { path: "browse", Component: Browse },
      { path: "jobs/:id", Component: JobDetailPage },
      { path: "nearby", Component: Nearby },
      { path: "interview", Component: Interviewer },
      { path: "mentor", Component: Mentor },
      { path: "reputation", Component: Reputation },
      { path: "community", Component: Community },
      { path: "simulator", Component: StressSimulator },
      { path: "u/:userId", Component: PublicProfile },
      { path: "rank", Component: Gamification },
      { path: "profile", Component: Profile },
      { path: "employer", Component: EmployerDashboard },
      { path: "employer/post", Component: PostVacancy },
      { path: "employer/inbox", Component: EmployerInbox },
      { path: "employer/vacancies", Component: EmployerVacancies },
    ],
  },
  { path: "/vouch/:userId", Component: VouchPublic },
  { path: "*", Component: NotFound },
]);
