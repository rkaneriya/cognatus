import {Button, Drawer, Form, Input, Typography} from 'antd';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function NewTreeDrawer(props) {
  const { 
    onClose, 
    onFinish,
    visible, 
  } = props; 

  return (
    <Drawer 
      title="Create new tree" 
      placement="right"
      onClose={onClose} 
      visible={visible}
    >
      <Form {...layout} name="nest-messages" onFinish={onFinish}>
        <Form.Item name={['name']} label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={['description']} label="Description" rules={[{ required: true }]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  ); 
}