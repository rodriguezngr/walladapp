const BuenosDias = artifacts.require('BuenosDias')

module.exports = function (deployer) {
    deployer.deploy(BuenosDias, '0x4a445A422a43c7c2a953290b1B999fBDAc056762')
}