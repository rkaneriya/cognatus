import {Alert, Select} from 'antd'; 
import {useContext} from 'react'; 
import { useStyletron } from 'styletron-react';
import {MemberRelationContext} from '../data/contexts/member-relation'; 
import { getRelation } from '../utils/relations';

export default function QueryRelationTab() { 
  const [css] = useStyletron(); 
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
  const relationStr = getRelation(pathPeople, pathRelations); 

  return (
    <>
      <div className={css({fontStyle: 'italic'})}>How is {first_name} related to</div>
      <div className={css({display: 'flex', alignItems: 'center', margin: '10px 0px'})}>
        <Select
          autoFocus={true}
          showSearch={true}
          value={targetRelativeUuid}
          style={{ width: 175 }}
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
        <span className={css({fontStyle: 'italic', marginLeft: '5px'})}>?</span>
      </div>
      { 
        pathNodes.length > 0 && (
          <Alert message={relationStr} type="error" />
        )
      }
      { 
        pathNodes.length > 0 && (
          <div className={css({
            marginTop: '5px', 
            fontStyle: 'italic',
            fontSize: '12px', 
            color: 'gray', 
          })}>
            ^ Incorrect relation? Let me know <a href='https://forms.gle/H73Xvs4qqpc3QPqB9' target='_blank' rel='noreferrer'>here</a>.
          </div>
        ) 
      }
    </>
  ); 
}