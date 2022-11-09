import Proposal from "./abis/StudentSocietyDAO.json"

const Addresses = {
    proposal: "0x1a560017ebff4b4E936eB628C91ce4bA56026Ac7",
}
const Web3 = require('web3');

// @ts-ignore
// 创建web3实例
// 可以阅读获取更多信息https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
let web3 = new Web3(window.web3.currentProvider)

// 修改地址为部署的合约地址
const ProposalAddress = Addresses.proposal
const ProposalABI = Proposal.abi

// // 获取合约实例
const proposalContract = new web3.eth.Contract(ProposalABI, ProposalAddress);

// 导出web3实例和其它部署的合约
export { web3, proposalContract}