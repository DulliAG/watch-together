import type { BreadcrumbLink } from '@dulliag/components';
import type { Location } from 'react-router-dom';

export function parseLocationForBreadrumb(
  location: Location,
  options: { defaultPathName: string; defaultPath: string }
): BreadcrumbLink[] {
  const splittedPath = location.pathname
    .split('/')
    .filter((path) => path.length > 0 && path.toLowerCase() !== 'dashboard');
  return [
    { text: options.defaultPathName, href: '/', routerLink: true },
    ...splittedPath.map((path, index) => {
      return {
        text: path.replaceAll('%20', ' '),
        href: '/' + splittedPath.slice(0, index + 1).join('/'),
        routerLink: true,
      };
    }),
  ];
}
