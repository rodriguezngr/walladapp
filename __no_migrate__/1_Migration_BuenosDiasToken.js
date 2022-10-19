const BuenosDiasToken = artifacts.require('BuenosDiasToken')

module.exports = function (deployer) {
    deployer.deploy(BuenosDiasToken)
}