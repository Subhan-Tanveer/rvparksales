import './admin.css';

export const metadata = {
  title: { default: 'Admin', template: '%s · RVParkSales Admin' },
  robots: { index: false, follow: false },
};

// Marie's admin. Plain layout: none of the public site's header, footer or motion.
export default function AdminLayout({ children }) {
  return <div className="adm">{children}</div>;
}
