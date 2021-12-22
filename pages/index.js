import Head from 'next/head'; 
import Link from 'next/link'; 
import { useStyletron } from 'styletron-react'; 
import { SearchOutlined } from '@ant-design/icons';
import {Button} from 'antd'; 

export default function Home() {
  const [css] = useStyletron(); 
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={css({ fontSize: '20px', color: 'green' })}>
        <Link href='/test'>
          TEST LINK
        </Link>
      </div>
      
      <Button shape="circle" icon={<SearchOutlined twoToneColor="#52c41a"/>} size="large" />
    </div>
  )
}
