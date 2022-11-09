// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./MyERC20.sol";

contract StudentSocietyDAO {
    struct proposal{
        uint id;
        uint state;// 0.进行中 1.通过 2. 未通过
        uint start_time;
        address proposer;
        string title;
        string detail;
    }

    struct vote_list{
        address[] voter_addr;
        bool[] is_agree;
    }

    uint public proposal_len = 0;

    mapping(uint256 => vote_list) proposal_id_to_list; 

    mapping(uint => proposal) public proposals;

    mapping(address => bool) is_checkin;

    MyERC20 myERC20;

    constructor() {
        myERC20 = new MyERC20("ZJUToken", "ZJUTokenSymbol");
    }

    function checkin() external {
        require(is_checkin[msg.sender] == false, "you have checked in already!");
        myERC20.mint(msg.sender, 10);
        is_checkin[msg.sender] = true;
    }

    function getVoter(uint id) view external returns(uint, uint) {
        uint agree_num = 0;
        uint  disagree_num = 0;
        bool[] memory is_agree_list = proposal_id_to_list[id].is_agree;
        for (uint i = 0; i < is_agree_list.length; i++) {
            if (is_agree_list[i]) agree_num++;
            else disagree_num++;
        }
        return (agree_num, disagree_num);
    }

    function is_voted(uint id, address target) view external returns(uint) {
        address[] memory addr_list = proposal_id_to_list[id].voter_addr;
        bool[] memory is_agree_list = proposal_id_to_list[id].is_agree;
        for (uint i = 0; i < addr_list.length; i++) {
            if (addr_list[i] == target) {
                if (is_agree_list[i]) return 1;
                else return 2;
            }
        }
        return 0;
    }

    function getPoint(address sender) view external returns (uint256){
        uint256 temp_point = myERC20.balanceOf(sender);
        return temp_point;
    }

    function submitProposal(uint id, string memory title, string memory detail, uint start_time) external {
        myERC20.burn(msg.sender, 3);
        proposals[id].id = id;
        proposals[id].state = 0;
        proposals[id].proposer = msg.sender;
        proposals[id].title = title;
        proposals[id].detail = detail;
        proposals[id].start_time = start_time;
        proposal_len++;
    }

    function vote(uint256 id, bool choice) external {
        myERC20.burn(msg.sender, 1);
        for (uint i = 0; i < proposal_id_to_list[id].voter_addr.length; i++) {
            if (proposal_id_to_list[id].voter_addr[i] == msg.sender) return;
        }
        proposal_id_to_list[id].voter_addr.push(msg.sender);
        proposal_id_to_list[id].is_agree.push(choice);
    }

    function voteResult( uint256 id) internal returns(bool) {
        uint agree_num = 0;
        uint total = proposal_id_to_list[id].voter_addr.length;
        for (uint i = 0; i < total; i++) {
            if (proposal_id_to_list[id].is_agree[i]) agree_num++;
        }
        if (agree_num * 2 > total) {
            for (uint i = 0; i < proposal_len; i++) {
                if (proposals[i].id == id) {
                    address proposer = proposals[i].proposer;
                    myERC20.mint(proposer,10);
                }
            }
            return true;
        } else {
            return false;
        }
    }

    function updateProposalState() external {
        for (uint i = 0; i < proposal_len; i++) {
            if (proposals[i].state == 0) {
                if (block.timestamp - proposals[i].start_time/1000 > 60) {
                    uint id = proposals[i].id;
                    if (voteResult(id)) {
                        proposals[i].state = 1;
                    } else {
                        proposals[i].state = 2;
                    }
                }
            }
        }
    }
}
