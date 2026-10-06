// Title shown on the browser tab
export const metadata = { title: "Expense Tracker" };

// RootLayout wraps every page; "children" is the current page's content
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}