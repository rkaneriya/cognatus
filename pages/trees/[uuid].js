import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import {Typography} from 'antd'; 

const {Title} = Typography; 

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      padding: '50px', 
    })}>
      {children}
    </div>
  ); 
}

export default function Tree() {
  const router = useRouter(); 
  const {uuid} = router?.query; 
  return (
    <Wrapper>
      <Title level={3}>{uuid}</Title>
    </Wrapper>
  ); 
}