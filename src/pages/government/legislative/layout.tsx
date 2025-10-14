import { Outlet } from 'react-router-dom';
import LegislativeSidebar from './components/legislative-sidebar';
import GovernmentPageContainer from '../government-page-container';

export default function LegislativePageLayout() {
  return (
    <GovernmentPageContainer sidebar={<LegislativeSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
