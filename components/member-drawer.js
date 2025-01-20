import {Button, DatePicker, Divider, Drawer, Form, Input, Radio} from 'antd';
import { useEffect, useContext } from 'react';
import {RELATION_TYPES} from '../constants/relation-types'; 
import { MEMBER_RELATION_ACTIONS } from '../constants/member-relation-actions';
import { MemberRelationContext } from '../data/contexts/member-relation';

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default function MemberDrawer({
  drawerConfig, 
  initialValues, 
  onClose, 
  visible, 
}) {
  const [form] = Form.useForm(); 

  useEffect(() => { 
    form.setFieldsValue(initialValues); 
    return () => { 
      form.resetFields(); 
    }
  }); 

  const {
    createMember,
    createMemberAndRelation,
    updateMember,
    selectedMemberUuid,
    membersByUuid,
  } = useContext(MemberRelationContext); 
  
  const selectedMemberName = membersByUuid[selectedMemberUuid]?.first_name; 

  function handleClose() { 
    onClose(); 
  }

  function handleFinish(values) { 
    form.resetFields(); 
    onClose(); 

    if (drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_PARENT || drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_CHILD) {
      createMemberAndRelation(values, {
        type: RELATION_TYPES.PARENT_CHILD,
      }); 
    } else if (drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_SPOUSE) { 
      createMemberAndRelation(values, {
        type: RELATION_TYPES.SPOUSE,
        start_date: values.start_date, 
        end_date: values.end_date, 
      });  
    } else if (drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_EX_SPOUSE) { 
      createMemberAndRelation(values, { 
        type: RELATION_TYPES.EX_SPOUSE, 
        start_date: values.start_date, 
        end_date: values.end_date, 
      }); 
    } else if (drawerConfig === MEMBER_RELATION_ACTIONS.ADD_FIRST_MEMBER) {
      createMember(values); 
    } else { 
      updateMember(values); 
    }
  }

  const CONFIG_TO_TITLE = { 
    [MEMBER_RELATION_ACTIONS.EDIT_MEMBER]: `Edit ${selectedMemberName}'s profile`,
    [MEMBER_RELATION_ACTIONS.ADD_FIRST_MEMBER]: 'Add first person to tree',
    [MEMBER_RELATION_ACTIONS.ADD_NEW_PARENT]: `Add new parent of ${selectedMemberName}`,
    [MEMBER_RELATION_ACTIONS.ADD_NEW_CHILD]: `Add new child of ${selectedMemberName}`,   
    [MEMBER_RELATION_ACTIONS.ADD_NEW_SPOUSE]: `Add new spouse of ${selectedMemberName}`,
    [MEMBER_RELATION_ACTIONS.ADD_NEW_EX_SPOUSE]: `Add new ex-spouse of ${selectedMemberName}`,
  }
  
  const submitLabel = drawerConfig === MEMBER_RELATION_ACTIONS.EDIT_MEMBER ? 'Edit' : 'Add'; 
  const title = CONFIG_TO_TITLE[drawerConfig]; 

  const isSpouseConfig = (
    drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_SPOUSE || 
    drawerConfig === MEMBER_RELATION_ACTIONS.ADD_NEW_EX_SPOUSE
  );

  return (
    <Drawer 
      title={title}
      placement="right"
      onClose={handleClose} 
      open={visible}
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
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value="true">Male</Radio.Button>
            <Radio.Button value="false">Female</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Divider />
        <Form.Item name='use_year_only' noStyle>
          <Radio.Group
            buttonStyle='solid' 
            style={{
              marginBottom: '20px', 
              display: 'flex', 
              justifyContent: 'center', 
            }}
          >
            <Radio.Button value="false">Use Full Dates</Radio.Button>
            <Radio.Button value="true">Use Years Only</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.use_year_only !== curr.use_year_only}>
          {({ getFieldValue }) => (
            <Form.Item name='birth_date' label="Birth Date" rules={[{ required: true }]}>
              <DatePicker picker={getFieldValue('use_year_only') === 'true' ? 'year' : 'undefined'} /> 
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.use_year_only !== curr.use_year_only}>
          {({ getFieldValue }) => (
            <Form.Item name='death_date' label="Death Date">
              <DatePicker picker={getFieldValue('use_year_only') === 'true' ? 'year' : 'undefined'} /> 
            </Form.Item>
          )}
        </Form.Item>
        { 
          isSpouseConfig && (
            <>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.use_year_only !== curr.use_year_only}>
                {({ getFieldValue }) => (
                  <Form.Item name='start_date' label="Marriage Start" rules={[{ required: true }]}>
                    <DatePicker picker={getFieldValue('use_year_only') === 'true' ? 'year' : 'undefined'} /> 
                  </Form.Item>
                )}
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.use_year_only !== curr.use_year_only}>
                {({ getFieldValue }) => (
                  <Form.Item name='end_date' label="Marriage End">
                    <DatePicker picker={getFieldValue('use_year_only') === 'true' ? 'year' : 'undefined'} /> 
                  </Form.Item>
                )}
              </Form.Item>
            </>
          )
        }
        <Form.Item name='notes' label="Notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 9 }}>
          <Button type="primary" htmlType="submit">
            {submitLabel}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  ); 
}