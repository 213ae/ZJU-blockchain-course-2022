import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import { web3} from "../../utils/contracts"
import './index.css'

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

export default class Header extends Component {
	state = {
		user_addr: 0x0
	}

	componentDidMount() {
		// 初始化检查用户是否已经连接钱包
		// 查看window对象里是否存在ethereum（metamask安装后注入的）对象
		const initCheckAccounts = async () => {
			// @ts-ignore
			const { ethereum } = window;
			if (Boolean(ethereum && ethereum.isMetaMask)) {
				// 尝试获取连接的用户账户
				const accounts = await web3.eth.getAccounts()
				if (accounts && accounts.length) {
					this.setState({ user_addr: accounts[0] });
					PubSub.publish("user_addr", { user_addr: accounts[0] });
				}
			}
		}
		initCheckAccounts()
	}

	login = async () => {
		// 查看window对象里是否存在ethereum（metamask安装后注入的）对象
		// @ts-ignore
		const { ethereum } = window;
		if (!Boolean(ethereum && ethereum.isMetaMask)) {
			alert('MetaMask is not installed!');
			return
		}

		try {
			// 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
			if (ethereum.chainId !== GanacheTestChainId) {
				const chain = {
					chainId: GanacheTestChainId, // Chain-ID
					chainName: GanacheTestChainName, // Chain-Name
					rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
				};

				try {
					// 尝试切换到本地网络
					await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.chainId }] })
				} catch (switchError) {
					// 如果本地网络没有添加到Metamask中，添加该网络
					if (switchError.code === 4902) {
						await ethereum.request({
							method: 'wallet_addEthereumChain', params: [chain]
						});
					}
				}
			}

			// 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
			await ethereum.request({ method: 'eth_requestAccounts' });
			// 获取小狐狸拿到的授权用户列表
			// const accounts = await ethereum.request({ method: 'eth_accounts' });
			// 如果用户存在，展示其account，否则显示错误信息
			// PubSub.publish("user_addr", { user_addr: accounts[0] });
			// this.setState({ user_addr: accounts[0] });
			window.location.reload();
		} catch (error) {
			alert(error.message)
		}
	}
	render() {
		let { user_addr } = this.state;
		return (
			<div className='header'>
				<span className='header-info' style={{ visibility: (user_addr === 0x0) ? 'hidden' : 'visible' }}>欢迎您! 用户: {user_addr}</span>
				<button className='header-button' onClick={this.login}>{(user_addr === 0x0) ? '登录' : '切换用户'}</button>
			</div>
		)
	}
}
