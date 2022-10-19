import { create } from 'ipfs-http-client'

const projectId = '2FpYnH3z0CrWhfx8HLaUZ2rXhYr'
const projectSecret = 'a5f26d9b3e45122fb4dc25c4a2cbcb39'

const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    timeout: 8000,
    headers: {
        authorization: auth
    }
})

export default ipfs