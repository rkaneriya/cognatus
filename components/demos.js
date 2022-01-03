import {Avatar, Tooltip} from 'antd'; 
import { useStyletron } from 'styletron-react';
import { ROUTES } from '../constants/routes';
import Link from 'next/link'; 

export default function Demos() { 
  const [css] = useStyletron(); 

  const demos = [
    { 
      file: '/fdr.jpeg', 
      path: ROUTES.DEMO_ROOSEVELTS,
      label: 'The Roosevelts', 
    }, 
    { 
      file: '/queen.jpg', 
      path: ROUTES.DEMO_BRITISH_ROYALS,
      label: 'The British Royal Family', 
    }, 
  ]; 

  const IMAGE_WIDTH = 100; 
  const CONTAINER_WIDTH = IMAGE_WIDTH * demos.length + 50; 

  return (
    <div className={css({
      marginTop: '20px', 
      display: 'flex', 
      width: `${CONTAINER_WIDTH}px`, 
      height: '200px', 
      justifyContent: 'space-between',
    })}>
      { 
        demos.map(({file, path, label}) => (
          <div key={file} className={css({
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center'
          })}>
            <Tooltip placement="bottom" title={label}>
              <div className={css({
                width: 'fit-content', 
                height: 'fit-content', 
                border: '3px solid lightgray', 
                borderRadius: '50%', 
                opacity: 0.7, 
                ':hover': {
                  opacity: 1, 
                  border: '3px solid gray', 
                  cursor: 'pointer', 
                }
              })}>
                <Link href={path} passHref>
                  <Avatar 
                    src={file} 
                    size={IMAGE_WIDTH}
                  />
                  </Link>
              </div>   
            </Tooltip>
          </div> 
        ))
      }
    </div>
  ); 
}