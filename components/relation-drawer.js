import {Button, DatePicker, Drawer, Form, Input, Radio} from 'antd';
import { useEffect } from 'react';

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default function RelationDrawer(props) {
  const [form] = Form.useForm(); 
  const { 
    initialValues, 
    onClose, 
    onFinish,
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
    onFinish({
      uuid: initialValues.uuid, 
      ...values,
    }); // updateRelation 
  }

  return (
    <Drawer 
      title='Edit relationship details'
      placement="right"
      onClose={handleClose} 
      visible={visible}
    >
      <Form {...layout} form={form} name="nest-messages" onFinish={handleFinish}>
        <Form.Item name='start_date' label="Marriage Start" rules={[{ required: true }]}>
          <DatePicker /> 
        </Form.Item>
        <Form.Item name='end_date' label="Marriage End">
          <DatePicker /> 
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 9 }}>
          <Button type="primary" htmlType="submit">
            Edit
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  ); 
}