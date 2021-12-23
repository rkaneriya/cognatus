import {useStyletron} from 'styletron-react'; 

export function Title({children}) { 
    const [css] = useStyletron(); 
    return (
      <div className={css({
        fontSize: '48px',   
        fontWeight: '600', 
      })}>
        {children}
      </div>
    ); 
  }
  
export function Subtitle({children}) { 
    const [css] = useStyletron(); 
    return (
      <div className={css({
        fontSize: '24px',   
        fontStyle: 'italic'
      })}>
        {children}
      </div>
    ); 
  }
  