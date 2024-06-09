import { Layout, Menu, theme, Typography } from 'antd';
import { AreaChartOutlined, BgColorsOutlined, FireOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom';
import './layout.css'

const { Header, Content, Footer } = Layout;

const links = [
    {key: 1, label: <Link to="/">Température - Précipitation</Link>, page: 'home', icon: <BgColorsOutlined />},
    {key: 2, label: <Link to="/temperature-pression">Température - Pression Atmosphérique</Link>, page: 'tempPressionAtmosph', icon: <AreaChartOutlined />},
    {key: 3, label: <Link to="/emission-gaz">Emission des gaz à effet de serre</Link>, page: 'gaz', icon: <FireOutlined />},
]

const PageLayout = (props) => {
    const {children, page, text} = props
    const { token: { colorBgContainer,  borderRadiusLG }, } = theme.useToken();

    const contentMinHeight = window.innerHeight - 350

    const activePage = () => links.find(item => item.page === page)

    return (
        <Layout>
            <Header style={{display: 'flex', alignItems: 'center'}}>
                <div className="demo-logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['1']}
                    selectedKeys={[activePage().key.toString()]}
                    items={links}
                    style={{flex: 1, minWidth: 0}}
                />
            </Header>

            <Content style={{padding: '0 15px'}}>
                <Typography.Title level={4}>{text} pour la Bretagne</Typography.Title>
                <div style={{padding: 15, minHeight: contentMinHeight, background: colorBgContainer, borderRadius: borderRadiusLG}}>
                    {children}
                </div>
            </Content>

            <Footer style={{ textAlign: 'center'}}>
                Université de Rennes ©{new Date().getFullYear()} Created by Groupe 6
            </Footer>
        </Layout>
    );
};
export default PageLayout;