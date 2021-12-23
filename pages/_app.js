import { useEffect } from 'react';
import { Provider as StyletronProvider } from 'styletron-react'
import 'antd/dist/antd.css';
import { supabase } from '../utils/supabase';
import { styletron } from '../styletron'
import {useRouter} from 'next/router';
import {ROUTES} from '../constants/routes'; 

export default function MyApp(props) {
  const router = useRouter(); 
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => { 
      if (event === 'SIGNED_IN') { 
        router.push(ROUTES.ADMIN); 
      }
            
      async function updateAuthCookie() { 
        await fetch('/api/auth', {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session }),
        })  
      }
       
      updateAuthCookie(); 
    }); 

    return () => { 
      authListener.unsubscribe()
    }; 
  }); 

  const { Component, pageProps } = props
  return (
    <StyletronProvider value={styletron}>
      <Component {...pageProps} />
    </StyletronProvider>
  ); 
}
