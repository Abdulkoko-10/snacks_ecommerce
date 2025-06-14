import * as React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../lib/createEmotionCache';
// You can import your theme here if you want to inject it into the initial HTML
// import theme from '../styles/theme'; // Assuming you have a theme.js

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        {/* Inject MUI styles first using `emotionStyleTags` from getInitialProps below */}
        {/* It's important that this comes before other <style> or <link> tags if you want to override MUI styles */}
        {this.props.emotionStyleTags}
        <Head>
          {/* You could add a meta tag here for theme color, if your theme has one */}
          {/* <meta name="theme-color" content={theme.palette.primary.main} /> */}
          <link rel="shortcut icon" href="/favicon.ico" />
          {/* Other head elements like fonts, etc. */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) =>
        function EnhanceApp(props) {
          // Ensure App is spreading props correctly if it uses them
          // Also, ensure that if App uses a ThemeProvider, it's correctly wrapping here
          // For example: return <App emotionCache={cache} {...props} />;
          // The MUI examples often show passing the cache to App,
          // then App uses it in CacheProvider.
          // Here, we are directly using it in App for this enhanced version.
          // It's important that the CacheProvider in _app.js uses the *same* cache instance on the client.
          // However, for SSR style extraction, App itself is wrapped, and _app.js handles client-side cache.
          return <App emotionCache={cache} {...props} />;
        },
    });

  const initialProps = await Document.getInitialProps(ctx);
  // This is important. It prevents emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    emotionStyleTags,
  };
};
