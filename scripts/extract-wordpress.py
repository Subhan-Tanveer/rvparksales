"""
Turns the WordPress export (Tools > Export XML) into clean JSON files in ../data.

Usage:  python scripts/extract-wordpress.py "F:/Downloads/rvparksales.WordPress.2026-10-02.xml"

What it keeps: listings, brokers, developers, published blog posts and pages,
real testimonials, the media map, nav menu, and the old URL list (for redirects).

What it deliberately does NOT copy: the 600 WooCommerce orders (customer personal
data), users, form entries, and theme/builder internals (Impreza, WPBakery). The
export file itself is never copied into this folder and is git-ignored.
"""
import re, sys, json, html, os, collections
from urllib.parse import urlparse

SRC = sys.argv[1] if len(sys.argv) > 1 else r"F:/Downloads/rvparksales.WordPress.2026-10-02.xml"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
os.makedirs(OUT, exist_ok=True)

s = open(SRC, encoding='utf-8', errors='replace').read()
items = re.findall(r'<item>(.*?)</item>', s, re.S)

def g(it, tag):
    m = re.search(r'<' + tag + r'>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</' + tag + '>', it, re.S)
    return m.group(1).strip() if m else ''

def typ(it): return g(it, 'wp:post_type')

def metas(it):
    d = {}
    for k, v in re.findall(r'<wp:meta_key><!\[CDATA\[(.*?)\]\]></wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(.*?)\]\]></wp:meta_value>', it, re.S):
        d.setdefault(k, v)
    return d

def terms(it):
    out = collections.defaultdict(list)
    for dom, nick, name in re.findall(r'<category domain="(.*?)" nicename="(.*?)"><!\[CDATA\[(.*?)\]\]></category>', it):
        out[dom].append({'slug': nick, 'name': html.unescape(name)})
    return out

def path_of(url):
    p = urlparse(url).path
    return p if p.endswith('/') else p + '/'

def php_int_list(serialized):
    """a:7:{i:0;s:4:"3015";...} -> [3015, ...]"""
    return [int(x) for x in re.findall(r's:\d+:"(\d+)"', serialized or '')]

# ---------- media map (attachment id -> url) ----------
media = {}
for it in items:
    if typ(it) == 'attachment':
        pid = int(g(it, 'wp:post_id'))
        media[pid] = {
            'url': g(it, 'wp:attachment_url'),
            'alt': metas(it).get('_wp_attachment_image_alt', ''),
            'title': html.unescape(g(it, 'title')),
        }

def thumb(m):
    tid = m.get('_thumbnail_id')
    return media.get(int(tid), {}).get('url') if tid and tid.isdigit() else None

# ---------- listings ----------
def num(v):
    try:
        f = float(str(v).replace(',', '').strip())
        return int(f) if f == int(f) else f
    except Exception:
        return None

listings = []
for it in items:
    if typ(it) != 'appnet_listing':
        continue
    m, t = metas(it), terms(it)
    wp_status = g(it, 'wp:status')
    ids = php_int_list(m.get('images'))
    addr_raw = m.get('address') or ''
    def addr_num(key):
        mm = re.search(r's:%d:"%s";d:(-?[0-9.]+)' % (len(key), key), addr_raw)
        return float(mm.group(1)) if mm else None
    def addr_str(key):
        mm = re.search(r's:%d:"%s";s:\d+:"(.*?)";' % (len(key), key), addr_raw)
        return html.unescape(mm.group(1)) if mm else None
    listings.append({
        'wpId': int(g(it, 'wp:post_id')),
        'slug': g(it, 'wp:post_name'),
        'oldPath': path_of(g(it, 'link')) if g(it, 'link') else None,
        'title': html.unescape(g(it, 'title')),
        'publishState': wp_status,                     # publish | draft | private
        'status': m.get('status') or None,             # For Sale | Sold | Archived
        'date': g(it, 'wp:post_date'),
        'category': (t.get('appnet_listing_category') or [{}])[0].get('name'),
        'state': (t.get('appnet_listing_state') or [{}])[0].get('name', '').replace(' RV Parks and Campgrounds', '') or None,
        'priceUsd': num(m.get('price')),
        'sites': num(m.get('number_of_sites')),
        'acres': num(m.get('acres')),
        'roomToExpand': m.get('room_to_expand') or None,
        'address': m.get('address_string') or addr_str('address') or None,
        'lat': addr_num('lat'),
        'lng': addr_num('lng'),
        'city': addr_str('city') or addr_str('name'),
        'stateShort': addr_str('state_short'),
        'propertyId': m.get('property_id') or None,
        'brokerName': m.get('broker_name') or None,
        'highlights': html.unescape(m.get('investment_highlights', '')) or None,
        'summary': html.unescape(m.get('executive_summary', '')) or None,
        'hasOfferingMemorandum': bool(m.get('offering_memorandum')),
        'imageIds': ids,
        'images': [media[i]['url'] for i in ids if i in media],
        'featuredImage': thumb(m),
        'contentHtml': g(it, 'content:encoded'),
        'seoTitle': m.get('_seopress_titles_title') or None,
        'seoDescription': m.get('_seopress_titles_desc') or None,
    })

