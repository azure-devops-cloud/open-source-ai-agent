export const metadata = {
  title: 'Open Source AI Agent',
  description: 'An open-source, $0-first AI agent platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
