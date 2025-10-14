import { Outlet } from 'react-router-dom';
import ExecutiveSidebar from './components/executive-sidebar';
import GovernmentPageContainer from '../government-page-container';

export default function ExecutiveLayout() {
  return (
    <GovernmentPageContainer sidebar={<ExecutiveSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
