import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Switch, Row, Col, Tag } from 'antd';

const PlatformManagement = () => {
  const [platforms, setPlatforms] = useState([
    { id: '1', name: 'Booking.com', apiKey: '******', active: true, syncEnabled: true, lastSync: '2024-01-15 10:30' },
    { id: '2', name: 'Airbnb', apiKey: '******', active: true, syncEnabled: false, lastSync: '2024-01-14 15:20' },
    { id: '3', name: '美团民宿', apiKey: '******', active: true, syncEnabled: true, lastSync: '2024-01-15 09:15' },
    { id: '4', name: '携程', apiKey: '', active: false, syncEnabled: false, lastSync: '-' },
    { id: '5', name: '飞猪', apiKey: '******', active: true, syncEnabled: true, lastSync: '2024-01-15 11:00' },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<typeof platforms[0] | null>(null);
  const [form] = Form.useForm();

  const showModal = (platform?: typeof platforms[0]) => {
    if (platform) {
      setEditingPlatform(platform);
      form.setFieldsValue(platform);
    } else {
      setEditingPlatform(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingPlatform) {
        setPlatforms(platforms.map(p => p.id === editingPlatform.id ? { ...p, ...values } : p));
      } else {
        setPlatforms([...platforms, { ...values, id: Date.now().toString(), lastSync: '-' }]);
      }
      setIsModalVisible(false);
    });
  };

  const handleDelete = (id: string) => {
    setPlatforms(platforms.filter(p => p.id !== id));
  };

  const handleSync = (id: string) => {
    setPlatforms(platforms.map(p => 
      p.id === id ? { ...p, lastSync: new Date().toLocaleString('zh-CN') } : p
    ));
  };

  const handleToggle = (id: string, field: 'active' | 'syncEnabled') => {
    setPlatforms(platforms.map(p => 
      p.id === id ? { ...p, [field]: !p[field] } : p
    ));
  };

  return (
    <div>
      <Row style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={() => showModal()}>
          添加平台
        </Button>
      </Row>

      <Card>
        <Table
          dataSource={platforms}
          columns={[
            { title: '平台名称', dataIndex: 'name', key: 'name' },
            { title: 'API密钥', dataIndex: 'apiKey', key: 'apiKey' },
            { 
              title: '状态', 
              dataIndex: 'active', 
              key: 'active',
              render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                  {active ? '启用' : '禁用'}
                </Tag>
              ),
            },
            { 
              title: '自动同步', 
              dataIndex: 'syncEnabled', 
              key: 'syncEnabled',
              render: (sync: boolean, record: typeof platforms[0]) => (
                <Switch 
                  checked={sync} 
                  onChange={() => handleToggle(record.id, 'syncEnabled')}
                  disabled={!record.active}
                />
              ),
            },
            { title: '最后同步', dataIndex: 'lastSync', key: 'lastSync' },
            {
              title: '操作',
              key: 'actions',
              render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={() => showModal(record)}>编辑</Button>
                  <Button danger onClick={() => handleDelete(record.id)}>删除</Button>
                  <Button 
                    onClick={() => handleSync(record.id)}
                    disabled={!record.active}
                  >
                    同步
                  </Button>
                  <Switch 
                    checked={record.active} 
                    onChange={() => handleToggle(record.id, 'active')}
                  />
                </div>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingPlatform ? '编辑平台' : '添加平台'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="平台名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="API密钥" name="apiKey">
            <Input />
          </Form.Item>
          <Form.Item label="启用" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="自动同步" name="syncEnabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlatformManagement;
