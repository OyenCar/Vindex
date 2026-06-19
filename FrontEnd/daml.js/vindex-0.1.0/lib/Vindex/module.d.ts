// Generated from Vindex.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import * as damlLedger from '@daml/ledger';

import * as pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7 from '@daml.js/40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7';
import * as pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a from '@daml.js/733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a';
import * as pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662 from '@daml.js/d14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662';

export declare type TopUpAgentFee = {
  actor: damlTypes.Party;
  proposalCid: damlTypes.ContractId<GovernanceProposal>;
};

export declare const TopUpAgentFee:
  damlTypes.Serializable<TopUpAgentFee> & {
  }
;


export declare type ResolveAfterViolation = {
  actor: damlTypes.Party;
  proposalCid: damlTypes.ContractId<GovernanceProposal>;
};

export declare const ResolveAfterViolation:
  damlTypes.Serializable<ResolveAfterViolation> & {
  }
;


export declare type WorkerViolation = {
  actor: damlTypes.Party;
};

export declare const WorkerViolation:
  damlTypes.Serializable<WorkerViolation> & {
  }
;


export declare type AgentVerdict = {
  rejectionValid: boolean;
};

export declare const AgentVerdict:
  damlTypes.Serializable<AgentVerdict> & {
  }
;


export declare type FinalizeReview = {
  actor: damlTypes.Party;
  reviewCid: damlTypes.ContractId<MilestoneReview>;
};

export declare const FinalizeReview:
  damlTypes.Serializable<FinalizeReview> & {
  }
;


export declare type SubmitMilestone = {
  deliverableHash: string;
};

export declare const SubmitMilestone:
  damlTypes.Serializable<SubmitMilestone> & {
  }
;


export declare type Project = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>;
  members: damlTypes.Party[];
  contributions: Contribution[];
  config: GovernanceConfig;
  worker: damlTypes.Party;
  agent: damlTypes.Party;
  milestones: MilestoneSpec[];
  currentIndex: damlTypes.Int;
  status: MStatus;
  submissionCount: damlTypes.Int;
  maxSubmissions: damlTypes.Int;
  workerDeadline: damlTypes.Time;
  agentOpCost: damlTypes.Numeric;
  budgetVault: damlTypes.ContractId<AssetVault>;
  commitmentVault: damlTypes.ContractId<AssetVault>;
  agentFeeVault: damlTypes.ContractId<AssetVault>;
  paidOut: damlTypes.Numeric;
  currentSubmissionHash: damlTypes.Optional<string>;
  rejectionReasons: damlTypes.Optional<string[]>;
};

export declare interface ProjectInterface {
  AgentVerdict: damlTypes.Choice<Project, AgentVerdict, damlTypes.Optional<damlTypes.ContractId<Project>>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  FinalizeReview: damlTypes.Choice<Project, FinalizeReview, damlTypes.Optional<damlTypes.ContractId<Project>>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  ResolveAfterViolation: damlTypes.Choice<Project, ResolveAfterViolation, damlTypes.Optional<damlTypes.ContractId<Project>>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  WorkerViolation: damlTypes.Choice<Project, WorkerViolation, damlTypes.ContractId<Project>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  SubmitMilestone: damlTypes.Choice<Project, SubmitMilestone, damlTypes.ContractId<Project>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  TopUpAgentFee: damlTypes.Choice<Project, TopUpAgentFee, damlTypes.ContractId<Project>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  Archive: damlTypes.Choice<Project, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
}
export declare const Project:
  damlTypes.Template<Project, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:Project'> &
  damlTypes.ToInterface<Project, never> &
  ProjectInterface;

export declare namespace Project {
  export type CreateEvent = damlLedger.CreateEvent<Project, undefined, typeof Project.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<Project, typeof Project.templateId>
  export type Event = damlLedger.Event<Project, undefined, typeof Project.templateId>
  export type QueryResult = damlLedger.QueryResult<Project, undefined, typeof Project.templateId>
}



export declare type Settlement = {
  members: damlTypes.Party[];
  worker: damlTypes.Party;
  agent: damlTypes.Party;
  reason: string;
  refundedBudget: damlTypes.Numeric;
  refundedCommitment: damlTypes.Numeric;
  refundedAgentFee: damlTypes.Numeric;
  totalPaidOut: damlTypes.Numeric;
};

export declare interface SettlementInterface {
  Archive: damlTypes.Choice<Settlement, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Settlement, undefined>>;
}
export declare const Settlement:
  damlTypes.Template<Settlement, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:Settlement'> &
  damlTypes.ToInterface<Settlement, never> &
  SettlementInterface;

