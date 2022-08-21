import {useStyletron} from 'styletron-react'; 
import {Typography} from 'antd'; 
import {useRouter} from 'next/router'
import Head from 'next/head'; 

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
      <Head>
        <title>Cognatus | About</title>
      </Head>
      <Typography.Title level={1}>
        About
      </Typography.Title>

      <Question>What is Cognatus? </Question>
      <Answer>
        <p>
          <a href='https://cognatus.herokuapp.com'>Cognatus</a> is a web app for visualizing and connecting with your kin. It lets you create interactive networks (&quot;trees&quot;) of family members and the relations between them. You can query how relatives are related to one another, view interesting statistics about your family, as well as view important upcoming dates such as birthdays and wedding anniversaries. If you choose, you can share trees with other people. You can also opt to receive monthly e-mails reminding you of upcoming birthdays and anniversaries in one or more of your trees (or trees that were shared with you). 
        </p>
      </Answer>

      <Question>Is my data used for any outside purpose?</Question>
      <Answer>  
        <p>
          No. Your data is never used for any purpose other than for enabling the core experience of creating, editing, and viewing trees. Your data is never analyzed, sold, or otherwise leveraged. You can fully delete your trees (along with all related family member and relation information) at any time.
        </p>
        <p>
          I created Cognatus as a non-commercial hobby project to visualize my own family tree. I built it myself specifically because I didn&apos;t want to use a third party service that might use my data for other purposes.  
        </p>
      </Answer>

      <Question>How does tree sharing work?</Question>
      <Answer>
        <p>
          Trees you create are private by default and can only be accessed and edited by you. If you choose, you can share trees with other people. There are two ways to share a tree: (1) with specific people who use Cognatus (via e-mail address), or (2) with anyone who has a link to the tree, regardless of whether they&apos;ve ever signed into Cognatus. By default, shared trees are read-only for those you share them with. However, you can choose to allow others to edit your trees (i.e. for collaborating on filling out a family tree). 
        </p> 
      </Answer>

      <Question>Do I <i>have</i> to use full birth dates?</Question>
      <Answer>
        <p>
          No. The only reason birth dates are required at all is so that the app can differentiate between a parent and a child in a &quot;parent/child&quot; relationship (using birth date to discern who&apos;s older). 
        </p>
        <p>
          If you don&apos;t want to use full dates, you can select the &quot;Use Years Only&quot; option when adding/editing a family member. This will only store years for all dates for that individual. This will still enable the core functionality of Cognatus (visualizing and understanding the relations between family members); you just won&apos;t be able to view upcoming birthdays, wedding anniversaries, etc.
        </p> 
        <p>
          You can switch back and forth between using full dates or years at any time. Just note that switching to full dates from years will (naturally) require you to supply a month/day for the first time in order for the date to be accurate. If you don&apos;t, the month/day will be assumed to be the current month/day.
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
        Use <a href='https://forms.gle/H73Xvs4qqpc3QPqB9' target='_blank' rel='noreferrer'>this form</a> to get in touch with me. Bug reports, feature requests, and general feedback are all welcome and appreciated!
      </Answer>
    </Wrapper>
  ); 
}