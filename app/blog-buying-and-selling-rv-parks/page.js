import PageBand from '@/components/PageBand';
import BlogList from '@/components/BlogList';
import { posts } from '@/lib/content';

const PER_PAGE = 10;
export const metadata = {
  title: { absolute: 'RV Park Sales - Florida - RV Campgrounds - RV Parks - Lots' },
  description: 'Articles on buying an RV park, selling an RV park or campground, financing, valuation and getting the best price.',
  alternates: { canonical: '/blog-buying-and-selling-rv-parks/' },
};

export default function BlogIndex() {
  const all = posts();
  return (
    <>
      <PageBand title="The RV Park Blog" kicker="Resources" sub="Buying, selling, financing and growing RV parks: practical insights from the RVParkSales team." crumbs={[{ label: 'Blog' }]} />
      <BlogList items={all.slice(0, PER_PAGE)} page={1} pages={Math.ceil(all.length / PER_PAGE)} base="/blog-buying-and-selling-rv-parks/" searchable />
    </>
  );
}
