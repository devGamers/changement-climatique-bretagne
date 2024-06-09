import dayjs from 'dayjs';
import { Card, Col, DatePicker, Form, InputNumber, Radio, Select, Space } from 'antd'
import { departements, periodes, rangePresets, today } from '../../constants'
import AverageYearChart from '../../pages/home/temperaturePrecipitation/averageYearChart';
import AverageYearTmpPression from '../../pages/pression/graph/averageYear';

const { RangePicker } = DatePicker;

const EvolutionAnnuelle = (props) => {
    const {
        nYears, setNYears,
        departement, setDepartement,
        periode, setPeriode, 
        data, isLoading, title, type
    } = props

    const maxYear = (new Date().getFullYear()) - 1950

    const disabledDate = current => current && current < dayjs('1949-12-31').endOf('day')

    const handleKeyPress = (event) => {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
          event.preventDefault();
        }
    };

    const changePeriode = e => {
        const value = e.target.value
        let period = {start: periode.start, end: periode.end}
        if (value > 0) {
            const find = periodes.find(item => item.value === value)
            period = {start: find.periode.start, end: find.periode.end}
        }
        setPeriode({value, ...period})
    }

    const changeLastYears = n => {
        if (n && parseInt(n) <= maxYear) {
            setNYears(n);
            setPeriode({
                ...periode,
                start: dayjs().add(-parseInt(n), 'year').format('YYYY-MM-DD'), 
                end: today
            })
        }
    }

    return (
        <>
            <Col xs={24} sm={24} md={5}>
                <Card title="Filtres" bordered>
                    <Form layout='vertical'>
                        <Form.Item label="Département">
                            <Select
                                style={{ width: '100%' }}
                                options={departements}
                                defaultValue={departement}
                                value={departement}
                                onChange={value => setDepartement(value)}
                            />
                        </Form.Item>
                    </Form>

                    <Form layout='vertical'>
                        <Form.Item label="Périodes">
                            <Radio.Group onChange={e => changePeriode(e)} value={periode.value}>
                                <Space direction="vertical">
                                    {periodes.map((periode, indice) => (
                                        <Radio value={periode.value} key={indice}>{periode.siecle}</Radio>
                                    ))}
                                    <Radio value={-1}>N dernière(s) année(s). (Max : {maxYear} ans)</Radio>
                                    <InputNumber 
                                        min={1}
                                        max={maxYear}
                                        style={{ width: '100%' }}
                                        controls={false}
                                        disabled = {periode.value !== -1}
                                        value={nYears} 
                                        onKeyPress={handleKeyPress}
                                        onChange={value => changeLastYears(value)}
                                    />
                                    <Radio value={0}>Autre</Radio>
                                    <RangePicker
                                        allowClear={false} 
                                        presets={rangePresets}
                                        disabledDate={disabledDate}
                                        disabled = {periode.value !== 0}
                                        value={[dayjs(periode.start), dayjs(periode.end)]}
                                        onChange={(_, dateString) => setPeriode({...periode, start: dateString[0], end: dateString[1]})}
                                    />
                                </Space>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
            <Col xs={24} sm={24} md={19}>
                <Card title={title} bordered>
                    {type === "tmp-precipitation" && <AverageYearChart average={data} isLoading={isLoading} />}
                    {type === "tmp-pression" && <AverageYearTmpPression average={data} isLoading={isLoading} />}
                    
                </Card>
            </Col>
        </>
    )
}

export default EvolutionAnnuelle
