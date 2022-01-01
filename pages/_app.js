import { useEffect } from 'react';
import { Provider as StyletronProvider } from 'styletron-react'
import 'antd/dist/antd.css';
import { supabase } from '../utils/supabase';
import { styletron } from '../styletron'
import { Alert } from 'antd';
import {useRouter} from 'next/router';
import {ROUTES} from '../constants/routes'; 
import './_styles.css'; 

export default function MyApp(props) {
  const router = useRouter(); 
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => { 
      if (event === 'SIGNED_IN') { 
        router.push(ROUTES.ADMIN); 
      }
            
      fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session }),
      }).then((res) => res.json())
   }); 

    return () => { 
      authListener.unsubscribe()
    }; 
  }); 

  const { Component, pageProps } = props
  return (
    <StyletronProvider value={styletron}>
      <Alert
        message={(
          <>
            Please note: Cognatus is still in open beta. You can create & edit trees, but there may still be some bugs and finishing touches left unaddressed. Thank you for trying it out! Please considering submitting feedback <a href='https://forms.gle/H73Xvs4qqpc3QPqB9' target='_blank' rel='noreferrer'>here</a>.
          </>
        )}
        banner
        closable
      />

      <Component {...pageProps} />
    </StyletronProvider>
  ); 
}
