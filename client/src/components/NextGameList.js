import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { isConnected, _isPurchased } from '../util/buenosdias'
import { InitialState } from '../util/consts'
import { Web3Instance } from '../util/web3Instance'

import BuenosDiasContract from '../contracts/BuenosDias'
import BuenosDiasFactory from '../factory/BuenosDiasfactory'
import TokenContract from '../contracts/BuenosDiasToken'
import TokenFactory from '../factory/tokenfactory'
import Login from './Login'

import './NextGameList.scss'
import { Carousel, Row, Card, Popover, Modal, Tag, Button, message } from 'antd'
import { MailOutlined, CopyOutlined } from '@ant-design/icons'
import { _bnbToWei, _toBigNumber, _weiToBNB } from '../util/units'
import axios from 'axios'
import { hashToURL } from '../util/imagesaver'


class NextGamesList extends Component {
    constructor(props) {
        super(props)
        this.state = InitialState.NextGameList
    }

    checkConnection() {
        if (isConnected()) {
            if (this.historyListener)
                this.historyListener = undefined

            this.historyListener = this.props.history.listen(location => {
                this.setState({
                    section: this.getSection(location),
                    imagesLoaded: false
                }, async () => {
                    this.load()
                })
            })

            this.setState({
                section: this.getSection(this.props.location),
            }, () => {
                if (this.state.section)
                    this.load()
                else this.props.history.push('/Perfumeria')
            })
        } else this.props.history.push('/login')
    }

    async componentDidMount() {
        this._web3Instance = await new Web3Instance().init()
        this.checkConnection()        
    }

    getSection() {
        const section = window.location.pathname.replace('/', '').trim().toLowerCase()
        return section === '' ? 'Perfumeria' : section
    }

    disconnect() {
        this._web3Instance.disconnect()
        this.resetState()
    }

    resetState() {
        this.setState(InitialState.NextGameList)
    }

    productIndexByHash(hash) {
        return this.state.data.map(item => item.dataHash).indexOf(hash)
    }

    loadImages(item) {
        axios.get(hashToURL(item.dataHash))
            .then(function (res) {
                if (res.data) {
                    item['desc'] = res.data.desc
                    res.data.images.forEach(image => {
                        item.images.push(hashToURL(image))
                    })
                    const itemIndex = this.productIndexByHash(item.dataHash)
                    if (itemIndex > -1) {
                        this.setState(prevState => {
                            const updatedData = [...prevState.data]
                            updatedData[itemIndex] = item
                            return { data: updatedData }
                        })
                    }
                }
            }.bind(this))
    }

    async load() {
        this.setState({
            account: this._web3Instance.getAccount()
        }, async () => {
            const Token = await TokenContract(this._web3Instance.getProvider())
            const BuenosDias = await BuenosDiasContract(this._web3Instance.getProvider())

            this._BuenosDiasFactory = new BuenosDiasFactory(BuenosDias)
            this._TokenFactory = new TokenFactory(Token)

            this.setState({
                data: (await this._BuenosDiasFactory._getProducts()),
                token_symbol: (await this._TokenFactory._symbol())
            })

            if (this.state.data.length > 0 && !this.state.imagesLoaded) {
                this.state.data.forEach(async (item) => {
                    if (item.section === this.state.section)
                        this.loadImages(item)
                })
            }

            this.setState({
                imagesLoaded: true
            })
        })
    }

    getCarousel(images) {
        return (
            <Carousel>
                {
                    images.map((image, i) => {
                        return <div key={i}>
                            <img src={image} />
                        </div>
                    })
                }
            </Carousel>
        )
    }

    itemDetailsVisibility = async (visible, account) => {
        if (visible) {
            this.setState({
                itemDetailsContact: (await this._BuenosDiasFactory._getUser(account)).contact
            })
        } else {
            this.setState({
                itemDetailsContact: undefined
            })
        }
    }

    copyAddr() {
        navigator.clipboard.writeText(this.state.itemDetailsContact)
        message.success({ content: '¡Contacto copiado!', key: this.state.account, duration: 3 })
    }

