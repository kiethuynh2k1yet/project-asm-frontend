import {
  DashboardContainer,
  Sidebar,
  SidebarText,
  MainArea,
  Content,
} from "./dashboard.styles";

import HeaderPage from "@/components/layouts/Header/header";

export default function Dashboard() {
  return (
    <DashboardContainer>
      <Sidebar>
        <SidebarText>Sidebar</SidebarText>
      </Sidebar>

      <MainArea>
        <HeaderPage/>

        <Content>
          <h1>Nội dung chính</h1>
        </Content>
      </MainArea>
    </DashboardContainer>
  );
}