export declare namespace Settlement {
  export type CreateEvent = damlLedger.CreateEvent<Settlement, undefined, typeof Settlement.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<Settlement, typeof Settlement.templateId>
  export type Event = damlLedger.Event<Settlement, undefined, typeof Settlement.templateId>
  export type QueryResult = damlLedger.QueryResult<Settlement, undefined, typeof Settlement.templateId>
}



export declare type RejectProposal = {
};

export declare const RejectProposal:
  damlTypes.Serializable<RejectProposal> & {
  }
;


export declare type AcceptProposal = {
};

export declare const AcceptProposal:
  damlTypes.Serializable<AcceptProposal> & {
  }
;


export declare type ProjectProposal = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>;
  members: damlTypes.Party[];
  contributions: Contribution[];
  config: GovernanceConfig;
  worker: damlTypes.Party;
  agent: damlTypes.Party;
  milestones: MilestoneSpec[];
  budgetVault: damlTypes.ContractId<AssetVault>;
  agentFeeVault: damlTypes.ContractId<AssetVault>;
  agentOpCost: damlTypes.Numeric;
  maxSubmissions: damlTypes.Int;
  commitmentRequired: damlTypes.Numeric;
};

export declare interface ProjectProposalInterface {
  AcceptProposal: damlTypes.Choice<ProjectProposal, AcceptProposal, damlTypes.ContractId<Project>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProjectProposal, undefined>>;
  Archive: damlTypes.Choice<ProjectProposal, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProjectProposal, undefined>>;
  RejectProposal: damlTypes.Choice<ProjectProposal, RejectProposal, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProjectProposal, undefined>>;
}
export declare const ProjectProposal:
  damlTypes.Template<ProjectProposal, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:ProjectProposal'> &
  damlTypes.ToInterface<ProjectProposal, never> &
  ProjectProposalInterface;

export declare namespace ProjectProposal {
  export type CreateEvent = damlLedger.CreateEvent<ProjectProposal, undefined, typeof ProjectProposal.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<ProjectProposal, typeof ProjectProposal.templateId>
  export type Event = damlLedger.Event<ProjectProposal, undefined, typeof ProjectProposal.templateId>
  export type QueryResult = damlLedger.QueryResult<ProjectProposal, undefined, typeof ProjectProposal.templateId>
}



export declare type SetRejectionReasons = {
  actor: damlTypes.Party;
  reasons: string[];
};

export declare const SetRejectionReasons:
  damlTypes.Serializable<SetRejectionReasons> & {
  }
;


export declare type CastVote = {
  voter: damlTypes.Party;
  vote: Vote;
};

export declare const CastVote:
  damlTypes.Serializable<CastVote> & {
  }
;


export declare type MilestoneReview = {
  members: damlTypes.Party[];
  worker: damlTypes.Party;
  agent: damlTypes.Party;
  contributions: Contribution[];
  config: GovernanceConfig;
  milestoneIndex: damlTypes.Int;
  cycle: damlTypes.Int;
  votes: pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2<damlTypes.Party, Vote>[];
  deadline: damlTypes.Time;
  rejectionReasons: damlTypes.Optional<string[]>;
};

export declare interface MilestoneReviewInterface {
  CastVote: damlTypes.Choice<MilestoneReview, CastVote, damlTypes.ContractId<MilestoneReview>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MilestoneReview, undefined>>;
  SetRejectionReasons: damlTypes.Choice<MilestoneReview, SetRejectionReasons, damlTypes.ContractId<MilestoneReview>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MilestoneReview, undefined>>;
  Archive: damlTypes.Choice<MilestoneReview, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<MilestoneReview, undefined>>;
}
export declare const MilestoneReview:
  damlTypes.Template<MilestoneReview, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:MilestoneReview'> &
  damlTypes.ToInterface<MilestoneReview, never> &
  MilestoneReviewInterface;

export declare namespace MilestoneReview {
  export type CreateEvent = damlLedger.CreateEvent<MilestoneReview, undefined, typeof MilestoneReview.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<MilestoneReview, typeof MilestoneReview.templateId>
  export type Event = damlLedger.Event<MilestoneReview, undefined, typeof MilestoneReview.templateId>
  export type QueryResult = damlLedger.QueryResult<MilestoneReview, undefined, typeof MilestoneReview.templateId>
}



export declare type CastProposalVote = {
  voter: damlTypes.Party;
  vote: Vote;
};

