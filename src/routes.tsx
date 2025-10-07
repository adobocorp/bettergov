import NotFound from './pages/NotFound.tsx';
import Home from './pages/Home.tsx';
import Layout from './Layout.tsx';
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        path: '/',
        element: <Home />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
