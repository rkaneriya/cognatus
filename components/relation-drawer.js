import {Button, DatePicker, Drawer, Form, Input, Radio} from 'antd';
import { useEffect, useContext } from 'react';
import { MemberRelationContext } from '../data/contexts/member-relation';

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default function RelationDrawer({
  initialValues, 
  onClose, 
  visible, 
}) {
  const [form] = Form.useForm(); 

  useEffect(() => { 
    form.setFieldsValue(initialValues); 
  }); 

  const {updateRelation} = useContext(MemberRelationContext); 

  function handleClose() { 
    form.resetFields(); 
    onClose(); 
  }

  function handleFinish(values) { 
    form.resetFields(); 
    onClose(); 
    updateRelation({
      uuid: initialValues.uuid, 
      ...values,
    });
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