export declare const CastProposalVote:
  damlTypes.Serializable<CastProposalVote> & {
  }
;


export declare type GovernanceProposal = {
  members: damlTypes.Party[];
  contributions: Contribution[];
  config: GovernanceConfig;
  agent: damlTypes.Party;
  purpose: string;
  action: ProposalAction;
  votes: pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2<damlTypes.Party, Vote>[];
  deadline: damlTypes.Time;
};

export declare interface GovernanceProposalInterface {
  CastProposalVote: damlTypes.Choice<GovernanceProposal, CastProposalVote, damlTypes.ContractId<GovernanceProposal>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<GovernanceProposal, undefined>>;
  Archive: damlTypes.Choice<GovernanceProposal, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<GovernanceProposal, undefined>>;
}
export declare const GovernanceProposal:
  damlTypes.Template<GovernanceProposal, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:GovernanceProposal'> &
  damlTypes.ToInterface<GovernanceProposal, never> &
  GovernanceProposalInterface;

export declare namespace GovernanceProposal {
  export type CreateEvent = damlLedger.CreateEvent<GovernanceProposal, undefined, typeof GovernanceProposal.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<GovernanceProposal, typeof GovernanceProposal.templateId>
  export type Event = damlLedger.Event<GovernanceProposal, undefined, typeof GovernanceProposal.templateId>
  export type QueryResult = damlLedger.QueryResult<GovernanceProposal, undefined, typeof GovernanceProposal.templateId>
}



export declare type SelectWorker = {
  actor: damlTypes.Party;
  proposalCid: damlTypes.ContractId<GovernanceProposal>;
  applicationCid: damlTypes.ContractId<Application>;
};

export declare const SelectWorker:
  damlTypes.Serializable<SelectWorker> & {
  }
;


export declare type Apply = {
  applicant: damlTypes.Party;
  presentationHash: string;
  contactLink: string;
};

export declare const Apply:
  damlTypes.Serializable<Apply> & {
  }
;


export declare type ProjectPosting = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>;
  members: damlTypes.Party[];
  contributions: Contribution[];
  config: GovernanceConfig;
  agent: damlTypes.Party;
  requirements: string;
  milestones: MilestoneSpec[];
  budgetVault: damlTypes.ContractId<AssetVault>;
  agentFeeVault: damlTypes.ContractId<AssetVault>;
  agentOpCost: damlTypes.Numeric;
  maxSubmissions: damlTypes.Int;
  commitmentRequired: damlTypes.Numeric;
  candidates: damlTypes.Party[];
};

export declare interface ProjectPostingInterface {
  SelectWorker: damlTypes.Choice<ProjectPosting, SelectWorker, damlTypes.ContractId<ProjectProposal>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
  Apply: damlTypes.Choice<ProjectPosting, Apply, damlTypes.ContractId<Application>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
  Archive: damlTypes.Choice<ProjectPosting, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
}
export declare const ProjectPosting:
  damlTypes.Template<ProjectPosting, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:ProjectPosting'> &
  damlTypes.ToInterface<ProjectPosting, never> &
  ProjectPostingInterface;

export declare namespace ProjectPosting {
  export type CreateEvent = damlLedger.CreateEvent<ProjectPosting, undefined, typeof ProjectPosting.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<ProjectPosting, typeof ProjectPosting.templateId>
  export type Event = damlLedger.Event<ProjectPosting, undefined, typeof ProjectPosting.templateId>
  export type QueryResult = damlLedger.QueryResult<ProjectPosting, undefined, typeof ProjectPosting.templateId>
}



export declare type Application = {
  members: damlTypes.Party[];
  applicant: damlTypes.Party;
  presentationHash: string;
  contactLink: string;
  postingCid: damlTypes.ContractId<ProjectPosting>;
};

export declare interface ApplicationInterface {
  Archive: damlTypes.Choice<Application, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Application, undefined>>;
}
export declare const Application:
  damlTypes.Template<Application, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:Application'> &
  damlTypes.ToInterface<Application, never> &
  ApplicationInterface;

export declare namespace Application {
  export type CreateEvent = damlLedger.CreateEvent<Application, undefined, typeof Application.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<Application, typeof Application.templateId>
  export type Event = damlLedger.Event<Application, undefined, typeof Application.templateId>
  export type QueryResult = damlLedger.QueryResult<Application, undefined, typeof Application.templateId>
}



export declare type DeclineInvite = {
};

export declare const DeclineInvite:
  damlTypes.Serializable<DeclineInvite> & {
  }
