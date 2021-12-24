import {Button, DatePicker, Drawer, Form, Input, Radio} from 'antd';
import { useEffect } from 'react';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function NewMemberDrawer(props) {
  const [form] = Form.useForm(); 
  const { 
    initialValues, 
    onClose, 
    onFinish,
    title, 
    visible, 
  } = props; 

  useEffect(() => { 
    form.setFieldsValue(initialValues); 
  }); 

  function handleClose() { 
    form.resetFields(); 
    onClose(); 
  }

  function handleFinish(values) { 
    form.resetFields(); 
    onClose(); 
    onFinish(values); 
  }

  return (
    <Drawer 
      title={title}
      placement="right"
      onClose={handleClose} 
      visible={visible}
    >
      <Form {...layout} form={form} name="nest-messages" onFinish={handleFinish}>
        <Form.Item name='first_name' label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name='last_name' label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name='maiden_name' label="Maiden Name">
          <Input />
        </Form.Item>
        <Form.Item name='nickname' label="Nickname">
          <Input />
        </Form.Item>
        <Form.Item name='email' label="Email">
          <Input />
        </Form.Item>
        <Form.Item name='is_male' label="Sex" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio.Button value="true">Male</Radio.Button>
            <Radio.Button value="false">Female</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name='birth_date' label="Birth Date" rules={[{ required: true }]}>
          <DatePicker /> 
        </Form.Item>
        <Form.Item name='death_date' label="Death Date">
          <DatePicker />
        </Form.Item>
        <Form.Item name='notes' label="Notes">
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