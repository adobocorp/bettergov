import { Outlet } from 'react-router-dom';
import ConstitutionalSidebar from './components/constitutional-sidebar';
import GovernmentPageContainer from '../government-page-container';

export default function ConstitutionalPageLayout() {
  return (
    <GovernmentPageContainer sidebar={<ConstitutionalSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
