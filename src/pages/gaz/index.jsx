/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react'
import { useGetAnnualSumDataQuery, useGetDataGazQuery } from '../../redux/api/getDataApi'
import PageLayout from '../layout/layout';
import { Badge, Card, Col, Row, Select, Space, Statistic } from 'antd';
import { annees, energies, polluants, secteurs } from '../../constants';
import './gaz.css'
import Chart from '../../components/chart/chart';

const sumEmissionsByKey = (data, key1, key) => {
    const result = data.reduce((acc, current) => {
      const { emission } = current;
      const keyValue1 = current[key1];
      const keyValue = current[key];
      const compositeKey = `${keyValue1}-${keyValue}`;
      
      if (!acc[compositeKey]) {
        acc[compositeKey] = { [key1]: keyValue1, [key]: keyValue, emission: 0 };
      }
      
      acc[compositeKey].emission += parseFloat(emission.toFixed(2));
      
      return acc;
    }, {});
    
    return Object.values(result);
};

const sumTNTXMByYear = (data) => {
    const result = data.reduce((acc, current) => {
      const { ANNEE, TNTXM } = current;
      
      if (!acc[ANNEE]) {
        acc[ANNEE] = 0;
      }
      
      acc[ANNEE] += TNTXM;
      return acc;
    }, {});
  
    const formattedResult = Object.entries(result).map(([year, emission]) => ({
        ANNEE: parseInt(year, 10),
        TNTXM: emission / 100000
      }));
    
    return formattedResult;
};

