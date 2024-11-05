/* eslint-disable */

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia2lzbzExIiwiYSI6ImNtMG84amFkYTA1eGgyanIzOTFwY2JzbDIifQ.XrjECfN0mIH2XvZ8JN0fjA';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((location) => {
    // Create marker:
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker:
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // Add popup:
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    // Extends bounds to coordinates:
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
