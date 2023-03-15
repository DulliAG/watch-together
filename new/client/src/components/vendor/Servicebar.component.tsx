import { ServiceBar as DagServiceBar } from '@dulliag/components';

export const ServiceBar = () => {
  return (
    <DagServiceBar
      onSignIn={() => (window.location.href = 'https://logs.dulliag.de/sign-in')}
      onSignUp={() => (window.location.href = 'https://logs.dulliag.de/sign-up')}
      onSignOut={() => {}}
      user={null}
    />
  );
};