const Gaz = () => {

    const {data: dataGaz = [], isLoading} = useGetDataGazQuery()

    const {data: dataTmp1 = [], isLoading: loadTmp1} = useGetAnnualSumDataQuery({annee: 2010, columns: 'columns=TNTXM',  dataset: 'all_data_depts'})
    const {data: dataTmp2 = [], isLoading: loadTmp2} = useGetAnnualSumDataQuery({annee: 2018, columns: 'columns=TNTXM',  dataset: 'all_data_depts'})
    const {data: dataTmp3 = [], isLoading: loadTmp3} = useGetAnnualSumDataQuery({annee: 2020, columns: 'columns=TNTXM',  dataset: 'all_data_depts'})

    const [emissionParType, setEmissionParType] = useState({polluant: [], secteur: [], energie: [], polluantSecteur: [], polluantEnergie: []})
    const [options, setOptions] = useState({
        polluantSecteur: {
            data: [],
            series: [{type: "bar", xKey: "secteur", yKey: "emission", yName: "Secteur", fill: "blue"}]
        },
        polluantEnergie: {
            data: [],
            series: [{type: "bar", xKey: "energie", yKey: "emission", yName: "Energie", fill: "green"}]
        },
        polluantAnnee: {
            series: [
                {
                    type: "line", 
                    xKey: "annee_ref", 
                    yKey: "emission", 
                    yName: "Polluant", 
                    stroke: "red",
                    marker: {
                        shape: 'diamond',
                        size: 10,
                        fill: 'red'
                    },
                    data: [],
                },
                {
                    type: "line", 
                    xKey: "ANNEE", 
                    yKey: "TNTXM", 
                    yName: "Température moyenne (°C et 1/10)",
                    data: [],
                }
            ]
        }
    })
    const [annee, setAnnee] = useState(2020)
    const [polluant, setPolluant] = useState('CO2')
    const [dataTmp, setDataTmp] = useState([])

    useEffect(() => {
        if (!loadTmp1 && !loadTmp2 && !loadTmp3) {
            const data = sumTNTXMByYear(dataTmp1.concat(dataTmp2.concat(dataTmp3)))
            setDataTmp(data)
            console.log(options.polluantAnnee.series[1].data, data)
            options.polluantAnnee.series[1].data = data
            setOptions({...options})
        }
    }, [loadTmp1, loadTmp2, loadTmp3])

    useEffect(() => {
        if (!isLoading && dataGaz.length) {
            const polluantSecteur = sumEmissionsByKey(dataGaz, "secteur", "polluant")
            const polluantEnergie = sumEmissionsByKey(dataGaz, "energie", "polluant")
            const polluantAnnee = sumEmissionsByKey(dataGaz, "annee_ref", "polluant")
            setEmissionParType({
                polluant: polluantAnnee,
                secteur: sumEmissionsByKey(dataGaz, "annee_ref", "secteur"),
                energie: sumEmissionsByKey(dataGaz, "annee_ref", "energie"),
                polluantSecteur: polluantSecteur,
                polluantEnergie: polluantEnergie
            })
            options.polluantAnnee.series[0].data = polluantAnnee.filter(item => item.polluant === polluant)
            setOptions({
                ...options,
                polluantSecteur: {
                    ...options.polluantSecteur,
                    data: polluantSecteur.filter(item => item.polluant === polluant),
                },
                polluantEnergie: {
                    ...options.polluantEnergie,
                    data: polluantEnergie.filter(item => item.polluant === polluant),
                },
            })
        }
    }, [dataGaz, isLoading])

    const getEmissionByPerYear = (type, value) => {
        let list = emissionParType[type].filter(item => item.annee_ref === annee)
        let emission = list.find(item => item[type] === value)
        return emission ? emission.emission : 0
    }

    const changePolluant = value => {
        setPolluant(value)
        options.polluantAnnee.series[0].data = emissionParType.polluant.filter(item => item.polluant === value)
        setOptions({
            ...options, 
            polluantSecteur: {
                ...options.polluantSecteur,
                data: emissionParType.polluantSecteur.filter(item => item.polluant === value),
            },
            polluantEnergie: {
                ...options.polluantEnergie,
                data: emissionParType.polluantEnergie.filter(item => item.polluant === value),
            },
        })
    }

    const AnneeFilter = () => (
        <Select
            options={annees.map(item => {
                return {value: item, label: item}
            })}
            value={annee}
            onChange={value => setAnnee(value)}
        />
    )

    const PolluantFilter = () => (
        <Select
            style={{width: 150}}
            options={polluants.map(item => {
                return {value: item, label: item}
            })}
            value={polluant}
            onChange={value => changePolluant(value)}
        />
    )
    console.log(dataTmp.length)

    return (
        <PageLayout page="gaz" text="Visualisation des Émissions de Gaz (en millions)">
            <Space direction='vertical' >
                <Card title="Total des émissions" bordered extra={<AnneeFilter />}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={24}>
                            <Row gutter={[16, 16]} justify="space-between">
                                {polluants.map((item, index) => (
                                    <Col key={index} xs={24} sm={24} md={4}>
                                        <Badge.Ribbon text={item} color="red" style={{fontSize: "small"}}>
                                            <Card loading={isLoading} size="small" bordered={false} className='card-small'>
                                                <Statistic
                                                    loading={isLoading}
                                                    title="Total"
                                                    value={isLoading ? 0 : getEmissionByPerYear("polluant", item)}
                                                    precision={2}
                                                    valueStyle={{ color: "green", fontSize: "1.1em" }}
                                                    suffix="téqCO2"
                                                />
                                            </Card>
                                        </Badge.Ribbon>
                                    </Col>
                                ))}
                            </Row>
                        </Col>

                        <Col xs={24} sm={24} md={12}>
                            <Card title={`Emission par énergie pour l'année ${annee}`} bordered>
                                <Row gutter={[16, 16]}>
                                    {energies.map((item, index) => (
                                        <Col key={index} xs={24} sm={24} md={8}>
                                            <Badge.Ribbon text={item} style={{fontSize: "small"}}>
                                                <Card loading={isLoading} size="small" bordered={false} className='card-small'>
                                                    <Statistic
                                                        loading={isLoading}
                                                        title="Total"
                                                        value={isLoading ? 0 : getEmissionByPerYear("energie", item)}
                                                        precision={2}
                                                        valueStyle={{ color: "red", fontSize: "1.1em" }}
                                                        suffix="téqCO2"
                                                    />
                                                </Card>
                                            </Badge.Ribbon>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        </Col>

                        <Col xs={24} sm={24} md={12}>
                            <Card title={`Emission par secteur pour l'année ${annee}`} bordered>
                                <Row gutter={[16, 16]}>
                                    {secteurs.map((item, index) => (
                                        <Col key={index} xs={24} sm={24} md={8}>
                                            <Badge.Ribbon text={item} color="green" style={{fontSize: "small"}}>
                                                <Card loading={isLoading} size="small" bordered={false} className='card-small'>
                                                    <Statistic
                                                        loading={isLoading}
                                                        title="Total"
                                                        value={isLoading ? 0 : getEmissionByPerYear("secteur", item)}
                                                        precision={2}
                                                        valueStyle={{ color: "red", fontSize: "1.1em" }}
                                                        suffix="téqCO2"
                                                    />
                                                </Card>
                                            </Badge.Ribbon>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </Card>

                <Card title="Graphique par polluants" bordered extra={<PolluantFilter />}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8}>
                            <Card title={`Emission du ${polluant} par secteur`}>
                                <Chart isLoading={isLoading} options={options.polluantSecteur} />
                            </Card>
                        </Col>

                        <Col xs={24} sm={24} md={8}>
                            <Card title={`Emission du ${polluant} par type d'énergie`}>
                                <Chart isLoading={isLoading} options={options.polluantEnergie} />
                            </Card>
                        </Col>

                        <Col xs={24} sm={24} md={8}>
                            <Card title={`Emission du ${polluant} et la température moyenne par année`}>
                                <Chart isLoading={isLoading || !dataTmp.length} options={options.polluantAnnee} />
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </Space>
            
        </PageLayout>
    )
}

export default Gaz
