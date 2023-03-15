import { Footer as DagFooter } from '@dulliag/components';

export const Footer = () => (
  <DagFooter
    sx={{ mt: 'auto' }}
    text={`© ${new Date().getFullYear()}`}
    categories={[
      {
        heading: 'Allgemeines',
        links: [
          { text: 'Impressum', href: 'https://dulliag.de/Impressum' },
          { text: 'Datenschutz', href: 'https://dulliag.de/Datenschutz' },
        ],
      },
      {
        heading: 'Links',
        links: [
          { text: 'Discord', href: '' },
          { text: 'Steam Gruppe', href: '' },
          { text: 'YouTube', href: 'https://youtube.com' },
        ],
      },
      {
        heading: 'Partner',
        links: [],
      },
      {
        heading: 'Apps',
        links: [
          { text: 'Storage', href: 'https://storage.dulliag.de' },
          { text: 'Share', href: 'https://share.dulliag.de' },
          { text: 'URL-Kürzer', href: 'https://url.dulliag.de' },
        ],
      },
    ]}
  />
);
