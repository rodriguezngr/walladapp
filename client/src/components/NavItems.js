import React, { useState } from 'react';
import { Link, useLocation, withRouter } from 'react-router-dom'
import 'antd/dist/antd.dark.css'
import { Layout, Menu } from 'antd'
import Icon from '@ant-design/icons'


import './NavItems.scss'

const { Sider } = Layout


function NavItems() {
    const [appData, setAppData] = useState({
        collapsed: false,
        appLogo: '/favicon.png'
    })

    const onCollapse = () => {
        setAppData({
            collapsed: !appData.collapsed,
            appLogo: !appData.collapsed ? '/walldapp_square.png' : '/favicon.png'
        })
    }


    return (
        <Sider collapsible collapsed={appData.collapsed} onCollapse={onCollapse} style={{ padding: '60px 0 0 0' }}>
            <a href="/">
                <div className="logo">
                    <img src={appData.appLogo} />
                </div>
            </a>
            <Menu theme="dark" defaultSelectedKeys={[getSelectedItem()]} mode="inline">

                <Menu.Divider className="main-menu-divider-all" />

                <Menu.Item key="1" icon={<Icon component={() => (<img src="/Perfumeria.png" />)} />}>
                    Perfumeria
                    <Link to="/Perfumeria" />
                </Menu.Item>

                <Menu.Item key="2" icon={<Icon component={() => (<img src="/Bebidas.png" />)} />}>
                    Bebidas
                    <Link to="/Bebidas" />
                </Menu.Item>

                <Menu.Item key="3" icon={<Icon component={() => (<img src="/Limpieza.png" />)} />}>
                    Limpieza
                    <Link to="/Limpieza" />
                </Menu.Item>

                <Menu.Item key="4" icon={<Icon component={() => (<img src="/Ofertas.png" />)} />}>
                    Ofertas
                    <Link to="/Ofertas" />
                </Menu.Item>

                <Menu.Divider className="main-menu-divider-middle" />

                <Menu.Item key="5" icon={<Icon component={() => (<img src="/account.png" />)} />}>
                    CUENTA
                    <Link to="/my-account" />
                </Menu.Item>

                <Menu.Item key="6" icon={<Icon component={() => (<img src="/walldapp_square_mini.png" />)} />}>
                    TOKEN SALE
                    <Link to="/token-sale" />
                </Menu.Item>

            </Menu>
        </Sider>
    );
}

function getSelectedItem() {
    return {
        '/': '1',
        '/Perfumeria': '1',
        '/Bebidas': '2',
        '/Limpieza': '3',
        '/Ofertas': '4',
        '/my-account': '5',
        '/token-sale': '6'
    }[window.location.pathname.replace('/', '').trim().toLowerCase()]
}

export default withRouter(NavItems)