    popContent(item) {
        return (
            <div className="popover">
                <p>{item.desc}</p>
                <Tag
                    icon={<MailOutlined />}
                    color={this.state.itemDetailsContact ? 'success' : 'error'}>
                    {this.state.itemDetailsContact ? this.state.itemDetailsContact : 'Sin contacto'}
                </Tag>
                {this.state.itemDetailsContact ?
                    <span
                        onClick={() => this.copyAddr()}
                        className="user-account-header__item-contact">
                        <CopyOutlined />
                    </span>
                    : ''}
            </div>
        )
    }

    getOpenPurchaseButton(item) {
        return (
            _isPurchased(item.reserved_by) ?
                <Button danger disabled shape="round">COMPRADO</Button> :
                <Button type="primary" shape="round" onClick={async () => this.selectItem(item)}>
                    {_weiToBNB(item.price)} {this.state.token_symbol}
                </Button>
        )
    }

    async selectItem(item) {
        this.setState({
            allowance: (await this._TokenFactory._allowance(this.state.account, this._BuenosDiasFactory._address())),
            itemToBuy: item,
            isModalVisible: true
        })
    }

    async approve() {
        const hideLoad = message.loading(`Aprobando ${_weiToBNB(this.state.itemToBuy.price)} ${this.state.token_symbol}...`, 0)
        try {
            await this._TokenFactory._approve(
                this._BuenosDiasFactory._address(),
                _toBigNumber(this.state.itemToBuy.price), this.state.account
            )

            this.setState({
                allowance: (await this._TokenFactory._allowance(this.state.account, this._BuenosDiasFactory._address()))
            }, () => {
                hideLoad()
                message.success({ content: `${_weiToBNB(this.state.itemToBuy.price)} ${this.state.token_symbol} aprobados correctamente!`, key: this.state.account, duration: 2 })
            })
        } catch (err) {
            hideLoad()
            message.error({ content: `Ha ocurrido un error`, key: this.state.account, duration: 2 })
        }
    }

    async buyItem() {
        const hideLoad = message.loading(`Comprando ${this.state.itemToBuy.name}...`, 0)

        try {
            await this._BuenosDiasFactory._buyProduct(this.state.itemToBuy.id, this.state.account)
            this.setState({
                isModalVisible: false,
                data: (await this._BuenosDiasFactory._getProducts())
            }, () => {
                hideLoad()
                message.success({ content: `${this.state.itemToBuy.name} comprado correctamente!`, key: this.state.account, duration: 2 })
                this.load()
            })
        } catch (err) {
            hideLoad()
            message.error({ content: `Ha ocurrido un error`, key: this.state.account, duration: 2 })
        }
    }

    getApproveButton() {
        return (this.state.itemToBuy.price > this.state.allowance ?
            <Button key="approve" shape="round" type="primary" onClick={() => { this.approve() }}>Aprobar</Button> :
            <Button disabled key="approve" shape="round" type="primary">Aprobar</Button>)
    }

    getPurchaseButton() {
        return (this.state.itemToBuy.price <= this.state.allowance ?
            <Button key="purchase" shape="round" type="primary" onClick={() => { this.buyItem() }}>Comprar</Button> :
            <Button disabled key="purchase" shape="round" type="primary">Comprar</Button>
        )
    }

    render() {
        if (isConnected())
            return <>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    {
                        this.state.data.map((pass, index) => {
                            if (this.state.section === pass.section)
                                return (
                                    <Card
                                        key={index}
                                        hoverable
                                        style={{ width: 200, margin: '10px' }}
                                        cover={this.getCarousel(pass.images)}>
                                        <Popover
                                            onOpenChange={async (visible) => this.itemDetailsVisibility(visible, pass.owner)}
                                            content={this.popContent(pass)}
                                            title={pass.name}
                                            trigger="click">
                                            <Card.Meta title={pass.name}></Card.Meta>
                                        </Popover>
                                        <p></p>
                                        {this.getOpenPurchaseButton(pass)}
                                    </Card>
                                )
                        })
                    }
                </Row>
                <Modal
                    footer={[
                        this.getApproveButton(),
                        this.getPurchaseButton()
                    ]}
                    title={this.state.itemToBuy.name}
                    visible={this.state.isModalVisible}
                    onCancel={() => {
                        this.setState({
                            isModalVisible: false
                        })
                    }}>

                    <Row>
                        <span>
                            {this.state.itemToBuy.desc}
                        </span>
                    </Row>
                </Modal>
            </>
        else return <Login />
    }
}

export default withRouter(NextGamesList)