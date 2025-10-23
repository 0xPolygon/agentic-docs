import '@/app/global.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Provider } from '@/app/provider';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        <Script id="posthog-analytics" strategy="beforeInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init gi Cr Or pi Tr Rr capture ji calculateEventProperties Ar register register_once register_for_session unregister unregister_for_session Nr getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Dr Mr createPersonProfile Lr kr Ur opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Fr debug L jr getPageViewId captureTraceFeedback captureTraceMetric Sr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_NZXhxJrVA30BtvoxZIRyOC4S1seBCaPMG0O9F6zcgFQ', {
              api_host: 'https://e.katana.tools',
              defaults: '2025-05-24',
              person_profiles: 'always'
            });
          `}
        </Script>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

// src/app/layout.tsx
export const metadata: Metadata = {
  title: 'Polygon Payments Docs',
  description: 'Polygon payments documentation',
  icons: {
    icon: [
      { url: '/icon.svg', sizes: 'any' }
    ],
    shortcut: ['/icon.svg'],
  },
};