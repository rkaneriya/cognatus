import Document, { Html, Head, Main, NextScript } from "next/document";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

class MyDocument extends Document {
  static async getInitialProps(context) {
    const cache = createCache();
    const renderPage = () =>
      context.renderPage({
        // eslint-disable-next-line react/display-name
        enhanceApp: (App) => (props) => (
          <StyleProvider cache={cache}>
            <App {...props} />
          </StyleProvider>
        ),
      });

    const initialProps = await Document.getInitialProps({
      ...context,
      renderPage,
    });
    const style = extractStyle(cache, true);
    return { ...initialProps, antdStyle: style };
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Vujahday+Script&display=swap"
            rel="stylesheet"
          />
          <style dangerouslySetInnerHTML={{ __html: this.props.antdStyle }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
