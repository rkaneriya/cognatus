import {Button, DatePicker, Drawer, Form, Input, Radio} from 'antd';
import { useEffect } from 'react';
import {RELATION_TYPES} from '../constants/relation-types'; 
import { MEMBER_RELATION_ACTIONS } from '../constants/member-relation-actions';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default function NewMemberDrawer(props) {
  const [form] = Form.useForm(); 
  const { 
    selectedMemberName, 
    drawerConfig, 
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

    if (drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_PARENT || drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_CHILD) {
      onFinish(values, RELATION_TYPES.PARENT_CHILD); 
    } else if (drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_SPOUSE) { 
      onFinish(values, RELATION_TYPES.SPOUSE); 
    } else { 
      onFinish(values); 
    }
  }

  const CONFIG_TO_TITLE = { 
    [MEMBER_RELATION_ACTIONS.EDIT_MEMBER]: `Edit ${selectedMemberName}'s profile`,
    [MEMBER_RELATION_ACTIONS.ADD_FIRST_MEMBER]: 'Add first person to tree',
    [MEMBER_RELATION_ACTIONS.ADD_NEW_PARENT]: `Add new parent of ${selectedMemberName}`,
    [MEMBER_RELATION_ACTIONS.ADD_NEW_CHILD]: `Add new child of ${selectedMemberName}`,   
    [MEMBER_RELATION_ACTIONS.ADD_NEW_SPOUSE]: `Add new spouse of ${selectedMemberName}`,
  }
  
  const submitLabel = drawerConfig === MEMBER_RELATION_ACTIONS.EDIT_MEMBER ? 'Edit' : 'Add'; 
  const title = CONFIG_TO_TITLE[drawerConfig]; 
  
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
            {submitLabel}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  ); 
}