import { useState } from 'react';
import {Card, Col, DatePicker, Row, Select} from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';

import PageLayout from "../layout/layout"
import AverageMonthChart from './temperaturePrecipitation/averageMonthChart';

import { useGetDataPerQuery, useGetAnnualSumDataQuery } from '../../redux/api/getDataApi';
import Map from '../../components/map/map';
import { columns, initDate, today, phenomenes } from '../../constants';
import EvolutionAnnuelle from '../../components/evolutionAnnuelle';
import { disableFutureYears } from '../../helpers';

const Home = () => {
    const [periode, setPeriode] = useState({
        value: 1,
        start: '2001-01-01',
        end: today,
    })
    const [departement, setDepartement] = useState(35)
    const [nYears, setNYears] = useState(1)
    const [filtreCard, setFiltreCard] = useState({date: initDate, col: 'RR', phenom: 'BROU'})

    const {data: dataPerYear = [], isLoading: perYearLoad, isFetching: perYearFetch} = useGetDataPerQuery({
        departement,
        start: periode.start,
        end: periode.end,
        time: 'year',
        columns: 'columns=TX&columns=TN&columns=TNTXM&columns=RR'
    })

    const {data: dataPerMonth = [], isLoading: perMonthLoad, isFetching: perMonthFetch} = useGetDataPerQuery({
        departement,
        start: filtreCard.date,
        end: `${moment(filtreCard.date).format('YYYY')}-12-31`,
        time: 'month',
        columns: 'columns=TNTXM&columns=RR'
    })

    const {data: annualSumDataRRT = [], isLoading: annualSumLoad, isFetching: annualSumFetch} = useGetAnnualSumDataQuery({
        annee: `${moment(filtreCard.date).format('YYYY')}`,
        columns: 'columns=TNSOL&columns=TN50&columns=TNTXM&columns=RR&columns=NOM_USUEL',
        dataset: 'rrt_vent'
    })

    const {data: annualSumDataAutres = [], isLoading, isFetching} = useGetAnnualSumDataQuery({
        annee: `${moment(filtreCard.date).format('YYYY')}`,
        columns: 'columns=NEIG&columns=BROU&columns=ORAG&columns=GRESIL&columns=GRELE&columns=ROSEE&columns=GELEE&columns=FUMEE&columns=BRUME&columns=ECLAIR&columns=NOM_USUEL',
        dataset: 'autre_params'
    })

    

    const FiltreCard = () => (
        <DatePicker 
            allowClear={false}
            disabledDate={disableFutureYears}
            value={dayjs(filtreCard.date)} 
            onChange={(_, dateString) => setFiltreCard({...filtreCard, date: `${dateString}-01-01`})} 
            picker="year" 
        />
    )

    const FiltreCard3 = () => (
        <Select
            style={{ marginRight: 15, width: 300}}
            options={columns}
            value={filtreCard.col}
            onChange={value => setFiltreCard({...filtreCard, col: value})}
        />
    )

    const FiltreCard4 = () => (
        <Select
            style={{ marginRight: 15, width: 300}}
            options={phenomenes}
            value={filtreCard.phenom}
            onChange={value => setFiltreCard({...filtreCard, phenom: value})}
        />
    )
 
    return (
        <PageLayout page="home" text="Visiualisation périodique de la température sous abri et précipitation">
            <Row gutter={[16, 16]}>
                <EvolutionAnnuelle 
                    title="Evolution moyenne des températures (min, max) et précipitaions par année"
                    nYears={nYears} 
                    departement={departement}
                    data={dataPerYear} 
                    isLoading={perYearLoad || perYearFetch}
                    periode={periode}
                    setNYears={setNYears}
                    setDepartement={setDepartement}
                    setPeriode={setPeriode}
                    type="tmp-precipitation"
                />

                <Col xs={24} sm={24} md={24}>
                    <Card title="Impact de la température sur la précipitations par mois pour l'année" extra={<FiltreCard />}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} md={12}>
                                <Card title="Température vs Précipitations" bordered>
                                    <AverageMonthChart average={dataPerMonth} isLoading={perMonthLoad || perMonthFetch} />
                                </Card>
                            </Col>
                            
                            <Col xs={24} sm={24} md={12}>
                                <Card title={`Cartographie par zone`} bordered extra={<FiltreCard3 />}>
                                    <Map annualPerMonth={annualSumDataRRT} col={filtreCard.col} isLoading={annualSumLoad || annualSumFetch} />
                                </Card>
                            </Col>
                        </Row>

                        <Card style={{marginTop: 20}} title="Cartographie des phénomènes par zone" bordered extra={<FiltreCard4 />}>
                            <Map annualPerMonth={annualSumDataAutres} col={filtreCard.phenom} isLoading={isLoading || isFetching} />
                        </Card>
                    </Card>
                </Col>                
            </Row>
        </PageLayout>
    )
}

export default Home
