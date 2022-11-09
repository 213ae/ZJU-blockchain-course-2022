import React, { Component } from 'react'
import PubSub from 'pubsub-js'
import List from '../List'
import { web3, proposalContract } from "../../utils/contracts"
import './index.css'

export default class Body extends Component {
  state = {
    points: 0,
    is_proposaling: false,
    proposals: [],
  }

  getPoint = async () => {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length !== 0) {
      try {
        let ret = await proposalContract.methods.getPoint(accounts[0]).call();
        this.setState({ points: ret });
      } catch (e) {
        console.log(e);
      }
    }
  }

  getProposals = async () => {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length !== 0) {
      try {
        let proposal_len = await proposalContract.methods.proposal_len().call();
        // await proposalContract.methods.updateProposalState().send({ from: accounts[0], gas: 1000000 });
        let proposals = [];
        for (let i = proposal_len - 1; i >= 0; i--) {
          let proposal = await proposalContract.methods.proposals(i).call();
          let voter = await proposalContract.methods.getVoter(proposal.id).call();
          proposal.agree_num = parseInt(voter[0]);
          proposal.disagree_num = parseInt(voter[1]);
          let now = new Date().getTime();
          if (now - parseInt(proposal.start_time) > 60 * 1000) {
            if (proposal.agree_num > proposal.disagree_num) proposal.state = 1;
            else proposal.state = 2;
          } else {
            proposal.state = 0;
          }
          proposal.is_vote = await proposalContract.methods.is_voted(proposal.id, accounts[0]).call();
          proposals.push(proposal);
        }
        this.setState({ proposals: proposals });
      } catch (e) {
        console.log(e);
      }
    }
  }

  checkin = async () => {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("请先登录");
      return;
    }
    try {
      await proposalContract.methods.checkin().send({ from: accounts[0], gas: 1000000 });
    } catch (e) {
      alert("您已签到");
      console.log(e);
    }
    this.getPoint();
  }

  changeProposalState = async () => {
    const { is_proposaling, points } = this.state;

    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("请先登录");
      return;
    }
    if (!is_proposaling && points < 3) {
      alert("积分不足! 发起提案需要3点积分");
      return;
    }

    this.setState({ is_proposaling: !is_proposaling });
    this.form_title.value = "";
    this.form_detail.value = "";
  }

  submit = async () => {
    const { proposals } = this.state;
    const { form_title: { value: title }, form_detail: { value: detail } } = this;

    if (title === "") {
      alert("提案标题不能为空");
      return;
    }
    if (detail === "") {
      alert("提案详情不能为空");
      return;
    }
    if (window.confirm("您确定要花费3积分发起提案吗")) {

      const accounts = await web3.eth.getAccounts();
      console.log(1)
      if (accounts.length !== 0) {
        try {
          let id = proposals.length;
          let start_time = new Date().getTime();
          console.log(start_time);
          await proposalContract.methods.submitProposal(id, title, detail, start_time).send({ from: accounts[0], gas: 1000000 });
          
          this.setState({ is_proposaling: false });

          window.location.reload();
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  vote = (choice, id) => {
    const { points, proposals } = this.state;
    return async () => {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        alert("请先登录");
        return;
      }
      if (points < 1) {
        alert("积分不足! 投票需要1点积分");
        return;
      }
      for (let proposal of proposals) {
        if (proposal.id === id) {
          let now = new Date().getTime();
          if (now - parseInt(proposal.start_time) > 60 * 1000) alert("投票已结束");
          else await proposalContract.methods.vote(id, choice).send({ from: accounts[0], gas: 1000000 });
          window.location.reload();
        }
      }
      this.setState({ proposals, points: points - 1 });
    };
  }

  update = async () => {
    const accounts = await web3.eth.getAccounts();
    await proposalContract.methods.updateProposalState().send({ from: accounts[0], gas: 1000000 });
    this.getPoint();
  }

  componentDidMount() {
    if (this.user_addr === 0x0) {
      PubSub.subscribe("user_addr", (_, { user_addr }) => {
        this.user_addr = user_addr;
      });
    }
    this.getPoint();
    this.getProposals();
  }

  render() {
    const { points, is_proposaling: isProposaling, proposals } = this.state;
    return (
      <div className='body'>
        <div className='readme'>
          <h4>使用说明</h4>
          <ul>
            <li>每日签到可获得10积分</li>
            <li>发起提案需要3点积分</li>
            <li>投票需要1点积分</li>
            <li>若提案通过可以点击“领取提案通过奖励”按钮获得10积分</li>
            <li>为了方便测试，提案投票持续一分钟</li>
          </ul>

        </div>
        <ul className='menu'>
          <li onClick={this.getProposals}>您的积分: {points}</li>
          <li><button onClick={this.checkin}>每日签到</button></li>
          <li><button onClick={this.update}>领取提案通过奖励</button></li>
          <li><button onClick={this.changeProposalState}>{isProposaling ? "取消发起" : "发起提案"}</button></li>
        </ul>
        <form className='proposal-form' style={{ display: isProposaling ? 'block' : 'none' }}>
          <ul>
            <li>
              <label htmlFor="proposal-topic">标题: </label>
              <input type="text" id="proposal-topic" ref={c => this.form_title = c} placeholder='请输入提案标题' />
            </li>
            <li>
              <label htmlFor="proposal-detail" onClick={this.submit}>详情: </label>
              <textarea id="proposal-detail" ref={c => this.form_detail = c} placeholder='请输入提案详情'></textarea>
            </li>
            <li className='clearfix'>
              <div onClick={this.submit}>提交</div>
            </li>
          </ul>
        </form>
        <List points={points} proposals={proposals} vote={this.vote} />
      </div>
    )
  }
}
