/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Skeleton } from "antd"
import { DotChartOutlined } from '@ant-design/icons';
import "leaflet/dist/leaflet.css"
import CircleLayer from './circle';
import Legend from './legend';
import './map.css'
import { calculateMedian, imputeMissingValues } from '../../helpers';

const Map = (props) => {
    const {annualPerMonth, col, isLoading, pression} = props
    let mounted = false

    const position = [48.202047, -2.932644]

    const [data, setData] = useState([]);
    useEffect(() => {
        if (!mounted && annualPerMonth.length) {
            let data = annualPerMonth
            if (pression) {
                const medianPMERM = calculateMedian(data, "PMERM");
                const medianTNTXM = calculateMedian(data, "TNTXM");
                data = imputeMissingValues(data, "TNTXM", medianTNTXM);
                data = imputeMissingValues(data, "PMERM", medianPMERM).filter(item => parseFloat(item.PMERM) > 0);
            }
            setData(data)
        }
        return () => mounted = true
    }, [annualPerMonth]);
    
    return (
        <div className="wrapper">
            {isLoading || !data.length ? 
                <Skeleton.Node active style={{ width: '100%', height: '385px' }}>
                    <DotChartOutlined style={{ fontSize: 100, color: '#bfbfbf' }}/>
                </Skeleton.Node> : 
                <MapContainer center={position} zoom={9}  scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <CircleLayer data={data} col={col} pression={pression} />
                    <Legend col={col} pression={pression} />
                </MapContainer>
            }
        </div>
    )
}

export default Map
