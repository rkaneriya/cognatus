import { useState } from 'react';
import {Button, Drawer, Divider, Input, Tag} from 'antd';
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
      title={`Share '${tree?.name}' with specific people`}
      placement="right"
      onClose={onClose} 
      visible={visible}
    >
      <div className={css({marginBottom: '20px'})}>
        <p>
          Instead of making a tree public to all, you can share it with specific people by adding their e-mail addresses below.
        </p>
        <p>
          They don&apos;t have to already be using Cognatus. If they sign in at any point in time with their e-mail address, they will be able to see the tree you shared.  
        </p>
        <p>
          People you share your tree with can only view (not edit) your tree. You can stop sharing with specific people at any time by removing them from the list below.
        </p>
      </div>
      <Divider />
      <div>
        {tree?.sharees.map(s => (
          <Tag 
            key={s.uuid} 
            color='blue'
            closable 
            onClose={() => handleShareDelete(s.uuid)}
            style={{ marginBottom: '8px' }}
          >
            {s.sharee_email}   
          </Tag>
        ))}
      </div>
      <div className={css({marginTop: '20px'})}>
        <Input.Group compact>
          <Input 
            style={{ width: '82%' }} 
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