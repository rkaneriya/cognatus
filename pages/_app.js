import { useState, useEffect } from 'react';
import { Provider as StyletronProvider } from 'styletron-react'
import { supabase } from '../utils/supabase';
import { styletron } from '../styletron'
import {useRouter} from 'next/router';
import {ROUTES} from '../constants/routes'; 
import './_styles.css'; 
import Script from 'next/script';
import { TreeContextProvider } from '../data/contexts/tree';
import { UserContext } from '../data/contexts/user';

export default function MyApp(props) {
  const router = useRouter(); 
  const [user, setUser] = useState(); 

  useEffect(() => {

    setUser(supabase.auth.user()); 
  
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => { 
      const user = supabase.auth.user();
      setUser(user); 

      if (event === 'SIGNED_OUT') { 
        router.push(ROUTES.HOME); 
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
  }, [router]); 

  const { Component, pageProps } = props
  return (
    <StyletronProvider value={styletron}>
      <Script
        strategy='lazyOnload'
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_KEY}`}
        />
      <Script id='google-analytics' strategy='lazyOnload'>
        {
          `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_KEY}');
          `
        }        
      </Script>
      <UserContext.Provider value={{user}}>
        <TreeContextProvider>
          <Component {...pageProps} />
        </TreeContextProvider>
      </UserContext.Provider>
    </StyletronProvider>
  ); 
}
