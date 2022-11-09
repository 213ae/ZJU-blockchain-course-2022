import React, { Component } from 'react'
import moment from 'moment'
import './index.css'

export default class List extends Component {
  state = {
    is_expand: false,
    expand_id: 1
  }
  expand = (id, title, proposer, start_time, detail) => {
    const { is_expand, expand_id } = this.state;
    return () => {
      if (!is_expand) {
        this.setState({ expand_id: id, is_expand: !is_expand });
        this.form_title.value = title;
        this.form_author.value = proposer;
        this.form_time.value = moment(start_time / 1).format("y-M-d HH:mm:ss");
        this.form_detail.value = detail;
      } else {
        if (expand_id === id) {
          this.setState({ is_expand: !is_expand });
        } else {
          this.setState({ expand_id: id });
          this.form_title.value = title;
          this.form_author.value = proposer;
          this.form_time.value = moment(start_time / 1).format("y-M-d hh:mm:ss");
          this.form_detail.value = detail;
        }
      }
    }
  }
  render() {
    const { proposals, vote } = this.props;
    const { is_expand, expand_id } = this.state;
    return (
      <div>
        <h2 className='list-title'>提案列表</h2>
        <table className='list-table'>
          <thead>
            <tr>
              <th className='col1'>提案号</th>
              <th className='col2'>标题</th>
              <th className='col3'>提案人</th>
              <th className='col4'>详情</th>
              <th className='col5'>当前状态</th>
              <th className='col6'>赞成/反对</th>
              <th className='col7'>您的选择</th>
            </tr>
          </thead>
          <tbody>
            {
              proposals.map(({ id, title, proposer, detail, start_time, state, agree_num, disagree_num, is_vote }) => {
                return (
                  <tr key={id}>
                    <td className='col1'>{parseInt(id) + 1}</td>
                    <td className='col2'><div className='text-overflow' title={title}>{title}</div></td>
                    <td className='col3'><div className='text-overflow' title={proposer}>{proposer}</div></td>
                    <td className='col4'><div className='expand' onClick={this.expand(id, title, proposer, start_time, detail)}>{is_expand && expand_id === id ? '收起' : '展开'}</div><div className='text-overflow' title={detail}>{detail}</div></td>
                    <td className='col5'>{state === 0 ? "进行中" : state === 1 ? "通过" : "未通过"}</td>
                    <td className='col6'>{agree_num}/{disagree_num}</td>
                    <td className='col7'>{
                      is_vote !== "0" ?
                        is_vote === "1" ?
                          "已赞成" :
                          "已反对" :
                        state !== 0 ?
                          "未投票" :
                          <div>
                            <button onClick={vote(true, id)}>赞成</button>
                            <button onClick={vote(false, id)} className='no'>反对</button>
                          </div>
                    }
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <form className='detail-info' ref={c => this.form = c} style={{ display: is_expand ? 'block' : 'none' }}>
          <ul>
            <li>
              <label>标题: </label>
              <input type="text" ref={c => this.form_title = c} />
            </li>
            <li>
              <label>提案人: </label>
              <input type="text" ref={c => this.form_author = c} />
            </li>
            <li>
              <label>发起时间: </label>
              <input type="text" ref={c => this.form_time = c} />
            </li>
            <li>
              <label>详情: </label>
              <textarea ref={c => this.form_detail = c}></textarea>
            </li>
          </ul>
        </form>
      </div >
    )
  }
}
