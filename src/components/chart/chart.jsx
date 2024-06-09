import { AgChartsReact } from "ag-charts-react"
import { Skeleton } from "antd"
import { DotChartOutlined } from '@ant-design/icons';

const Chart = props => {
    const {isLoading, options} = props
    return (
        <div className="wrapper">
            {isLoading ? 
                <Skeleton.Node active style={{ width: '100%', height: '385px' }}>
                    <DotChartOutlined style={{ fontSize: 100, color: '#bfbfbf' }}/>
                </Skeleton.Node> : 
                <AgChartsReact options={options} />
            }
        </div>
    )
}

export default Chart
