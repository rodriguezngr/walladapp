import BuenosDiasContract from './BuenosDias.json'
import contract from 'truffle-contract'

export default async (provider) => {
    const BuenosDias = contract(BuenosDiasContract)
    BuenosDias.setProvider(provider)
    var instance = await BuenosDias.deployed()
    return instance
}