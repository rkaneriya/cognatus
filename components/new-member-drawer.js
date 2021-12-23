import {Button, DatePicker, Drawer, Form, Input, Radio} from 'antd';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function NewMemberDrawer(props) {
  const { 
    onClose, 
    onFinish,
    title, 
    visible, 
  } = props; 

  return (
    <Drawer 
      title={title}
      placement="right"
      onClose={onClose} 
      visible={visible}
    >
      <Form {...layout} name="nest-messages" onFinish={onFinish}>
        <Form.Item name={'first_name'} label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={'last_name'} label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name={'maiden_name'} label="Maiden Name">
          <Input />
        </Form.Item>
        <Form.Item name={'nickname'} label="Nickname">
          <Input />
        </Form.Item>
        <Form.Item name={'email'} label="Email">
          <Input />
        </Form.Item>
        <Form.Item name={'is_male'} label="Sex" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio.Button value="true">Male</Radio.Button>
            <Radio.Button value="false" defaultChecked>Female</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name={'birth_date'} label="Birth Date" rules={[{ required: true }]}>
          <DatePicker /> 
        </Form.Item>
        <Form.Item name={'death_date'} label="Death Date">
          <DatePicker />
        </Form.Item>
        <Form.Item name={'notes'} label="Notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            Add
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  ); 
}