import { CookieDisclaimer as DagCookieDisclaimer } from '@dulliag/components';

export const CookieDisclaimer = () => (
  <DagCookieDisclaimer
    text="Wir verwenden Cookies!"
    link={{ text: 'Mehr Infos...', href: 'https://www.cookiesandyou.com/' }}
    cookie={{ name: 'dag:cokies' }}
  />
);
