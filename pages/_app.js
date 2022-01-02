import { useState, useEffect } from 'react';
import { Provider as StyletronProvider } from 'styletron-react'
import 'antd/dist/antd.css';
import { supabase } from '../utils/supabase';
import { styletron } from '../styletron'
import { Alert } from 'antd';
import {useRouter} from 'next/router';
import {ROUTES} from '../constants/routes'; 
import './_styles.css'; 
import Script from 'next/script';
import { isMobile } from 'react-device-detect';
import MobileWarningModal from '../components/mobile-warning-modal'; 

export default function MyApp(props) {
  const router = useRouter(); 
  const [isMobileWarningModalVisible, setIsMobileWarningModalVisible] = useState(false); 

  useEffect(() => {
    if (isMobile) { 
      setIsMobileWarningModalVisible(true); 
    }
  
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
  }, [router]); 

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
      <Component {...pageProps} />
      <MobileWarningModal visible={isMobileWarningModalVisible} onCancel={() => setIsMobileWarningModalVisible(false)} />
    </StyletronProvider>
  ); 
}
