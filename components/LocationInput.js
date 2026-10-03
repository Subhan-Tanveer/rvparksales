'use client';
import { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/components/googleMaps';

// "Enter location" box with Google place suggestions as you type (like the old
// FacetWP proximity field). onPick({lat, lng, label}) fires when a suggestion is
// chosen; plain typing still works through onChange / Enter.
export default function LocationInput({ value, onChange, onPick, onEnter, className, ...rest }) {
  const ref = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    let ac;
    loadGoogleMaps().then((maps) => {
      if (!ref.current || !maps.places) return;
      ac = new maps.places.Autocomplete(ref.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'us' },
        fields: ['geometry', 'formatted_address', 'name'],
      });
      ac.addListener('place_changed', () => {
        const p = ac.getPlace();
        if (!p?.geometry?.location) return;
        const label = p.formatted_address || p.name || ref.current.value;
        pickRef.current?.({ lat: p.geometry.location.lat(), lng: p.geometry.location.lng(), label });
      });
    }).catch(() => {});
    return () => { if (ac && window.google?.maps?.event) window.google.maps.event.clearInstanceListeners(ac); };
  }, []);

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={(e) => {
        // Let Google's suggestion list handle Enter when it is open.
        if (e.key === 'Enter') {
          const open = document.querySelector('.pac-container:not([style*="display: none"]) .pac-item-selected');
          if (open) { e.preventDefault(); return; }
          onEnter?.(e);
        }
      }}
      placeholder="Enter location"
      autoComplete="off"
      aria-label="Enter location"
      className={className}
      {...rest}
    />
  );
}
