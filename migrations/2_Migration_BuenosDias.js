const BuenosDias = artifacts.require('BuenosDias')

module.exports = function (deployer) {
    deployer.deploy(BuenosDias, '0x79265165a0a39eE23556c830BF5d9d8B39A98165')
}