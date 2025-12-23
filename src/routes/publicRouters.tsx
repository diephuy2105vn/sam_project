import CreateProjectPage from "../pages/CreateProjectPage";
import HomePage from "../pages/HomePage";
import ProjectOnly from "../pages/ProjectOnly";

const publicRouters = [
  {
    path: "/project/:projectId",
    element: <ProjectOnly />,
  },
  {
    path: "/project/create",
    element: <CreateProjectPage />,
  },
  {
    path: "/",
    element: <HomePage />,
  },
];
export default publicRouters;
