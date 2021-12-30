import { useState } from 'react';
import {Button, Drawer, Input, Tag} from 'antd';
import { useEffect } from 'react';
import { useStyletron } from 'styletron-react';

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default function ShareTreeDrawer(props) {
  const [email, setEmail] = useState(''); 
  const [css] = useStyletron(); 

  const { 
    handleShareAdd,
    handleShareDelete, 
    tree,
    sharees, 
    onClose, 
    visible, 
  } = props; 

  function handleAdd() { 
    handleShareAdd(tree?.uuid, email); 
  }

  function handleChange(e) { 
    setEmail(e.target.value);  
  }

  return (
    <Drawer 
      title={`Share '${tree?.name}'`}
      placement="right"
      onClose={onClose} 
      visible={visible}
    >
      {tree?.sharees.map(s => (
        <Tag key={s.uuid} closable onClose={() => handleShareDelete(s.uuid)}>
          {s.sharee_email}   
        </Tag>
      ))}
      <div className={css({marginTop: '20px'})}>
        <Input.Group compact>
          <Input 
            style={{ width: 200 }} 
            value={email}
            onChange={handleChange}
            onPressEnter={handleAdd}
          />
          <Button type="primary" onClick={handleAdd}>Add</Button>
        </Input.Group>
      </div>
    </Drawer>
  ); 
}