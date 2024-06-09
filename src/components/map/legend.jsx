import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { columns, phenomenes } from '../../constants';

const Legend = ({ col, pression }) => {
  const map = useMap();

  React.useEffect(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      let grades = [];
      const colors = ['yellow', 'orange', 'red'];

      if (col === 'RR') {
        grades = [0, 300, 500];
      } else if (!pression && columns.some(item => item.value === col && item.temperature)) {
        grades = [0, 1000, 1500];
      } else if (phenomenes.some(item => item.value === col)) {
        grades = [0, 20, 50];
      } else if (pression) {
        grades = [0, 1010, 1020];
      } else {
        grades = [0, 10, 20]; // Default grades for unknown columns
      }

      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : ' +');
      }

      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, col]);

  return null;
};

export default Legend;
