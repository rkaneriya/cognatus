import moment from 'moment'; 
import { useContext } from 'react';
import {Typography} from 'antd'; 
import { Bar, Pie } from '@ant-design/plots';
import {MemberRelationContext} from '../data/contexts/member-relation'; 

function ChartWrapper({children}) { 
  return (
    <div className='w-full h-[300px] mb-8'>
      {children}
    </div>
  )
}

export default function StatsTab() { 
  const {
    members, 
  } = useContext(MemberRelationContext); 

  const numMales = members.reduce((acc, m) => {
    return acc + (m.is_male ? 1 : 0); 
  }, 0);

  const numMembersByDecade = members.reduce((acc, m) => { 
    const birthDate = moment(m.birth_date); 
    const fromDate = m.death_date ? moment(m.death_date) : moment(); 
    const age = fromDate.diff(birthDate, 'years'); 
    const decade = Math.floor(age / 10) * 10; 
    if (acc[decade]) { 
      acc[decade] = acc[decade] + 1; 
    } else { 
      acc[decade] = 1; 
    }
    return acc;
  }, {})

  const sexData = [
    { 
      type: 'Male', 
      value: numMales,
    },
    {
      type: 'Female', 
      value: members.length - numMales,
    }
  ];

  const sexConfig = {
    data: sexData,
    angleField: 'value',
    colorField: 'type', 
    label: {
      type: 'inner',
      offset: '30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 12,
        textAlign: 'center',
      },
    },
    legend: {
      position: 'top',
    }
  };

  const decadeData = Object.keys(numMembersByDecade).map(decade => { 
    const rangeLabel = `${decade}-${Number(decade)+10}`; 
    const value = numMembersByDecade[decade]; 
    return { 
      decade: rangeLabel, 
      value, 
    }; 
  }); 
  
  const decadeConfig = {
    data: decadeData,
    xField: 'value',
    yField: 'decade',
    seriesField: 'decade',
    legend: {
      position: 'top-left',
      flipPage: false, 
    },
    renderer: 'svg', 
  };

  return (
    <div className='h-[500px] overflow-auto'>
      <Typography.Title level={4}>Age Breakdown by Decade</Typography.Title>
      <ChartWrapper>
        <Bar {...decadeConfig} />
      </ChartWrapper>

      <Typography.Title level={4}>Sex Breakdown</Typography.Title>
      <ChartWrapper>
        <Pie {...sexConfig} />
      </ChartWrapper>
    </div>
  ); 
}