import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import Dashboard from './pages/Dashboard';
import RoomManagement from './pages/RoomManagement';
import FloorView from './pages/FloorView';
import GuestManagement from './pages/GuestManagement';
import BookingManagement from './pages/BookingManagement';
import PlatformManagement from './pages/PlatformManagement';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import SettingsPage from './pages/Settings';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'rooms', label: '房间管理' },
  { key: 'floor-view', label: '楼层视图' },
  { key: 'guests', label: '客人管理' },
  { key: 'bookings', label: '预订管理' },
  { key: 'platforms', label: '平台管理' },
  { key: 'analytics', label: '数据分析' },
  { key: 'ai-assistant', label: 'AI助手' },
  { key: 'settings', label: '系统设置' },
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState('dashboard');

  const renderContent = () => {
    switch (activeKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'rooms':
        return <RoomManagement />;
      case 'floor-view':
        return <FloorView />;
      case 'guests':
        return <GuestManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'platforms':
        return <PlatformManagement />;
      case 'analytics':
        return <Analytics />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: 20
        }}>
          {!collapsed ? (
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>AI-Inn</span>
          ) : (
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>A</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems.map(item => ({
            key: item.key,
            label: item.label,
          }))}
          onClick={({ key }) => setActiveKey(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 64, height: 64 }}
            >
              {collapsed ? '展开' : '收起'}
            </Button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{menuItems.find(m => m.key === activeKey)?.label}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                管
              </div>
              {!collapsed && <span>管理员</span>}
            </div>
          </div>
        </Header>
        <Content style={{ padding: 24, margin: 24, background: '#f0f2f5', borderRadius: 8 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
