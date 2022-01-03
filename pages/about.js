import {useState} from 'react'; 
import {useStyletron} from 'styletron-react'; 
import {message, Button, Input, Tooltip, Divider, Typography} from 'antd'; 
import {ArrowRightOutlined, QuestionCircleOutlined, UserSwitchOutlined} from '@ant-design/icons'; 
import {useRouter} from 'next/router'
import {supabase} from '../utils/supabase'
import {ROUTES} from '../constants/routes'; 
import {SITE_URLS} from '../constants/site-urls'; 
import Link from 'next/link'; 
import Image from 'next/image'
import Demos from '../components/demos'; 

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

function Question({children}) { 
  const [css] = useStyletron(); 
  return (
    <Typography.Title level={4}>
      {children}
    </Typography.Title>
  )
}

function Answer({children}) { 
  const [css] = useStyletron(); 
  return (
    <div className={css({
      borderLeft: '3px solid lightgray',  
      paddingLeft: '10px', 
      marginBottom: '40px', 
      fontSize: '14px', 
    })}>
      {children}
    </div>
  )
}

export default function About() {
  const [css] = useStyletron(); 
  const router = useRouter(); 

  return (
    <Wrapper>
      <Typography.Title level={1}>
        About
      </Typography.Title>

      <Question>What is Cognatus? </Question>
      <Answer>
        <p>
          <a href='https://cognatus.herokuapp.com'>Cognatus</a> is a web app for visualizing and connecting with your kin. It lets you create interactive networks (&quot;trees&quot;) of family members and the relations between them. You can query how relatives are related to one another, view interesting statistics about your family, as well as view important upcoming dates such as birthdays and wedding anniversaries. If you choose, you can also share trees with other people.
        </p>
      </Answer>

    {/* <Typography.Title level={2}>Data & Privacy</Typography.Title> */}
      <Question>Is my data used for any outside purpose?</Question>
      <Answer>  
        <p>
          No. Your data is never used for any purpose other than for enabling the core experience of creating, editing, and viewing trees. Your data is never analyzed, sold, or otherwise leveraged. You can fully delete your trees (along with all related family member and relation information), as well as download all your data in CSV format, at any time. 
        </p>
        <p>
          I created Cognatus to meet my own need of visualizing my family tree. I created it from scratch specifically because I didn&apos;t want to use a third party service that might use my data for other purposes.  
        </p>
      </Answer>

      <Question>How does sharing of trees work?</Question>
      <Answer>
        <p>
          Trees you create are private by default and can only be accessed and edited by you. If you choose, you can share trees with other people. There are two ways to share a tree: (1) with specific people who use Cognatus (via e-mail address), or (2) with anyone who has a link to the tree, regardless of whether they&apos;ve ever signed into Cognatus.  
        </p> 
      </Answer>

      <Question>Do I <i>have</i> to provide full birth dates?</Question>
      <Answer>
        <p>
          No. The only reason birth dates are required is so that the app can differentiate between a parent and a child in a &quot;parent/child&quot; relationship (using birthdate to discern who&apos;s older). 
        </p>
        <p>
          If you don&apos;t want to use full birth dates (or full dates for other events such as marriages), you can configure your tree to only use <i>years</i>. This will still enable the core functionality of Cognatus (visualizing and understanding the relations between family members); you just won&apos;t be able to view upcoming birth dates, wedding anniversaries, etc. 
        </p> 
        <p>
          You can switch back and forth between using dates or years at any time. Just note that switching to dates from years will (naturally) require you to go back and add months/days to all dates in order to store complete information. If you don&apos;t, the month/day will be assumed to be January 1st, by default For example, if family member X was previously configured to be born in 2021 (when a tree was in &quot;year&quot; mode), after you switch the tree to &quot;date&quot; mode, X&apos;s birth date will display as January 1, 2021 unless you edit it). 
        </p>
      </Answer>

      <Question>How was Cognatus made?</Question>
      <Answer>
        <p>
          Cognatus was made as a non-commercial hobby project in 2021. It uses <a href='https://nextjs.org/' target='_blank' rel='noreferrer'>Next.js</a> as a <a href='https://reactjs.org/' target='_blank' rel='noreferrer'>React</a> framework, <a href='https://ant.design/' target='_blank' rel='noreferrer'>Ant Design</a> as a component library, and <a href='https://supabase.com/' tagret='_blank' rel='noreferrer'>Supabase</a>, an open-source alternative to Firebase, for authentication and data storage. It&apos;s deployed using <a href='https://www.heroku.com/' target='_blank' rel='noreferrer'>Heroku</a>. 
        </p> 
      </Answer>

      <Question>How can I contact you?</Question>
      <Answer>
        Use <a href='https://forms.gle/H73Xvs4qqpc3QPqB9' target='_blank' rel='noreferrer'>this form</a> to get in touch with me. Bug reports, feature requests, and general feedback are all welcome! 
      </Answer>
    </Wrapper>
  ); 
}