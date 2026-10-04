// Admin sections for Marie's other two sites, managed from this admin
// through /api/admin/remote/<site> (see app/api/admin/remote/[site]/route.js).
// Field names match each site's own admin API, so their rules (alert emails,
// NDA handling, Stripe checks, RVParkAds -> RVParkSelect sync) keep running there.
const CODES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const STATE_CODES = [['', 'Choose a state'], ...CODES.map((c) => [c, c])];
const PARK_AMENITIES = ['Office', 'Clubhouse', 'Laundry / Bath House', '30 Amp', '50 Amp', 'Dog Park'];
const LOT_AMENITIES = ['Storage Building', 'Laundry', 'Pool', 'Pickleball Court', 'Bocce Ball', 'Tennis'];
const FEATURES = ['Waterfront / River / Lake / Ocean', 'Near Major Interstate or State Highway', 'Pool', 'Rec Room', 'Playground / Games Area', 'Picnic Area', 'Fire Pits'];
const RENTAL = ['Nightly', 'Weekly', 'Monthly'];
const AVATARS = [['', 'Default: RV By Owner logo'], ['glasses-man', 'Man with glasses'], ['long-woman', 'Woman, long dark hair'], ['bald-beard', 'Man with beard'], ['bun-woman', 'Woman, blonde bun'], ['cowboy', 'Cowboy hat'], ['short-woman', 'Woman, short curly hair'], ['cap-man', 'Man with ball cap'], ['silver-woman', 'Woman, silver hair']];
const park = (i) => i.category !== 'lot';
const lot = (i) => i.category === 'lot';
const strip = ({ id, _new, _slugTouched, ...rest }) => rest; // eslint-disable-line no-unused-vars

// Park/lot detail fields shared by RVParkSelect and RVParkAds listings.
const detailGroups = (extra = []) => [
  { title: 'Park details', showIf: park, fields: [
    { key: 'numSites', type: 'text', label: 'Total sites' },
    { key: 'acres', type: 'text', label: 'Acres' },
    { key: 'rvSpaces', type: 'text', label: 'RV spaces' },
    { key: 'fullHookupSpaces', type: 'text', label: 'Full hookup spaces' },
    { key: 'tentSpaces', type: 'text', label: 'Tent spaces' },
    { key: 'cabins', type: 'text', label: 'Cabins' },
    { key: 'yurts', type: 'text', label: 'Yurts' },
    { key: 'reservationSystem', type: 'text', label: 'Reservation system' },
    { key: 'annualRevenueCents', type: 'money', label: 'Annual revenue' },
    { key: 'occupancyRate', type: 'number', label: 'Occupancy rate (%)' },
    { key: 'rentalTypes', type: 'checks', label: 'Rental types', options: RENTAL, wide: true },
    { key: 'amenities', type: 'checks', label: 'Amenities', options: PARK_AMENITIES, wide: true },
    { key: 'features', type: 'checks', label: 'Features', options: FEATURES, wide: true },
    { key: 'expansionLand', type: 'toggle', label: 'Extra land available for expansion' },
    { key: 'ownerFinancing', type: 'toggle', label: 'Owner financing considered' },
  ] },
  { title: 'Lot details', showIf: lot, fields: [
    { key: 'lotSize', type: 'text', label: 'Lot size' },
    { key: 'hoaFeesCents', type: 'money', label: 'HOA fees' },
    { key: 'communityActivities', type: 'textarea', label: 'Community activities', wide: true, rows: 3 },
    { key: 'amenities', type: 'checks', label: 'Amenities', options: LOT_AMENITIES, wide: true },
    { key: 'ownerFinancing', type: 'toggle', label: 'Owner financing considered' },
  ] },
  ...extra,
];

