import { GlobalStyle } from './GlobalStyle';

export const metadata = {
  title: "Miniature Calendar → Midjourney Prompt",
  description: "Convert JSON/JSONC (single or array) into inline Midjourney prompts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <GlobalStyle />
        {children}
      </body>
    </html>
  );
}
