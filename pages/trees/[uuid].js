import {useStyletron} from 'styletron-react'; 
import {useRouter} from 'next/router'
import {Title} from '../../components/typography'; 

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
      <Title>{uuid}</Title>
    </Wrapper>
  ); 
}