export const REMOTE_SCHEMAS = {
  'select-listings': {
    label: 'RVParkSelect listings', one: 'RVParkSelect listing', site: 'select', icon: 'home',
    blurb: 'Everything members see on RVParkSelect.com, including parks sent from RVParkSales and RVParkAds. Drafts are hidden from members until you publish them.',
    remote: { site: 'select', path: 'admin-listings', listKey: 'listings', itemKey: 'listing', extras: [{ key: 'brokers', path: 'admin-brokers', listKey: 'brokers' }] },
    path: (i) => `https://rvparkselect.com/listing-detail.html?id=${i.id}`,
    columns: [['photoUrls', 'thumb'], ['listingName', 'Park'], ['_visibility', 'Members see it'], ['state', 'State'], ['askingPriceCents', 'Price'], ['_source', 'Came from']],
    filters: [['_visibility', [['', 'Any status'], ['Draft (hidden)', 'Draft (hidden)'], ['Off-market', 'Off-market'], ['Early access', 'Early access'], ['Public', 'Public']]]],
    fromRemote: (l) => ({
      ...l,
      id: String(l.id),
      brokerId: l.brokerId ? String(l.brokerId) : '',
      ownerAvatar: l.ownerAvatar || '',
      publicOn: l.publicOn ? String(l.publicOn).slice(0, 10) : '',
      _visibility: l.isDraft ? 'Draft (hidden)' : l.offMarket ? 'Off-market' : l.isPublic ? 'Public' : 'Early access',
      _source: l.sourceSalesListingId ? 'RVParkSales' : l.sourceAdsListingId ? 'RVParkAds' : 'Added on RVParkSelect',
    }),
    toRemote: (i) => {
      const { _visibility, _source, ndaSignerCount, isPublic, isDraft, createdAt, sourceAdsListingId, sourceSalesListingId, ...rest } = strip(i); // eslint-disable-line no-unused-vars
      return {
        ...rest,
        brokerId: rest.brokerId ? Number(rest.brokerId) : null,
        ownerAvatar: rest.ownerAvatar || null,
        publicOn: rest.publicOn || null,
        occupancyRate: rest.occupancyRate === '' || rest.occupancyRate == null ? null : Number(rest.occupancyRate),
      };
    },
    blank: () => ({ category: 'park', listingName: '', listingAddress: '', state: '', photoUrls: [], amenities: [], features: [], rentalTypes: [], offMarket: false, byOwner: false }),
    notice: (i) => (i.sourceSalesListingId ? 'This park is managed from RVParkSales listings. Edit it there: name, price, photos and description here are replaced the next time it is saved on RVParkSales.' : i.sourceAdsListingId ? 'This park came from a seller on RVParkAds. Their photo/video changes there still update it here.' : null),
    actions: [
      { label: 'Publish to members', show: (i) => i.isDraft, confirm: 'Publish this park to RVParkSelect members? Matching members get an email alert.', call: (i) => ({ method: 'POST', query: `action=publish&id=${i.id}` }), done: 'Published to members. Matching members were emailed.' },
    ],
    groups: [
      { title: 'Basics', fields: [
        { key: 'listingName', type: 'text', label: 'Park / lot name', required: true, wide: true },
        { key: 'category', type: 'select', label: 'Type', options: [['park', 'RV Park (whole park for sale)'], ['lot', 'RV Lot (single lot in a community)']] },
        { key: 'state', type: 'select', label: 'State', options: STATE_CODES, required: true },
        { key: 'listingAddress', type: 'text', label: 'Address (used for the map pin)', required: true, wide: true },
        { key: 'askingPriceCents', type: 'money', label: 'Asking price' },
        { key: 'brokerId', type: 'select', label: 'Listing broker (named on the NDA)', optionsFrom: 'brokers', emptyLabel: 'Marie Hansen (default)' },
        { key: 'byOwner', type: 'toggle', label: 'For sale by owner' },
        { key: 'ownerAvatar', type: 'select', label: 'By Owner picture', options: AVATARS, showIf: (i) => i.byOwner },
      ] },
      { title: 'Who can see it', fields: [
        { key: '_visibility', type: 'readonly', label: 'Right now', wide: true },
        { key: 'offMarket', type: 'toggle', label: 'Off-market: members only, never goes public', wide: true },
        { key: 'publicOn', type: 'date', dateOnly: true, label: 'Goes public on (RVParkSales.com date)', showIf: (i) => !i.offMarket },
      ] },
      ...detailGroups(),
      { title: 'Photos & videos', fields: [
        { key: 'photoUrls', type: 'images', label: 'Photos (the first one is the cover)', wide: true },
        { key: 'videoUrls', type: 'lines', label: 'Video links (one per line)', wide: true },
      ] },
      { title: 'Description', fields: [
        { key: 'description', type: 'textarea', label: 'Description', wide: true, rows: 8 },
      ] },
      { title: 'Confidential (members see this only after signing the NDA)', fields: [
        { key: 'sellerName', type: 'text', label: 'Seller name' },
        { key: 'sellerEmail', type: 'text', label: 'Seller email' },
        { key: 'sellerPhone', type: 'text', label: 'Seller phone' },
        { key: 'infoPacketUrl', type: 'file', label: 'Info packet (PDF)', accept: 'application/pdf', wide: true },
      ] },
      { title: 'Activity', fields: [
        { key: 'ndaSignerCount', type: 'readonly', label: 'Members who signed the NDA' },
        { key: '_source', type: 'readonly', label: 'Came from' },
        { key: 'createdAt', type: 'readonly', label: 'Added', format: 'date' },
      ] },
    ],
  },

  'select-members': {
    label: 'RVParkSelect members', one: 'Member', site: 'select', icon: 'user', canCreate: false, canDelete: false, readOnly: true,
    blurb: 'Everyone who signed up on RVParkSelect.com, with their plan and what they are looking for. Open a member to see their NDAs, saved parks and questions.',
    remote: { site: 'select', path: 'admin-buyers', listKey: 'buyers', itemKey: 'buyer', detailKey: 'activity' },
    path: () => 'https://rvparkselect.com/admin-buyers.html',
    columns: [['name', 'Name'], ['tierName', 'Plan'], ['standing', 'Standing'], ['pofStatus', 'Proof of funds'], ['email', 'Email'], ['createdAt', 'Joined']],
    fromRemote: (b) => ({ ...b, id: String(b.id), standing: b.standing?.featured ? `Featured Buyer · ${b.standing.tierLabel}` : (b.standing?.tierLabel || '—'), pofStatus: b.pofStatus || (b.tierKey === 'premium' ? 'Not submitted' : 'Not needed') }),
    actions: [
      { label: 'Verify proof of funds', show: (i) => i.tierKey === 'premium' && i.pofStatus !== 'verified', confirm: 'Mark this member’s proof of funds as verified? They get an email and become a Featured Buyer.', call: (i) => ({ method: 'POST', body: { action: 'set-pof', id: Number(i.id), status: 'verified' } }), done: 'Verified. The member was emailed.' },
      { label: 'Reject proof of funds', danger: true, show: (i) => i.tierKey === 'premium' && i.pofStatus === 'submitted', confirm: 'Reject this proof of funds?', call: (i) => ({ method: 'POST', body: { action: 'set-pof', id: Number(i.id), status: 'rejected' } }), done: 'Marked as rejected.' },
    ],
    groups: [
      { title: 'Member', fields: [
        { key: 'name', type: 'readonly', label: 'Name' },
        { key: 'email', type: 'readonly', label: 'Email' },
        { key: 'phone', type: 'readonly', label: 'Phone' },
        { key: 'tierName', type: 'readonly', label: 'Plan' },
        { key: 'standing', type: 'readonly', label: 'Standing' },
        { key: 'pofStatus', type: 'readonly', label: 'Proof of funds' },
        { key: 'createdAt', type: 'readonly', label: 'Joined', format: 'date' },
      ] },
      { title: 'What they are looking for', fields: [
        { key: 'priceRange', type: 'readonly', label: 'Price range' },
        { key: 'states', type: 'readonly', label: 'States' },
        { key: 'regions', type: 'readonly', label: 'Regions' },
        { key: 'financingStatus', type: 'readonly', label: 'Financing' },
        { key: 'wantsLenderContact', type: 'readonly', label: 'Wants a lender to contact them' },
        { key: 'ownsOtherParks', type: 'readonly', label: 'Owns other parks' },
        { key: 'buyingWithPartner', type: 'readonly', label: 'Buying with a partner' },
        { key: 'prequalifiedLender', type: 'readonly', label: 'Pre-qualified lender' },
        { key: 'bio', type: 'readonly', label: 'About them', wide: true },
      ] },
      { title: 'Activity', activity: true, fields: [] },
    ],
  },

  'select-brokers': {
    label: 'RVParkSelect brokers', one: 'Broker', site: 'select', icon: 'user',
    blurb: 'The brokers named on RVParkSelect listings and NDAs.',
    remote: { site: 'select', path: 'admin-brokers', listKey: 'brokers', itemKey: 'broker' },
    path: () => 'https://rvparkselect.com/admin-brokers.html',
    columns: [['photoUrl', 'thumb'], ['name', 'Name'], ['brokerageName', 'Brokerage'], ['licenseState', 'License state'], ['phone', 'Phone']],
    fromRemote: (b) => ({ ...b, id: String(b.id) }),
    toRemote: (i) => strip(i),
    blank: () => ({ name: '' }),
    groups: [
      { title: 'Broker', fields: [
        { key: 'name', type: 'text', label: 'Name', required: true, wide: true },
        { key: 'brokerageName', type: 'text', label: 'Brokerage' },
        { key: 'photoUrl', type: 'image', label: 'Photo', wide: true },
        { key: 'email', type: 'text', label: 'Email' },
        { key: 'phone', type: 'text', label: 'Phone' },
        { key: 'licenseState', type: 'select', label: 'License state', options: STATE_CODES },
        { key: 'licenseNumber', type: 'text', label: 'License number' },
        { key: 'bio', type: 'textarea', label: 'Bio', wide: true, rows: 5 },
      ] },
    ],
  },

  'select-lenders': {
    label: 'RVParkSelect lenders', one: 'Lender', site: 'select', icon: 'dollar', canCreate: false, readOnly: true,
    blurb: 'Lenders pay to be listed in the members’ lender directory. They only show to members once you approve them and while they keep paying.',
    remote: { site: 'select', path: 'lenders', listKey: 'lenders', listQuery: 'all=1', remove: (i) => ({ method: 'POST', body: { action: 'delete', id: Number(i.id) } }) },
    path: () => 'https://rvparkselect.com/lender-directory.html',
    columns: [['companyName', 'Company'], ['contactName', 'Contact'], ['status', 'Status'], ['subscriptionActive', 'Paying'], ['createdAt', 'Signed up']],
    filters: [['status', [['', 'Any status'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']]]],
    fromRemote: (l) => ({ ...l, id: String(l.id) }),
    actions: [
      { label: 'Approve', show: (i) => i.status !== 'approved', confirm: 'Approve this lender? They get an email and appear in the directory while they keep paying.', call: (i) => ({ method: 'POST', body: { action: 'set-status', id: Number(i.id), status: 'approved' } }), done: 'Approved. The lender was emailed.' },
      { label: 'Reject', danger: true, show: (i) => i.status !== 'rejected', confirm: 'Reject this lender?', call: (i) => ({ method: 'POST', body: { action: 'set-status', id: Number(i.id), status: 'rejected' } }), done: 'Rejected.' },
      { label: 'Back to pending', show: (i) => i.status !== 'pending', call: (i) => ({ method: 'POST', body: { action: 'set-status', id: Number(i.id), status: 'pending' } }), done: 'Set back to pending.' },
    ],
    groups: [
      { title: 'Lender', fields: [
        { key: 'companyName', type: 'readonly', label: 'Company' },
        { key: 'status', type: 'readonly', label: 'Status' },
        { key: 'subscriptionActive', type: 'readonly', label: 'Subscription active' },
        { key: 'contactName', type: 'readonly', label: 'Contact' },
        { key: 'contactEmail', type: 'readonly', label: 'Email' },
        { key: 'contactPhone', type: 'readonly', label: 'Phone' },
        { key: 'website', type: 'readonly', label: 'Website' },
        { key: 'nationwide', type: 'readonly', label: 'Lends nationwide' },
        { key: 'states', type: 'readonly', label: 'States' },
        { key: 'loanTypes', type: 'readonly', label: 'Loan types' },
        { key: 'minLoanCents', type: 'readonly', label: 'Smallest loan', format: 'money' },
        { key: 'maxLoanCents', type: 'readonly', label: 'Largest loan', format: 'money' },
        { key: 'description', type: 'readonly', label: 'About them', wide: true },
      ] },
    ],
  },

  'ads-listings': {
    label: 'RVParkAds listings', one: 'RVParkAds listing', site: 'ads', icon: 'megaphone', canCreate: false, canDelete: false,
    blurb: 'Parks that owners advertise themselves on RVParkAds.com. Your edits here also update the same park on RVParkSelect.',
    remote: { site: 'ads', path: 'admin-listings', listKey: 'listings', itemKey: 'listing' },
    path: (i) => `https://www.rvparkads.com/listing-detail.html?id=${i.id}`,
    columns: [['photoUrls', 'thumb'], ['listingName', 'Park'], ['sellerName', 'Seller'], ['planName', 'Plan'], ['askingPriceCents', 'Price'], ['createdAt', 'Added']],
    fromRemote: (l) => ({ ...l, id: String(l.id) }),
    toRemote: (i) => {
      const { sellerName, sellerEmail, sellerPhone, planKey, planName, createdAt, photoUrls, videoUrls, ...rest } = strip(i); // eslint-disable-line no-unused-vars
      return { ...rest, occupancyRate: rest.occupancyRate === '' || rest.occupancyRate == null ? null : Number(rest.occupancyRate) };
    },
    groups: [
      { title: 'Seller', fields: [
        { key: 'sellerName', type: 'readonly', label: 'Seller' },
        { key: 'sellerEmail', type: 'readonly', label: 'Email' },
        { key: 'sellerPhone', type: 'readonly', label: 'Phone' },
        { key: 'planName', type: 'readonly', label: 'Plan' },
      ] },
      { title: 'Basics', fields: [
        { key: 'listingName', type: 'text', label: 'Park / lot name', required: true, wide: true },
        { key: 'category', type: 'select', label: 'Type', options: [['park', 'RV Park'], ['lot', 'RV Lot']] },
        { key: 'askingPriceCents', type: 'money', label: 'Asking price' },
        { key: 'listingAddress', type: 'text', label: 'Address', required: true, wide: true },
      ] },
      ...detailGroups(),
      { title: 'Description', fields: [
        { key: 'description', type: 'textarea', label: 'Description', wide: true, rows: 8 },
      ] },
      { title: 'Photos & videos (managed by the seller)', fields: [
        { key: 'photoUrls', type: 'readonly', label: 'Photos', format: 'images', wide: true },
      ] },
    ],
  },
};
