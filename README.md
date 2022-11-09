# ZJU-blockchain-course-2022

## 如何运行

1. 在本地启动 ganache 应用

2. 将 metamask 连接到本地链

3. 将 contracts 目录下的 MyERC20.sol 和 StudentSocietyDAO.sol 文件在 remix 网页版中打开

4. 在 remix 中编译合约，然后部署 StudentSocietyDAO.sol，部署选项 ENVIRONMENT 选择 Injected Provider - Metamask

5. 复制合约地址，替换 ./frontend/src/utils/contracts.js中的Addresses.proposal

6. 复制 remix 中编译生成的 StudentSocietyDAO.json，替换 ./frontend/src/utils/abis/ 文件夹下的同名文件

7. 在 `./frontend` 中启动前端程序，运行如下的命令：

   ```bash
   npm run start
   ```

## 功能实现分析

简单描述：项目完成了以下功能

+ 每个学生初始可以拥有或领取一些通证积分（ERC20）。 
  + 通过每日签到获得积分，智能合约中记录了签到人的地址使其不能重复签到

 - 每个学生可以在应用中可以： 
   1. 使用一定数量通证积分，发起关于该社团进行活动或制定规则的提案（Proposal）。 
      + 在前端页面中通过表单获取用户提交的提案信息，然后发送给智能合约，智能合约会将其保存在链上
   2. 提案发起后一定支出时间内，使用一定数量通证积分可以对提案进行投票（赞成或反对，限制投票次数），投票行为被记录到区块链上。 
      + 每个用户可以投票一次，在智能合约中维护了一个`mapping(id => voter_list)`记录了每个提案的投票情况，voter_list中保存了投票用户的地址和选项
   3. 提案投票时间截止后，赞成数大于反对数的提案通过，提案发起者作为贡献者可以领取一定的积分奖励。 
      + 智能合约通过`block.timestamp`获取当前时间，与提案发起时间作比较，判断提案是否结束和提案人是否获得奖励

## 项目运行截图

放一些项目运行截图。

项目运行成功的关键页面和流程截图。主要包括操作流程以及和区块链交互的截图。

## 参考内容

课程的参考Demo见：[DEMOs](https://github.com/LBruyne/blockchain-course-demos)。
