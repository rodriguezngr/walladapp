const BuenosDiasTokenSale = artifacts.require('BuenosDiasTokenSale')

module.exports = function (deployer) {
    deployer.deploy(BuenosDiasTokenSale, '0x4a445A422a43c7c2a953290b1B999fBDAc056762')
}