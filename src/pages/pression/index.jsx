import { useState } from "react"
import { Button, Card, Col, DatePicker, Row, Tooltip } from "antd"
import { InfoCircleOutlined } from '@ant-design/icons';
import dayjs from "dayjs"
import moment from "moment"
import PageLayout from "../layout/layout"
import { initDate, today } from "../../constants"
import { useGetAnnualSumDataQuery, useGetTmpPressionAnnualDataQuery } from "../../redux/api/getDataApi"
import EvolutionAnnuelle from "../../components/evolutionAnnuelle"
import { disableFutureYears } from "../../helpers"
import AverageMonthTmpPression from "./graph/averageMonth"
import Map from "../../components/map/map"

const PressionAtmospheriqueTemp = () => {
    const [periode, setPeriode] = useState({
        value: 1,
        start: '2001-01-01',
        end: today,
    })
    const [departement, setDepartement] = useState(35)
    const [nYears, setNYears] = useState(1)
    const [filtreCard, setFiltreCard] = useState({date: initDate, col: 'TNTXM'})

    const {data: dataPerYear = [], isLoading: perYearLoad, isFetching: perYearFetch} = useGetTmpPressionAnnualDataQuery({
        departement,
        start: periode.start,
        end: periode.end,
        column_time: 'ANNEE'
    })

    const {data: dataPerMonth = [], isLoading: perMonthLoad, isFetching: perMonthFetch} = useGetTmpPressionAnnualDataQuery({
        departement,
        start: filtreCard.date,
        end: `${moment(filtreCard.date).format('YYYY')}-12-31`,
        column_time: 'MOIS'
    })

    const {data: annualSumData = [], isLoading, isFetching} = useGetAnnualSumDataQuery({
        annee: `${moment(filtreCard.date).format('YYYY')}`,
        columns: 'columns=TNTXM&columns=PMERM&columns=NOM_USUEL',
        dataset: 'all_data_depts'
    })

    const FiltreCard = () => (
        <DatePicker 
            allowClear={false}
            disabledDate={disableFutureYears}
            value={dayjs(filtreCard.date)} 
            onChange={(_, dateString) => setFiltreCard({...filtreCard, date: `${dateString}-01-01`})} 
            picker="year" 
        />
    );

    const Info = () => (
        <Tooltip title="La grandeur du cercle est définie par la valeur de la température, et la couleur par la pression atmosphérique" color="blue">
          <Button><InfoCircleOutlined /></Button>
        </Tooltip>
    )

    return (
        <PageLayout page="tempPressionAtmosph" text="Influence de la Pression Atmosphérique sur les Variations de Température">
            <Row gutter={[16, 16]}>
                <EvolutionAnnuelle
                    title="Evolution moyenne des températures et pression atmosphérique par année"
                    nYears={nYears} 
                    departement={departement}
                    data={dataPerYear} 
                    isLoading={perYearLoad || perYearFetch}
                    periode={periode}
                    setNYears={setNYears}
                    setDepartement={setDepartement}
                    setPeriode={setPeriode}
                    type="tmp-pression"
                />

                <Col xs={24} sm={24} md={24}>
                    <Card title="Impact de la température sur la pression atmosphérique par mois pour l'année" extra={<FiltreCard />}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} md={12}>
                                <Card title="Température vs Pression atmosphérique" bordered>
                                    <AverageMonthTmpPression average={dataPerMonth} isLoading={perMonthLoad || perMonthFetch} />
                                </Card>
                            </Col>

                            <Col xs={24} sm={24} md={12}>
                                <Card title={`Pression atmosphérique par zone où la mesure est présente`} extra={<Info />}>
                                    <Map annualPerMonth={annualSumData} col="TNTXM" isLoading={isLoading || isFetching} pression={true} />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </PageLayout>
    )
}

export default PressionAtmospheriqueTemp