;


export declare type AcceptInvite = {
};

export declare const AcceptInvite:
  damlTypes.Serializable<AcceptInvite> & {
  }
;


export declare type InvestorInvite = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>;
  members: damlTypes.Party[];
  admin: damlTypes.Party;
  invitee: damlTypes.Party;
  proposedContribution: Contribution;
  agent: damlTypes.Party;
};

export declare interface InvestorInviteInterface {
  AcceptInvite: damlTypes.Choice<InvestorInvite, AcceptInvite, damlTypes.ContractId<InvestorParty>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InvestorInvite, undefined>>;
  Archive: damlTypes.Choice<InvestorInvite, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InvestorInvite, undefined>>;
  DeclineInvite: damlTypes.Choice<InvestorInvite, DeclineInvite, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InvestorInvite, undefined>>;
}
export declare const InvestorInvite:
  damlTypes.Template<InvestorInvite, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:InvestorInvite'> &
  damlTypes.ToInterface<InvestorInvite, never> &
  InvestorInviteInterface;

export declare namespace InvestorInvite {
  export type CreateEvent = damlLedger.CreateEvent<InvestorInvite, undefined, typeof InvestorInvite.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<InvestorInvite, typeof InvestorInvite.templateId>
  export type Event = damlLedger.Event<InvestorInvite, undefined, typeof InvestorInvite.templateId>
  export type QueryResult = damlLedger.QueryResult<InvestorInvite, undefined, typeof InvestorInvite.templateId>
}



export declare type SetupAndPost = {
  requirements: string;
  milestones: MilestoneSpec[];
  budgetAmount: damlTypes.Numeric;
  agentFeeAmount: damlTypes.Numeric;
  agentOpCost: damlTypes.Numeric;
  maxSubmissions: damlTypes.Int;
  commitmentRequired: damlTypes.Numeric;
  candidates: damlTypes.Party[];
};

export declare const SetupAndPost:
  damlTypes.Serializable<SetupAndPost> & {
  }
;


export declare type OpenProposal = {
  purpose: string;
  action: ProposalAction;
  deadline: damlTypes.Time;
};

export declare const OpenProposal:
  damlTypes.Serializable<OpenProposal> & {
  }
;


export declare type InviteInvestor = {
  invitee: damlTypes.Party;
  proposedContribution: Contribution;
};

export declare const InviteInvestor:
  damlTypes.Serializable<InviteInvestor> & {
  }
;


export declare type InvestorParty = {
  admin: damlTypes.Party;
  members: damlTypes.Party[];
  pending: damlTypes.Party[];
  contributions: Contribution[];
  config: GovernanceConfig;
  agent: damlTypes.Party;
};

export declare interface InvestorPartyInterface {
  SetupAndPost: damlTypes.Choice<InvestorParty, SetupAndPost, pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple3<damlTypes.ContractId<ProjectPosting>, damlTypes.ContractId<AssetVault>, damlTypes.ContractId<AssetVault>>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
  InviteInvestor: damlTypes.Choice<InvestorParty, InviteInvestor, damlTypes.ContractId<InvestorInvite>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
  Archive: damlTypes.Choice<InvestorParty, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
  OpenProposal: damlTypes.Choice<InvestorParty, OpenProposal, damlTypes.ContractId<GovernanceProposal>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
}
export declare const InvestorParty:
  damlTypes.Template<InvestorParty, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:InvestorParty'> &
  damlTypes.ToInterface<InvestorParty, never> &
  InvestorPartyInterface;

export declare namespace InvestorParty {
  export type CreateEvent = damlLedger.CreateEvent<InvestorParty, undefined, typeof InvestorParty.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<InvestorParty, typeof InvestorParty.templateId>
  export type Event = damlLedger.Event<InvestorParty, undefined, typeof InvestorParty.templateId>
  export type QueryResult = damlLedger.QueryResult<InvestorParty, undefined, typeof InvestorParty.templateId>
}



export declare type Settle = {
};

export declare const Settle:
  damlTypes.Serializable<Settle> & {
  }
;


export declare type VaultTopUp = {
  amt: damlTypes.Numeric;
};

export declare const VaultTopUp:
  damlTypes.Serializable<VaultTopUp> & {
  }
;


export declare type Spend = {
  amt: damlTypes.Numeric;
};

export declare const Spend:
  damlTypes.Serializable<Spend> & {
  }
;


export declare type Release = {
  amt: damlTypes.Numeric;
  beneficiary: damlTypes.Party;
};

