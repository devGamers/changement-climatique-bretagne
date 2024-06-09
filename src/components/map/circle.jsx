import { Circle, LayerGroup, Tooltip } from 'react-leaflet';
import { columns, phenomenes } from '../../constants';

const temperatureValues = columns.filter(column => column.temperature).map(column => column.value);
const phenomenesValues = phenomenes.map(column => column.value)

const CircleLayer = ({ data, col, pression }) => {

  const getColor = (value) => {
    let color = 'gray'
    if (col === 'RR') {
      color = value > 500 ? 'red' : (value > 300 ? 'orange' : 'yellow');
    } else if (temperatureValues.includes(col)) {
      color = value > 1500 ? 'red' : (value > 1000 ? 'orange' : 'yellow');
    } else if (phenomenesValues.includes(col)) {
      color =  value > 50 ? 'red' : (value > 20 ? 'orange' : 'yellow');
    } else if (pression) {
      color =  value > 1020 ? 'red' : (value >= 1010 ? 'orange' : 'yellow');
    }
    return color
  };
  
  const getRadius = (value) => {
    let radius = value * 1; // Default factor
    if (col === 'RR') {
      radius =  value * 0.9;
    } else if (temperatureValues.includes(col)) {
      radius =  value * 0.7;
    } else if (phenomenesValues.includes(col)) {
      radius =  (value+10) * 50;
    } 
    // else if (pression) {
    //   radius =  value * 10
    // }
    return radius
  };  

  return (
    <LayerGroup key={col}>
      {data.map((point, index) => (
        <Circle
          key={index}
          center={[point.LAT, point.LON]}
          radius={getRadius(parseFloat(point[col]))}
          color={getColor(parseFloat(pression ? point.PMERM : point[col]))}
          fillOpacity={0.4}
        >
          <Tooltip direction="top" offset={[0, 0]} opacity={1} permanent>
            <span style={{fontSize: '0.9em'}}>
              {`${point.NOM_USUEL} :`} <b>{pression ? point.PMERM : point[col]}</b>
            </span>
          </Tooltip>
        </Circle>
      ))}
    </LayerGroup>
  );
};

export default CircleLayer;
