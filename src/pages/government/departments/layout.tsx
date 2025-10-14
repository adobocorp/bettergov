import { Outlet } from 'react-router-dom';
import DepartmentsSidebar from './components/departments-sidebar';
import GovernmentPageContainer from '../government-page-container';

export default function DepartmentsPageLayout() {
  return (
    <GovernmentPageContainer sidebar={<DepartmentsSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
