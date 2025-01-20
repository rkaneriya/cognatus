import {Alert, Select, Typography} from 'antd'; 
import {useContext} from 'react'; 
import {MemberRelationContext} from '../data/contexts/member-relation'; 
import { getRelation } from '../utils/relations';

export default function QueryRelationTab({onSelectTargetInRelation}) { 
  const {
    pathNodes,
    pathEdges, 
    members, 
    membersByUuid, 
    relationsByUuid,
    selectedMemberUuid,
    targetRelativeUuid,
    setTargetRelativeUuid,
  } = useContext(MemberRelationContext); 

  const {first_name} = membersByUuid[selectedMemberUuid] || {}; 
  const relativeOptions = members.filter(m => 
    m.uuid !== selectedMemberUuid
  );   

  const pathPeople = pathNodes.map(n => membersByUuid[n]); 
  const pathRelations = pathEdges.map(e => relationsByUuid[e]); 

  let relationStr = getRelation(pathPeople, pathRelations); 

  if (pathPeople.length > 0) { 
    const source = pathPeople[0];
    const target = pathPeople[pathPeople.length-1];
    relationStr = <>
      <Typography.Link onClick={() => onSelectTargetInRelation(target)}>{target.first_name}</Typography.Link>
     {` is ${source.first_name}'s ${relationStr}`}  
     </>
  }

  return (
    <>
      <div className='italic'>How is {first_name} related to</div>
      <div className='flex items-center my-2'>
        <Select
          size='large'
          autoFocus={true}
          showSearch={true}
          value={targetRelativeUuid}
          style={{ width: '100%' }}
          onSelect={setTargetRelativeUuid}
          placeholder='Select relative'
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            relativeOptions.map(r => (
              <Select.Option
                key={r.uuid}
                value={r.uuid}
              >
                {`${r.first_name} ${r.last_name}`}
              </Select.Option>
            ))
          }
        </Select>
        <span className='italic ml-4'>?</span>
      </div>
      { 
        pathNodes.length > 0 && (
          <Alert message={relationStr} type="error" />
        )
      }
      { 
        pathNodes.length > 0 && (
          <div className='italic text-xs text-gray-400 mt-2'>
            ^ Incorrect relation? Let me know <Typography.Link className='text-xs' href='https://forms.gle/H73Xvs4qqpc3QPqB9' target='_blank' rel='noreferrer'>here</Typography.Link>.
          </div>
        ) 
      }
    </>
  ); 
}