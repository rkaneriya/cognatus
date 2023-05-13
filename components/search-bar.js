import { useStyletron } from 'styletron-react';

export default function SearchBar({searchTerm}) { 
  const [css] = useStyletron(); 

  return (
    <div className={css({
      opacity: searchTerm ? 1 : 0, 
      transition: 'opacity 0.5s ease-in-out',
      zIndex: 1, 
      position: 'absolute', 
      top: 0, 
      right: 0, 
      margin: '50px', 
      fontSize: '36px',
      fontStyle: 'italic', 
      fontWeight: 300, 
      textTransform: 'uppercase',
      color: 'gray', 
    })}>
      {searchTerm}
    </div>
  ); 
}