import { useState, useContext } from 'react';
import {Button, Drawer, Divider, Input, Select, Tag, Tooltip, Typography} from 'antd';
import { useStyletron } from 'styletron-react';
import { TreeContext } from '../data/contexts/tree';

function TooltipText() { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex', 
      flexDirection: 'column',
    })}>
      <p>{`Viewer = user can only VIEW your tree, not edit it.`}</p>
      <p>{`Collaborator = user can VIEW and EDIT your tree.`}</p>
    </div>
  )
}

export default function ShareTreeDrawer({
  tree,
  onClose, 
  visible, 
}) {
  const [email, setEmail] = useState(''); 
  const [isEditable, setIsEditable] = useState(false); 
  const [css] = useStyletron(); 
  const { 
    createSharedTree,
    deleteSharedTree,
  } = useContext(TreeContext); 
  
  function handleAdd() { 
    createSharedTree(tree?.uuid, email, isEditable); 
  }

  function handleChange(e) { 
    setEmail((e.target.value || '').trim());  
  }

  const [viewers, collaborators] = (tree?.sharees || []).reduce((acc, s) => { 
    if (s.is_editable) { 
      acc[1].push(s); 
    } else { 
      acc[0].push(s); 
    }
    return acc; 
  }, [[], []]); 

  return (
    <Drawer 
      title={`Share '${tree?.name}' with specific people`}
      placement="right"
      onClose={onClose} 
      open={visible}
    >
      <div className={css({marginBottom: '20px'})}>
        <p>
          Instead of making a tree public to all, you can share it with specific people by adding their e-mail addresses below.
        </p>
        <p>
          They don&apos;t have to already be using Cognatus. If they sign in at any point in time with their e-mail address, they will be able to see the tree you shared.  
        </p>
        <p>
          You can configure whether people you share your tree with can only view (not edit) your tree, or can both view and edit it. You can stop sharing with specific people at any time by removing them from the list below.
        </p>
      </div>
      <Divider />
      { 
        viewers.length > 0 && (
          <div>
            <Typography.Title level={4}>Viewers</Typography.Title>
            <p className={css({fontStyle: 'italic'})}>Viewers can only view your tree, not edit it.</p>
            {viewers.map(s => (
              <Tag 
                key={s.uuid} 
                color='blue'
                closable 
                onClose={() => deleteSharedTree(s.uuid)}
                style={{ marginBottom: '8px' }}
              >
                {s.sharee_email}   
              </Tag>
            ))}
          </div>
        )
      }
      { 
        collaborators.length > 0 && (
          <div className={css({marginTop: '10px'})}>
            <Typography.Title level={4}>Collaborators</Typography.Title>
            <p className={css({fontStyle: 'italic'})}>Collaborators can view and edit your tree.</p>
            {collaborators.map(s => (
              <Tag 
                key={s.uuid} 
                color='green'
                closable 
                onClose={() => deleteSharedTree(s.uuid)}
                style={{ marginBottom: '8px' }}
              >
                {s.sharee_email}   
              </Tag>
            ))}
          </div>
        )
      }
      <div className={css({marginTop: '20px'})}>
        <Input.Group compact style={{display: 'flex'}}>
          <Tooltip 
            placement='left' 
            title={<TooltipText />}
          >
            <Select value={isEditable} onChange={setIsEditable}>
              <Select.Option value={false}>Viewer</Select.Option>
              <Select.Option value={true}>Collaborator</Select.Option>
            </Select>
          </Tooltip>
          <Input 
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