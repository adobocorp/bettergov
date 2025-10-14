import { Outlet } from 'react-router-dom';
import DiplomaticSidebar from './components/diplomatic-sidebar';
import GovernmentPageContainer from '../government-page-container';

export default function DiplomaticPageLayout() {
  return (
    <GovernmentPageContainer sidebar={<DiplomaticSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
