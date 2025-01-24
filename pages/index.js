import { useContext, useState } from "react";
import { message, Button, Input, Tooltip, Typography, Divider } from "antd";
import { ArrowRightOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabase";
import { ROUTES } from "../constants/routes";
import { SITE_URLS } from "../constants/site-urls";
import Demos from "../components/demos";
import Head from "next/head";
import { UserContext } from "../data/contexts/user";

const { Search } = Input;

function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn(
        { email },
        {
          redirectTo:
            process.env.NODE_ENV === "production"
              ? SITE_URLS.PROD
              : SITE_URLS.DEV,
        },
      );
      if (error) throw error;
      message.success("Check your email for the login link!");
    } catch (error) {
      message.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 flex items-center w-full max-w-96">
      <Search
        size="large"
        allowClear
        placeholder="Enter e-mail address"
        loading={loading}
        enterButton="Sign in"
        onSearch={(email) => handleLogin(email)}
      />
      <Tooltip
        placement="right"
        title={
          "All you need in order to use Cognatus is an e-mail address. No need for a password!"
        }
      >
        <QuestionCircleOutlined style={{ marginLeft: "10px" }} />
      </Tooltip>
    </div>
  );
}

async function logout() {
  await supabase.auth.signOut();
}

export default function Home() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  return (
    <div className="h-screen flex justify-center items-center">
      <Head>
        <title>Cognatus</title>
      </Head>
      <div className="sm:w-2/3">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl mb-2 sm:text-8xl uppercase font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-green-300">
            COGNATUS
          </h1>
          <p className="text-2xl sm:mb-2 sm:text-3xl italic">
            Stay{" "}
            <span className="text-transparent px-1 bg-clip-text bg-gradient-to-br from-blue-600 to-green-500">
              connected
            </span>{" "}
            to your family
          </p>
          {user ? (
            <>
              <Button
                size="large"
                style={{ margin: "20px 0px" }}
                type="primary"
                onClick={() => router.push(ROUTES.ADMIN)}
              >
                View your family trees <ArrowRightOutlined />
              </Button>
              <div className="text-gray-500">
                Logged in as {user?.email}. (
                <Typography.Link className="text-base" onClick={logout}>
                  Logout
                </Typography.Link>
                )
              </div>
            </>
          ) : (
            <Login />
          )}
          <Button
            size="large"
            style={{ marginTop: "24px" }}
            type="default"
            onClick={() => router.push(ROUTES.ABOUT)}
          >
            Learn more
          </Button>
          <Divider />
          <div className="text-base sm:text-large font-light italic">
            Or, check out one of these demo trees:
          </div>
          <Demos />
          <div className="mt-8 text-gray-300 font-light">
            © 2025 Rishi Kaneriya{" "}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return { props: {} };
  }
  return { props: { user } };
}