# ---------- brokers / developers ----------
def people(kind):
    out = []
    for it in items:
        if typ(it) != kind or g(it, 'wp:status') != 'publish':
            continue
        m = metas(it)
        out.append({
            'wpId': int(g(it, 'wp:post_id')),
            'slug': g(it, 'wp:post_name'),
            'oldPath': path_of(g(it, 'link')),
            'name': html.unescape(g(it, 'title')),
            'email': m.get('email') or m.get('_email') or None,
            'phone': m.get('phone') or m.get('_phone') or None,
            'licenseNumber': m.get('license_number') or None,
            'licenseState': m.get('license_state') or None,
            'photo': thumb(m),
            'bioHtml': g(it, 'content:encoded'),
            'extra': {k: v for k, v in m.items() if not k.startswith('_') and k not in ('email', 'phone', 'license_number', 'license_state') and len(v) < 400},
        })
    return out

brokers, developers = people('broker'), people('developer')

# ---------- posts & pages ----------
def content_items(kind):
    out = []
    for it in items:
        if typ(it) != kind or g(it, 'wp:status') != 'publish':
            continue
        m, t = metas(it), terms(it)
        out.append({
            'wpId': int(g(it, 'wp:post_id')),
            'slug': g(it, 'wp:post_name'),
            'oldPath': path_of(g(it, 'link')),
            'title': html.unescape(g(it, 'title')),
            'date': g(it, 'wp:post_date'),
            'categories': [c['name'] for c in t.get('category', [])],
            'featuredImage': thumb(m),
            'excerpt': html.unescape(g(it, 'excerpt:encoded')) or None,
            'contentHtml': g(it, 'content:encoded'),
            'seoTitle': m.get('_seopress_titles_title') or None,
            'seoDescription': m.get('_seopress_titles_desc') or None,
        })
    return sorted(out, key=lambda x: x['date'], reverse=True)

posts, pages = content_items('post'), content_items('page')

# ---------- testimonials ----------
# The three created on 2026-08-15 (Robert Mitchell, Sandra Williams, James Patterson)
# describe results on plans that launched that same month and are NOT migrated;
# drafts are skipped as well.
EXCLUDED_NAMES = {'robert mitchell', 'sandra williams', 'james patterson'}
testimonials, excluded = [], []
for it in items:
    if typ(it) != 'us_testimonial' or g(it, 'wp:status') != 'publish':
        continue
    name = html.unescape(g(it, 'title'))
    body = re.sub(r'<[^>]+>', ' ', html.unescape(g(it, 'content:encoded')))
    body = re.sub(r'\s+', ' ', body).strip()
    rec = {'name': name, 'date': g(it, 'wp:post_date')[:10], 'quote': body}
    (excluded if name.lower() in EXCLUDED_NAMES else testimonials).append(rec)

# ---------- nav menu, old 404s (for redirects), site info ----------
menu = []
for it in items:
    if typ(it) == 'nav_menu_item':
        m = metas(it)
        menu.append({'title': html.unescape(g(it, 'title')), 'order': int(g(it, 'wp:menu_order') or 0), 'url': m.get('_menu_item_url') or None, 'parent': m.get('_menu_item_menu_item_parent')})
menu.sort(key=lambda x: x['order'])

old404 = sorted({html.unescape(g(it, 'title')) for it in items if typ(it) == 'seopress_404'})

def dump(name, obj):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)

dump('listings.json', listings)
dump('brokers.json', brokers)
dump('developers.json', developers)
dump('posts.json', posts)
dump('pages.json', pages)
dump('testimonials.json', testimonials)
dump('menu.json', menu)
dump('old-404s.json', old404)
dump('media-map.json', {str(k): v for k, v in media.items()})

by = collections.Counter((l['publishState'], l['status']) for l in listings)
print(f"listings {len(listings)} | brokers {len(brokers)} | developers {len(developers)} | posts {len(posts)} | pages {len(pages)} | testimonials kept {len(testimonials)} (excluded {len(excluded)}) | media {len(media)} | menu {len(menu)} | old 404 paths {len(old404)}")
print('listings by (publishState, status):', dict(by))