export declare const Release:
  damlTypes.Serializable<Release> & {
  }
;


export declare type AssetVault = {
  vaultType: VaultType;
  funders: damlTypes.Party[];
  stakeholders: damlTypes.Party[];
  amount: damlTypes.Numeric;
};

export declare interface AssetVaultInterface {
  Release: damlTypes.Choice<AssetVault, Release, damlTypes.ContractId<AssetVault>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  Spend: damlTypes.Choice<AssetVault, Spend, damlTypes.ContractId<AssetVault>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  VaultTopUp: damlTypes.Choice<AssetVault, VaultTopUp, damlTypes.ContractId<AssetVault>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  Archive: damlTypes.Choice<AssetVault, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  Settle: damlTypes.Choice<AssetVault, Settle, damlTypes.Numeric, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
}
export declare const AssetVault:
  damlTypes.Template<AssetVault, undefined, '6802c370707b6a1c851499e1d7eaf4ce953fff2b4c1d0f64cc624d343b7eedb0:Vindex:AssetVault'> &
  damlTypes.ToInterface<AssetVault, never> &
  AssetVaultInterface;

export declare namespace AssetVault {
  export type CreateEvent = damlLedger.CreateEvent<AssetVault, undefined, typeof AssetVault.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<AssetVault, typeof AssetVault.templateId>
  export type Event = damlLedger.Event<AssetVault, undefined, typeof AssetVault.templateId>
  export type QueryResult = damlLedger.QueryResult<AssetVault, undefined, typeof AssetVault.templateId>
}



export declare type Tally = {
  acceptPower: damlTypes.Numeric;
  rejectPower: damlTypes.Numeric;
  castPower: damlTypes.Numeric;
  total: damlTypes.Numeric;
};

export declare const Tally:
  damlTypes.Serializable<Tally> & {
  }
;


export declare type Contribution = {
  investor: damlTypes.Party;
  projectFunding: damlTypes.Numeric;
  agentFeeFunding: damlTypes.Numeric;
  weight: damlTypes.Numeric;
};

export declare const Contribution:
  damlTypes.Serializable<Contribution> & {
  }
;


export declare type GovernanceConfig = {
  maxInvestors: damlTypes.Int;
  votingModel: VotingModel;
  thresholdFraction: damlTypes.Numeric;
  weighted: boolean;
  quorumFraction: damlTypes.Numeric;
  defaultReviewWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime;
};

export declare const GovernanceConfig:
  damlTypes.Serializable<GovernanceConfig> & {
  }
;


export declare type MilestoneSpec = {
  deliverablesHash: string;
  payment: damlTypes.Numeric;
  workerWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime;
  reviewWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime;
  violationPct: damlTypes.Numeric;
  isFinal: boolean;
};

export declare const MilestoneSpec:
  damlTypes.Serializable<MilestoneSpec> & {
  }
;


export declare type ProposalAction =
  |  { tag: 'SelectWinner'; value: damlTypes.Party }
  |  { tag: 'ResolveContinue'; value: {} }
  |  { tag: 'ResolveStop'; value: {} }
  |  { tag: 'TopUp'; value: damlTypes.Numeric }
;

export declare const ProposalAction:
  damlTypes.Serializable<ProposalAction> & {
  }
;


export declare type VaultType =
  | 'BudgetV'
  | 'CommitmentV'
  | 'AgentFeeV'
;

export declare const VaultType:
  damlTypes.Serializable<VaultType> & {
  }
& { readonly keys: VaultType[] } & { readonly [e in VaultType]: e }
;


export declare type MStatus =
  | 'Inactive'
  | 'Active'
  | 'Submitted'
  | 'RejPending'
  | 'Revision'
  | 'Accepted'
  | 'Completed'
  | 'Failed'
;

export declare const MStatus:
  damlTypes.Serializable<MStatus> & {
  }
& { readonly keys: MStatus[] } & { readonly [e in MStatus]: e }
;


export declare type Vote =
  | 'ACCEPT'
  | 'REJECT'
;

export declare const Vote:
  damlTypes.Serializable<Vote> & {
  }
& { readonly keys: Vote[] } & { readonly [e in Vote]: e }
;


export declare type VotingModel =
  | 'SimpleMajority'
  | 'SuperMajority'
  | 'Weighted'
;

export declare const VotingModel:
  damlTypes.Serializable<VotingModel> & {
  }
& { readonly keys: VotingModel[] } & { readonly [e in VotingModel]: e }
;

