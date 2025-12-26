import HomePage from "../pages/HomePage";
import ProjectOnly from "../pages/ProjectOnly";

const publicRouters = [
  {
    path: "/project/:projectId",
    element: <ProjectOnly />,
  },

  {
    path: "/",
    element: <HomePage />,
  },
];
export default publicRouters;
