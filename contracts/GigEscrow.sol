// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";


contract GigEscrow is ERC2771Context, ReentrancyGuard {

    using SafeERC20 for IERC20;

    struct Milestone {
        string description;
        uint value;
        bool completed;
    }

    struct Gig {
        uint gigId;
        address payable client;
        address payable freelancer;
        uint totalBudget;
        string description;
        State state;
        bool exists;
        Milestone[] milestones;
        uint completedMilestoneCount;
        address token;  // ERC20 token address (zero for ETH)
    }

    enum State { Open, InProgress, Disputed, Completed, CancelledByClient, CancelledByFreelancer }

    address public arbitrator;
    mapping(uint => string) public badgeUrisByCount;

    struct Dispute {
        address raisedBy;
        string reason;
        bool exists;
        bool resolved;
        bool freelancerWins;
    }

    mapping(uint => Dispute) public disputes;

    mapping(uint => Gig) public gigs;
    uint public nextGigId;

    mapping(address => uint) public freelancerCompletedGigs;
    mapping(address => uint) public freelancerTotalEarned;

    address public stakeToken;
    uint public stakeAmount;
    mapping(uint => mapping(address => bool)) public hasBid;
    mapping(uint => address[]) public bidders;

    // Leaderboard: track start and completion times
    mapping(uint => uint) public gigStartTime;
    mapping(uint => uint) public gigCompletionTime;

    event GigPosted(uint indexed gigId, address indexed client, uint totalBudget, string description, uint milestoneCount);
    event FreelancerSelected(uint indexed gigId, address indexed freelancer);
    event MilestonePaymentReleased(uint indexed gigId, uint indexed milestoneIndex, address indexed freelancer, uint amount);
    event GigCancelledByClient(uint indexed gigId, uint refundAmount);
    event GigCancelledByFreelancer(uint indexed gigId, uint refundAmount);
    event FreelancerReputationUpdated(address indexed freelancer, uint completedGigs, uint totalEarned);
    event DisputeRaised(uint indexed gigId, address indexed by, string reason);
    event DisputeResolved(uint indexed gigId, bool freelancerWins, uint amount);
    event GigStarted(uint indexed gigId, address indexed freelancer, uint startTime);
    event GigCompletedDetailed(uint indexed gigId, address indexed freelancer, uint startTime, uint completionTime, uint duration);

    modifier onlyClient(uint _gigId) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(_msgSender() == gigs[_gigId].client, "GigEscrow: Only the client can call this");
        _;
    }

    modifier onlyFreelancer(uint _gigId) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(gigs[_gigId].freelancer != address(0), "GigEscrow: Freelancer not assigned");
        require(_msgSender() == gigs[_gigId].freelancer, "GigEscrow: Only the freelancer can call this");
        _;
    }

    modifier inState(uint _gigId, State _state) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(gigs[_gigId].state == _state, "GigEscrow: Gig is not in the required state");
        _;
    }

    modifier onlyArbitrator() {
        require(_msgSender() == arbitrator, "GigEscrow: Only arbitrator can call");
        _;
    }

    constructor() ERC2771Context(address(0)) {
        arbitrator = _msgSender();
    }

    // Admin config for staking
    function setStakeParams(address _stakeToken, uint _stakeAmount) external onlyArbitrator {
        stakeToken = _stakeToken;
        stakeAmount = _stakeAmount;
    }

    function postGig(
        address _token,
        string memory _description,
        string[] memory _milestoneDescriptions,
        uint[] memory _milestoneValues
    ) public payable nonReentrant {
        require(_milestoneDescriptions.length > 0, "GigEscrow: Must have at least one milestone");
        require(_milestoneDescriptions.length == _milestoneValues.length, "GigEscrow: Milestone descriptions and values count mismatch");

        uint calculatedTotalBudget = 0;
        for (uint i = 0; i < _milestoneValues.length; i++) {
            require(_milestoneValues[i] > 0, "GigEscrow: Milestone value must be positive");
            calculatedTotalBudget += _milestoneValues[i];
        }

        // Handle ETH vs ERC20 deposit
        if (_token == address(0)) {
            require(msg.value == calculatedTotalBudget, "GigEscrow: Sent ETH must match total milestone values");
        } else {
            require(msg.value == 0, "GigEscrow: Do not send ETH for ERC20 gigs");
            IERC20(_token).safeTransferFrom(_msgSender(), address(this), calculatedTotalBudget);
        }

        uint currentGigId = nextGigId;
        Gig storage newGig = gigs[currentGigId];

        newGig.token = _token;
        newGig.gigId = currentGigId;
        newGig.client = payable(_msgSender());
        newGig.freelancer = payable(address(0));
        newGig.totalBudget = calculatedTotalBudget;
        newGig.description = _description;
        newGig.state = State.Open;
        newGig.exists = true;
        newGig.completedMilestoneCount = 0;

        for (uint i = 0; i < _milestoneDescriptions.length; i++) {
            newGig.milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                value: _milestoneValues[i],
                completed: false
            }));
        }

        nextGigId++;
        emit GigPosted(currentGigId, _msgSender(), calculatedTotalBudget, _description, newGig.milestones.length);
    }

    // Freelancer stakes to bid on a gig
    function bidGig(uint _gigId) external inState(_gigId, State.Open) nonReentrant {
        require(stakeToken != address(0) && stakeAmount > 0, "GigEscrow: Staking not configured");
        require(!hasBid[_gigId][_msgSender()], "GigEscrow: Already bid");
        IERC20(stakeToken).safeTransferFrom(_msgSender(), address(this), stakeAmount);
        hasBid[_gigId][_msgSender()] = true;
        bidders[_gigId].push(_msgSender());
    }

    function selectFreelancer(uint _gigId, address payable _freelancer)
        public
        onlyClient(_gigId)
        inState(_gigId, State.Open)
        nonReentrant
    {
        require(_freelancer != address(0), "GigEscrow: Freelancer address cannot be zero");
        require(hasBid[_gigId][_freelancer], "GigEscrow: Freelancer did not bid");
        gigs[_gigId].freelancer = _freelancer;
        gigs[_gigId].state = State.InProgress;
        // record start time
        gigStartTime[_gigId] = block.timestamp;
        emit GigStarted(_gigId, _freelancer, block.timestamp);
        emit FreelancerSelected(_gigId, _freelancer);
    }

    function releaseMilestonePayment(uint _gigId, uint _milestoneIndex)
        public
        onlyClient(_gigId)
        inState(_gigId, State.InProgress)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        require(_milestoneIndex < gig.milestones.length, "GigEscrow: Invalid milestone index");
        require(!gig.milestones[_milestoneIndex].completed, "GigEscrow: Milestone already completed");

        uint amount = gig.milestones[_milestoneIndex].value;
        gig.milestones[_milestoneIndex].completed = true;
        gig.completedMilestoneCount++;

        if (gig.completedMilestoneCount == gig.milestones.length) {
            // record completion
            uint start = gigStartTime[_gigId];
            uint endTime = block.timestamp;
            gigCompletionTime[_gigId] = endTime;
            emit GigCompletedDetailed(_gigId, gig.freelancer, start, endTime, endTime - start);

            gig.state = State.Completed;
            address freelancer = gig.freelancer;
            freelancerCompletedGigs[freelancer]++;
            freelancerTotalEarned[freelancer] += gig.totalBudget;
            emit FreelancerReputationUpdated(freelancer, freelancerCompletedGigs[freelancer], freelancerTotalEarned[freelancer]);
            // Return stake to freelancer
            if (stakeToken != address(0) && stakeAmount > 0) {
                IERC20(stakeToken).safeTransfer(freelancer, stakeAmount);
            }
        }

        // Release payment in ETH or ERC20
        if (gig.token == address(0)) {
            (bool success, ) = gig.freelancer.call{value: amount}("");
            require(success, "GigEscrow: Failed to send ETH to freelancer");
        } else {
            IERC20(gig.token).safeTransfer(gig.freelancer, amount);
        }

        emit MilestonePaymentReleased(_gigId, _milestoneIndex, gig.freelancer, amount);
    }

    function cancelGigByClient(uint _gigId)
        public
        onlyClient(_gigId)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        require(gig.state == State.Open || gig.state == State.InProgress, "GigEscrow: Gig cannot be cancelled in its current state");

        uint refundAmount = 0;
        if (gig.state == State.Open) {
            refundAmount = gig.totalBudget;
        } else {
            for (uint i = 0; i < gig.milestones.length; i++) {
                if (!gig.milestones[i].completed) {
                    refundAmount += gig.milestones[i].value;
                }
            }
        }

        gig.state = State.CancelledByClient;

        if (refundAmount > 0) {
            if (gig.token == address(0)) {
                (bool success, ) = gig.client.call{value: refundAmount}("");
                require(success, "GigEscrow: Failed to refund ETH to client");
            } else {
                IERC20(gig.token).safeTransfer(gig.client, refundAmount);
            }
        }

        emit GigCancelledByClient(_gigId, refundAmount);
    }

    function cancelGigByFreelancer(uint _gigId)
        public
        onlyFreelancer(_gigId)
        inState(_gigId, State.InProgress)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];

        uint refundAmount = 0;
        for (uint i = 0; i < gig.milestones.length; i++) {
            if (!gig.milestones[i].completed) {
                refundAmount += gig.milestones[i].value;
            }
        }

        gig.state = State.CancelledByFreelancer;

        if (refundAmount > 0) {
            if (gig.token == address(0)) {
                (bool success, ) = gig.client.call{value: refundAmount}("");
                require(success, "GigEscrow: Failed to refund ETH to client");
            } else {
                IERC20(gig.token).safeTransfer(gig.client, refundAmount);
            }
        }

        emit GigCancelledByFreelancer(_gigId, refundAmount);
    }

    function raiseDispute(uint _gigId, string memory _reason)
        public
        inState(_gigId, State.InProgress)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        require(_msgSender() == gig.client || _msgSender() == gig.freelancer, "GigEscrow: Only gig parties can raise dispute");
        require(!disputes[_gigId].exists, "GigEscrow: Dispute already raised");

        disputes[_gigId] = Dispute({
            raisedBy: _msgSender(),
            reason: _reason,
            exists: true,
            resolved: false,
            freelancerWins: false
        });
        gig.state = State.Disputed;
        emit DisputeRaised(_gigId, _msgSender(), _reason);
    }

    function resolveDispute(uint _gigId, bool _freelancerWins)
        public
        onlyArbitrator
        inState(_gigId, State.Disputed)
        nonReentrant
    {
        Gig storage gig = gigs[_gigId];
        Dispute storage d = disputes[_gigId];
        require(d.exists && !d.resolved, "GigEscrow: No active dispute");

        uint remainingAmount = 0;
        for (uint i = 0; i < gig.milestones.length; i++) {
            if (!gig.milestones[i].completed) {
                remainingAmount += gig.milestones[i].value;
                gig.milestones[i].completed = true;
            }
        }

        d.resolved = true;
        d.freelancerWins = _freelancerWins;
        if (_freelancerWins) {
            // record completion
            uint startTime = gigStartTime[_gigId];
            uint completionTime = block.timestamp;
            gigCompletionTime[_gigId] = completionTime;
            emit GigCompletedDetailed(_gigId, gig.freelancer, startTime, completionTime, completionTime - startTime);

            gig.state = State.Completed;
            gig.completedMilestoneCount = gig.milestones.length;
            address freelancer = gig.freelancer;
            freelancerCompletedGigs[freelancer]++;
            freelancerTotalEarned[freelancer] += remainingAmount;
            emit FreelancerReputationUpdated(freelancer, freelancerCompletedGigs[freelancer], freelancerTotalEarned[freelancer]);
            // Return stake to freelancer
            if (stakeToken != address(0) && stakeAmount > 0) {
                IERC20(stakeToken).safeTransfer(freelancer, stakeAmount);
            }
        } else {
            gig.state = State.CancelledByClient;
            // Slash stake: transfer to client
            if (stakeToken != address(0) && stakeAmount > 0) {
                IERC20(stakeToken).safeTransfer(gig.client, stakeAmount);
            }
        }

        // Transfer remaining funds
        if (remainingAmount > 0) {
            if (gig.token == address(0)) {
                address recipient = _freelancerWins ? gig.freelancer : gig.client;
                (bool success, ) = payable(recipient).call{value: remainingAmount}("");
                require(success, "GigEscrow: Dispute transfer failed");
            } else {
                IERC20 token = IERC20(gig.token);
                address recipient = _freelancerWins ? gig.freelancer : gig.client;
                token.safeTransfer(recipient, remainingAmount);
            }
        }

        emit DisputeResolved(_gigId, _freelancerWins, remainingAmount);
    }

    function getGig(uint _gigId) public view returns (Gig memory) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        return gigs[_gigId];
    }

    function getMilestone(uint _gigId, uint _milestoneIndex) public view returns (Milestone memory) {
        require(gigs[_gigId].exists, "GigEscrow: Gig does not exist");
        require(_milestoneIndex < gigs[_gigId].milestones.length, "GigEscrow: Invalid milestone index");
        return gigs[_gigId].milestones[_milestoneIndex];
    }

    function getFreelancerCompletedGigs(address _freelancer) public view returns (uint) {
        return freelancerCompletedGigs[_freelancer];
    }

    function getFreelancerTotalEarned(address _freelancer) public view returns (uint) {
        return freelancerTotalEarned[_freelancer];
    }

    receive() external payable {}
    fallback() external payable {}
}
