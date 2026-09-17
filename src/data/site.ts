export const site = {
  // TODO: all placeholder values below must be replaced before launch.
  name: 'PLACEHOLDER_COMPANY_NAME',
  shortDescription: 'PLACEHOLDER_DESCRIPTION',
  email: 'placeholder@example.com',
  phone: '+1-000-000-0000',
  address: {
    street: 'PLACEHOLDER_STREET',
    city: 'PLACEHOLDER_CITY',
    region: 'PLACEHOLDER_STATE',
    postalCode: '00000',
  },

  // TODO: confirm with client — the app lives on a separate origin.
  // This site links out; it does not implement auth.
  appUrl: 'https://app.example.com',

  nav: [
    { label: 'Solutions', href: '/solutions/' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ],
} as const;
