import { Outlet, useParams } from 'react-router-dom';
import LocalSidebar from './local-sidebar';
import GovernmentPageContainer from '../../government-page-container';

export default function LocalLayout() {
  const { region } = useParams<{ region: string }>();

  return (
    <GovernmentPageContainer sidebar={<LocalSidebar currentRegion={region} />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
