import {useState} from 'react'; 
import {useStyletron} from 'styletron-react'; 
import {message, Button, Input, Tooltip} from 'antd'; 
import {ArrowRightOutlined, QuestionCircleOutlined} from '@ant-design/icons'; 
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import {SITE_URLS} from '../constants/site-urls'; 
import Link from 'next/link'; 
import Image from 'next/image'

const {Search} = Input; 

function Wrapper({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    })}>
      {children}
    </div>
  ); 
}

function Header({email}) {
  const [css] = useStyletron(); 
  return (
    <div className={css({
      color: 'lightgray',
      position: 'absolute', 
      top: '10px', 
      right: '20px', 
      width: '100%', 
      textAlign: 'right', 
    })}>
      Logged in as {email}
    </div>
  ); 
}

function Footer() {
  const [css] = useStyletron(); 
  return (
    <div className={css({
      color: 'lightgray',
      position: 'absolute', 
      bottom: '10px', 
      width: '100%', 
      textAlign: 'center', 
      display: 'flex',
      flexDirection: 'column',  
    })}>
      <a href="https://www.buymeacoffee.com/rkaneriya" target="_blank" rel="noreferrer">
        <Image 
          src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png"
          alt="Buy Me A Coffee" 
          height={40}
          width={145}
        />
      </a>
      © 2021 Rishi Kaneriya 
    </div>
  ); 
}

function Content({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column', 
      alignItems: 'center', 
    })}>
      {children}
    </div>
  ); 
}

function Login() {
  const [loading, setLoading] = useState(false)
  const [css] = useStyletron(); 

  const handleLogin = async (email) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signIn({ email }, {
        redirectTo: process.env.NODE_ENV === 'production' ? SITE_URLS.PROD : SITE_URLS.DEV, 
      })
      if (error) throw error
      message.success('Check your email for the login link!')
    } catch (error) {
      message.error(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={css({marginTop: '20px', display: 'flex', alignItems: 'center'})}>
      <Search
        allowClear
        placeholder="Enter e-mail address"
        loading={loading} 
        enterButton="Sign in via magic link"
        onSearch={(email) => handleLogin(email)}
      />
      <Tooltip placement="right" title={'All you need in order to use Cognatus is an e-mail address. No need for a password!'}>
        <QuestionCircleOutlined style={{ marginLeft: '10px' }} />
      </Tooltip>
    </div>
  )
}

function HoverEffectText({text}) { 
  const [css] = useStyletron(); 
  const chars = text.split(''); 
  return (
    <>
      {
        chars.map((c, i) => (
          <div key={i} className={css({
            textTransform: 'uppercase',
            ':hover': { 
              color: '#40a9ff', 
            }, 
          })}>
            {c}
          </div>
        ))
      }
    </>
  )
}

export default function Home({user}) {
  const [css] = useStyletron(); 
  const router = useRouter(); 

  return (
    <>
      {user && <Header email={user?.email} />}
      <Wrapper>
        <Content>
          <div className={css({
            fontWeight: '100', 
            fontSize: '120px', 
            display: 'flex', 
          })}>
            <HoverEffectText text='cognatus' />
          </div>

          <div className={css({fontStyle: 'italic', fontSize: '24px'})}>
            Stay
            {' '}
            <Link href={ROUTES.ADMIN}>
              <a>connected</a>
            </Link> 
            {' '}
            to your family
          </div>
          {
            user 
              ? <>
                  <Button 
                    size='large'
                    style={{ margin: '20px 0px' }}
                    type="primary" 
                    onClick={() => router.push(ROUTES.ADMIN)}
                  >
                    View your family trees <ArrowRightOutlined />
                  </Button>
                  <div className={css({color: 'gray'})}>
                    Logged in as {user?.email}
                  </div>
                </>
              : <Login />
          }
        </Content>
      </Wrapper>
      <Footer /> 
    </>
  ); 
}

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req)
  if (!user) {
    return { props: {} }; 
  }
  return { props: { user } }
}