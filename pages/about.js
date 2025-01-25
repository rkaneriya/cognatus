import { Typography } from "antd";
import Head from "next/head";

function Question({ children }) {
  return <div className="text-xl font-semibold mb-4">{children}</div>;
}

function Answer({ children }) {
  return (
    <div className="pl-5 mb-8 font-light text-sm sm:text-base border-gray-300 border-l-4 flex flex-col gap-4">
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div className="p-10 max-w-5xl">
      <Head>
        <title>Cognatus | About</title>
      </Head>
      <div className="flex items-center font-semibold text-4xl mb-5">About</div>

      <Question>What is Cognatus?</Question>
      <Answer>
        <p>
          <Typography.Link
            className="text-base"
            href="https://www.cognatus.app"
          >
            Cognatus
          </Typography.Link>{" "}
          is a web app for visualizing and connecting with your kin. It lets you
          create interactive networks (&quot;trees&quot;) of family members and
          the relations between them. You can query how relatives are related to
          one another, view interesting statistics about your family, as well as
          view important upcoming dates such as birthdays and wedding
          anniversaries. If you choose, you can share trees with other people.
          You can also opt to receive monthly e-mails reminding you of upcoming
          birthdays and anniversaries in one or more of your trees (or trees
          that were shared with you).
        </p>
        <p className="font-semibold italic bg-gray-100 w-fit rounded-[20px] px-4 py-2">
          Interested? Click{" "}
          <Typography.Link
            className="text-base"
            href="https://www.cognatus.app"
          >
            here
          </Typography.Link>{" "}
          to sign in and make your first tree.
        </p>
      </Answer>

      <Question>How is my data used?</Question>
      <Answer>
        <p>
          Your data is never used for any purpose other than for enabling the
          core experience of creating, editing, and viewing trees. Your data is
          never analyzed, sold, or otherwise leveraged. You can fully delete
          your trees (along with all related family member and relation
          information) at any time.
        </p>
        <p>
          I created Cognatus as a non-commercial hobby project to visualize my
          own family tree. I built it myself specifically because I didn&apos;t
          want to use a third party service that might use my data for other
          purposes.
        </p>
      </Answer>

      <Question>How does tree sharing work?</Question>
      <Answer>
        <p>
          Trees you create are private by default and can only be accessed and
          edited by you. If you choose, you can share trees with other people.
          There are two ways to share a tree: (1) with specific people who use
          Cognatus (via e-mail address), or (2) with anyone who has a link to
          the tree, regardless of whether they&apos;ve ever signed into
          Cognatus. By default, shared trees are read-only for those you share
          them with. However, you can choose to allow others to edit your trees
          (i.e. for collaborating on filling out a family tree).
        </p>
      </Answer>

      <Question>
        Do I <i>have</i> to use full birth dates?
      </Question>
      <Answer>
        <p>
          No. The only reason birth dates are required at all is so that the app
          can differentiate between a parent and a child in a
          &quot;parent/child&quot; relationship (using birth date to discern
          who&apos;s older).
        </p>
        <p>
          If you don&apos;t want to use full dates, you can select the &quot;Use
          Years Only&quot; option when adding/editing a family member. This will
          only store years for all dates for that individual. This will still
          enable the core functionality of Cognatus (visualizing and
          understanding the relations between family members); you just
          won&apos;t be able to view upcoming birthdays, wedding anniversaries,
          etc.
        </p>
        <p>
          You can switch back and forth between using full dates or years at any
          time. Just note that switching to full dates from years will
          (naturally) require you to supply a month/day for the first time in
          order for the date to be accurate. If you don&apos;t, the month/day
          will be assumed to be the current month/day.
        </p>
      </Answer>

      <Question>How was Cognatus made?</Question>
      <Answer>
        <p>
          Cognatus was made as a non-commercial hobby project in December 2021.
          It uses{" "}
          <Typography.Link
            href="https://nextjs.org/"
            target="_blank"
            rel="noreferrer"
            className="text-base"
          >
            Next.js
          </Typography.Link>{" "}
          as a{" "}
          <Typography.Link
            href="https://reactjs.org/"
            target="_blank"
            rel="noreferrer"
            className="text-base"
          >
            React
          </Typography.Link>{" "}
          framework,{" "}
          <Typography.Link
            href="https://ant.design/"
            target="_blank"
            rel="noreferrer"
            className="text-base"
          >
            Ant Design
          </Typography.Link>{" "}
          as a component library, and{" "}
          <Typography.Link
            href="https://supabase.com/"
            target="_blank"
            rel="noreferrer"
            className="text-base"
          >
            Supabase
          </Typography.Link>
          , an open-source alternative to Firebase, for authentication and data
          storage. It&apos;s deployed using{" "}
          <Typography.Link
            href="https://aws.amazon.com/amplify/"
            target="_blank"
            rel="noreferrer"
            className="text-base"
          >
            AWS Amplify
          </Typography.Link>
          .
        </p>
      </Answer>

      <Question>How can I contact you?</Question>
      <Answer>
        <p>
          Use{" "}
          <Typography.Link
            href="https://forms.gle/H73Xvs4qqpc3QPqB9"
            target="_blank"
            rel="noreferrer"
            className="text-base"
          >
            this form
          </Typography.Link>{" "}
          to get in touch with me. Bug reports, feature requests, and general
          feedback are all welcome and appreciated!
        </p>
      </Answer>
    </div>
  );
}
