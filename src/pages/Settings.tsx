import { Card, Form, Input, Select, Switch, Button, Row, Col } from 'antd';

const SettingsPage = () => {
  const [form] = Form.useForm();

  form.setFieldsValue({
    hotelName: 'AI-Inn智能民宿',
    hotelAddress: '北京市朝阳区科技园区88号',
    hotelPhone: '010-88888888',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    autoSync: true,
    autoUpdateStatus: true,
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
  });

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Saved settings:', values);
      alert('设置已保存');
    });
  };

  return (
    <div>
      <Card title="基本设置">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="民宿名称" name="hotelName" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="hotelPhone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="民宿地址" name="hotelAddress">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="入住时间" name="checkInTime">
                <Input placeholder="例如：14:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="退房时间" name="checkOutTime">
                <Input placeholder="例如：12:00" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="货币" name="currency">
                <Select>
                  <Select.Option value="CNY">人民币 (CNY)</Select.Option>
                  <Select.Option value="USD">美元 (USD)</Select.Option>
                  <Select.Option value="EUR">欧元 (EUR)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="时区" name="timezone">
                <Select>
                  <Select.Option value="Asia/Shanghai">Asia/Shanghai</Select.Option>
                  <Select.Option value="UTC">UTC</Select.Option>
                  <Select.Option value="America/New_York">America/New_York</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="自动化设置" style={{ marginTop: 16 }}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="自动同步订单" name="autoSync" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="自动更新房态" name="autoUpdateStatus" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Button type="primary" onClick={handleSave}>
            保存设置
          </Button>
        </Col>
        <Col span={12}>
          <Button>
            恢复默认设置
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
