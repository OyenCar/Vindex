// Generated from ../Vindex/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';
import * as pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 from '@daml.js/daml-stdlib-DA-Time-Types-1.0.0';

import * as Vindex_Token from '../Vindex/Token/module';

export declare type AcceptInvite = {
}

export declare const AcceptInvite:
  damlTypes.Serializable<AcceptInvite>

export declare type AgentVerdict = {
  rejectionValid: boolean,
}

export declare const AgentVerdict:
  damlTypes.Serializable<AgentVerdict>

export declare type Application = {
  members: damlTypes.Party[],
  applicant: damlTypes.Party,
  presentationHash: string,
  presentationUri: string,
  contactLink: string,
  postingCid: damlTypes.ContractId<ProjectPosting>,
  postingId: string,
}

export declare interface ApplicationInterface {
  Archive: 
    damlTypes.Choice<Application, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Application, undefined>>;
}
export declare const Application:
  damlTypes.Template<Application, undefined, '#vindex:Vindex:Application'> &
  damlTypes.ToInterface<Application, never> &
  ApplicationInterface

export declare type Apply = {
  applicant: damlTypes.Party,
  presentationHash: string,
  presentationUri: string,
  contactLink: string,
}

export declare const Apply:
  damlTypes.Serializable<Apply>

export declare type ApprovePlan = {
  actor: damlTypes.Party,
  commitmentHoldingCid: damlTypes.Optional<damlTypes.ContractId<Vindex_Token.TokenHolding>>,
}

export declare const ApprovePlan:
  damlTypes.Serializable<ApprovePlan>

export declare type AssetVault = {
  vaultType: VaultType,
  funders: damlTypes.Party[],
  stakeholders: damlTypes.Party[],
  amount: damlTypes.Numeric,
  holdingCid: damlTypes.Optional<damlTypes.ContractId<Vindex_Token.TokenHolding>>,
}

export declare interface AssetVaultInterface {
  Archive: 
    damlTypes.Choice<AssetVault, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  BackWithToken: 
    damlTypes.Choice<AssetVault, BackWithToken, damlTypes.ContractId<AssetVault>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  Release: 
    damlTypes.Choice<AssetVault, Release, damlTypes.ContractId<AssetVault>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  Settle: 
    damlTypes.Choice<AssetVault, Settle, damlTypes.Numeric, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
  Spend: 
    damlTypes.Choice<AssetVault, Spend, damlTypes.ContractId<AssetVault>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<AssetVault, undefined>>;
}
export declare const AssetVault:
  damlTypes.Template<AssetVault, undefined, '#vindex:Vindex:AssetVault'> &
  damlTypes.ToInterface<AssetVault, never> &
  AssetVaultInterface

export declare type BackWithToken = {
  holding: damlTypes.ContractId<Vindex_Token.TokenHolding>,
}

export declare const BackWithToken:
  damlTypes.Serializable<BackWithToken>

export declare type CancelMandate = {
}

export declare const CancelMandate:
  damlTypes.Serializable<CancelMandate>

export declare type CastProposalVote = {
  voter: damlTypes.Party,
  vote: Vote,
}

export declare const CastProposalVote:
  damlTypes.Serializable<CastProposalVote>

export declare type CastVote = {
  voter: damlTypes.Party,
  vote: Vote,
}

export declare const CastVote:
  damlTypes.Serializable<CastVote>

export declare type Contribution = {
  investor: damlTypes.Party,
  projectFunding: damlTypes.Numeric,
  weight: damlTypes.Numeric,
}

export declare const Contribution:
  damlTypes.Serializable<Contribution>

export declare type DeclineInvite = {
}

export declare const DeclineInvite:
  damlTypes.Serializable<DeclineInvite>

export declare type EditPostingDescription = {
  actor: damlTypes.Party,
  newRequirements: string,
}

export declare const EditPostingDescription:
  damlTypes.Serializable<EditPostingDescription>

export declare type FinalizeReview = {
  actor: damlTypes.Party,
  reviewCid: damlTypes.ContractId<MilestoneReview>,
  waiveLatePenalty: boolean,
}

export declare const FinalizeReview:
  damlTypes.Serializable<FinalizeReview>

export declare type GovernanceConfig = {
  maxInvestors: damlTypes.Int,
  votingModel: VotingModel,
  thresholdFraction: damlTypes.Numeric,
  weighted: boolean,
  quorumFraction: damlTypes.Numeric,
  defaultReviewWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime,
}

export declare const GovernanceConfig:
  damlTypes.Serializable<GovernanceConfig>

export declare type GovernanceProposal = {
  members: damlTypes.Party[],
  contributions: Contribution[],
  config: GovernanceConfig,
  agent: damlTypes.Party,
  purpose: string,
  action: ProposalAction,
  votes: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.Party, Vote>[],
  deadline: damlTypes.Time,
}

export declare interface GovernanceProposalInterface {
  Archive: 
    damlTypes.Choice<GovernanceProposal, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<GovernanceProposal, undefined>>;
  CastProposalVote: 
    damlTypes.Choice<GovernanceProposal, CastProposalVote, damlTypes.ContractId<GovernanceProposal>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<GovernanceProposal, undefined>>;
}
export declare const GovernanceProposal:
  damlTypes.Template<GovernanceProposal, undefined, '#vindex:Vindex:GovernanceProposal'> &
  damlTypes.ToInterface<GovernanceProposal, never> &
  GovernanceProposalInterface

export declare type InvestorInvite = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>,
  members: damlTypes.Party[],
  admin: damlTypes.Party,
  invitee: damlTypes.Party,
  proposedContribution: Contribution,
  agent: damlTypes.Party,
}

export declare interface InvestorInviteInterface {
  AcceptInvite: 
    damlTypes.Choice<InvestorInvite, AcceptInvite, damlTypes.ContractId<InvestorParty>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<InvestorInvite, undefined>>;
  Archive: 
    damlTypes.Choice<InvestorInvite, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<InvestorInvite, undefined>>;
  DeclineInvite: 
    damlTypes.Choice<InvestorInvite, DeclineInvite, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<InvestorInvite, undefined>>;
}
export declare const InvestorInvite:
  damlTypes.Template<InvestorInvite, undefined, '#vindex:Vindex:InvestorInvite'> &
  damlTypes.ToInterface<InvestorInvite, never> &
  InvestorInviteInterface

export declare type InvestorParty = {
  admin: damlTypes.Party,
  members: damlTypes.Party[],
  pending: damlTypes.Party[],
  contributions: Contribution[],
  config: GovernanceConfig,
  agent: damlTypes.Party,
}

export declare interface InvestorPartyInterface {
  Archive: 
    damlTypes.Choice<InvestorParty, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
  InviteInvestor: 
    damlTypes.Choice<InvestorParty, InviteInvestor, damlTypes.ContractId<InvestorInvite>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
  OpenProposal: 
    damlTypes.Choice<InvestorParty, OpenProposal, damlTypes.ContractId<GovernanceProposal>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
  SetupAndPost: 
    damlTypes.Choice<InvestorParty, SetupAndPost, pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.ContractId<ProjectPosting>, damlTypes.ContractId<AssetVault>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<InvestorParty, undefined>>;
}
export declare const InvestorParty:
  damlTypes.Template<InvestorParty, undefined, '#vindex:Vindex:InvestorParty'> &
  damlTypes.ToInterface<InvestorParty, never> &
  InvestorPartyInterface

export declare type InviteInvestor = {
  invitee: damlTypes.Party,
  proposedContribution: Contribution,
}

export declare const InviteInvestor:
  damlTypes.Serializable<InviteInvestor>

export declare type MStatus =
  | 'Inactive'
  | 'Active'
  | 'Submitted'
  | 'RejPending'
  | 'Revision'
  | 'Accepted'
  | 'Completed'
  | 'Failed'


export declare const MStatus:
  damlTypes.Serializable<MStatus> & { readonly keys: MStatus[] } & { readonly [e in MStatus]: e }

export declare type MarkFailed = {
  actor: damlTypes.Party,
}

export declare const MarkFailed:
  damlTypes.Serializable<MarkFailed>

export declare type MilestoneReview = {
  members: damlTypes.Party[],
  worker: damlTypes.Party,
  agent: damlTypes.Party,
  contributions: Contribution[],
  config: GovernanceConfig,
  milestoneIndex: damlTypes.Int,
  cycle: damlTypes.Int,
  votes: pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.Party, Vote>[],
  deadline: damlTypes.Time,
  rejectionReasons: damlTypes.Optional<string[]>,
}

export declare interface MilestoneReviewInterface {
  Archive: 
    damlTypes.Choice<MilestoneReview, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<MilestoneReview, undefined>>;
  CastVote: 
    damlTypes.Choice<MilestoneReview, CastVote, damlTypes.ContractId<MilestoneReview>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<MilestoneReview, undefined>>;
  SetRejectionReasons: 
    damlTypes.Choice<MilestoneReview, SetRejectionReasons, damlTypes.ContractId<MilestoneReview>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<MilestoneReview, undefined>>;
}
export declare const MilestoneReview:
  damlTypes.Template<MilestoneReview, undefined, '#vindex:Vindex:MilestoneReview'> &
  damlTypes.ToInterface<MilestoneReview, never> &
  MilestoneReviewInterface

export declare type MilestoneSpec = {
  deliverablesHash: string,
  payment: damlTypes.Numeric,
  workerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime,
  reviewWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime,
  violationPct: damlTypes.Numeric,
  isFinal: boolean,
}

export declare const MilestoneSpec:
  damlTypes.Serializable<MilestoneSpec>

export declare type OpenProposal = {
  purpose: string,
  action: ProposalAction,
  deadline: damlTypes.Time,
}

export declare const OpenProposal:
  damlTypes.Serializable<OpenProposal>

export declare type PlanningMandate = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>,
  members: damlTypes.Party[],
  contributions: Contribution[],
  config: GovernanceConfig,
  worker: damlTypes.Party,
  agent: damlTypes.Party,
  requirements: string,
  briefUri: string,
  budgetVault: damlTypes.ContractId<AssetVault>,
  commitmentRequired: damlTypes.Numeric,
  maxRevisions: damlTypes.Int,
  latePenaltyPct: damlTypes.Numeric,
  maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime,
}

export declare interface PlanningMandateInterface {
  Archive: 
    damlTypes.Choice<PlanningMandate, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<PlanningMandate, undefined>>;
  CancelMandate: 
    damlTypes.Choice<PlanningMandate, CancelMandate, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<PlanningMandate, undefined>>;
  ProposePlan: 
    damlTypes.Choice<PlanningMandate, ProposePlan, damlTypes.ContractId<WorkPlan>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<PlanningMandate, undefined>>;
}
export declare const PlanningMandate:
  damlTypes.Template<PlanningMandate, undefined, '#vindex:Vindex:PlanningMandate'> &
  damlTypes.ToInterface<PlanningMandate, never> &
  PlanningMandateInterface

export declare type Project = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>,
  members: damlTypes.Party[],
  contributions: Contribution[],
  config: GovernanceConfig,
  worker: damlTypes.Party,
  agent: damlTypes.Party,
  milestones: MilestoneSpec[],
  requirements: string,
  briefUri: string,
  currentIndex: damlTypes.Int,
  status: MStatus,
  submissionCount: damlTypes.Int,
  maxSubmissions: damlTypes.Int,
  workerDeadline: damlTypes.Time,
  agentVerdictDeadline: damlTypes.Optional<damlTypes.Time>,
  latePenaltyPct: damlTypes.Numeric,
  submittedLate: boolean,
  budgetVault: damlTypes.ContractId<AssetVault>,
  commitmentVault: damlTypes.ContractId<AssetVault>,
  paidOut: damlTypes.Numeric,
  currentSubmissionHash: damlTypes.Optional<string>,
  currentSubmissionUri: damlTypes.Optional<string>,
  rejectionReasons: damlTypes.Optional<string[]>,
}

export declare interface ProjectInterface {
  AgentVerdict: 
    damlTypes.Choice<Project, AgentVerdict, damlTypes.Optional<damlTypes.ContractId<Project>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  Archive: 
    damlTypes.Choice<Project, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  FinalizeReview: 
    damlTypes.Choice<Project, FinalizeReview, damlTypes.Optional<damlTypes.ContractId<Project>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  MarkFailed: 
    damlTypes.Choice<Project, MarkFailed, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  ResolveAfterViolation: 
    damlTypes.Choice<Project, ResolveAfterViolation, damlTypes.Optional<damlTypes.ContractId<Project>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  ResolveStalePending: 
    damlTypes.Choice<Project, ResolveStalePending, damlTypes.Optional<damlTypes.ContractId<Project>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  SubmitMilestone: 
    damlTypes.Choice<Project, SubmitMilestone, damlTypes.ContractId<Project>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
  WorkerViolation: 
    damlTypes.Choice<Project, WorkerViolation, damlTypes.ContractId<Project>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Project, undefined>>;
}
export declare const Project:
  damlTypes.Template<Project, undefined, '#vindex:Vindex:Project'> &
  damlTypes.ToInterface<Project, never> &
  ProjectInterface

export declare type ProjectPosting = {
  postingId: string,
  investorPartyCid: damlTypes.ContractId<InvestorParty>,
  members: damlTypes.Party[],
  contributions: Contribution[],
  config: GovernanceConfig,
  agent: damlTypes.Party,
  requirements: string,
  briefUri: string,
  budgetVault: damlTypes.ContractId<AssetVault>,
  commitmentRequired: damlTypes.Numeric,
  maxRevisions: damlTypes.Int,
  latePenaltyPct: damlTypes.Numeric,
  maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime,
  recruitmentMode: string,
  eligibleWorkers: string[],
  publicParty: damlTypes.Party,
}

export declare interface ProjectPostingInterface {
  Apply: 
    damlTypes.Choice<ProjectPosting, Apply, damlTypes.ContractId<Application>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
  Archive: 
    damlTypes.Choice<ProjectPosting, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
  EditPostingDescription: 
    damlTypes.Choice<ProjectPosting, EditPostingDescription, damlTypes.ContractId<ProjectPosting>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
  SelectWorker: 
    damlTypes.Choice<ProjectPosting, SelectWorker, damlTypes.ContractId<PlanningMandate>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
  TakeDownPosting: 
    damlTypes.Choice<ProjectPosting, TakeDownPosting, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<ProjectPosting, undefined>>;
}
export declare const ProjectPosting:
  damlTypes.Template<ProjectPosting, undefined, '#vindex:Vindex:ProjectPosting'> &
  damlTypes.ToInterface<ProjectPosting, never> &
  ProjectPostingInterface

export declare type ProposalAction =
  | { tag: 'SelectWinner'; value: damlTypes.Party }
  | { tag: 'ResolveContinue'; value: {} }
  | { tag: 'ResolveStop'; value: {} }


export declare const ProposalAction:
  damlTypes.Serializable<ProposalAction>

export declare type ProposePlan = {
  milestones: MilestoneSpec[],
  maxSubmissions: damlTypes.Int,
}

export declare const ProposePlan:
  damlTypes.Serializable<ProposePlan>

export declare type ProposePlanAgain = {
  newMilestones: MilestoneSpec[],
  newMaxSubmissions: damlTypes.Int,
}

export declare const ProposePlanAgain:
  damlTypes.Serializable<ProposePlanAgain>

export declare type RejectPlan = {
  actor: damlTypes.Party,
}

export declare const RejectPlan:
  damlTypes.Serializable<RejectPlan>

export declare type Release = {
  amt: damlTypes.Numeric,
  beneficiary: damlTypes.Party,
}

export declare const Release:
  damlTypes.Serializable<Release>

export declare type ResolveAfterViolation = {
  actor: damlTypes.Party,
  proposalCid: damlTypes.ContractId<GovernanceProposal>,
}

export declare const ResolveAfterViolation:
  damlTypes.Serializable<ResolveAfterViolation>

export declare type ResolveStalePending = {
  actor: damlTypes.Party,
}

export declare const ResolveStalePending:
  damlTypes.Serializable<ResolveStalePending>

export declare type SelectWorker = {
  actor: damlTypes.Party,
  proposalCid: damlTypes.ContractId<GovernanceProposal>,
  applicationCid: damlTypes.ContractId<Application>,
}

export declare const SelectWorker:
  damlTypes.Serializable<SelectWorker>

export declare type SetRejectionReasons = {
  actor: damlTypes.Party,
  reasons: string[],
}

export declare const SetRejectionReasons:
  damlTypes.Serializable<SetRejectionReasons>

export declare type Settle = {
}

export declare const Settle:
  damlTypes.Serializable<Settle>

export declare type Settlement = {
  members: damlTypes.Party[],
  worker: damlTypes.Party,
  agent: damlTypes.Party,
  reason: string,
  refundedBudget: damlTypes.Numeric,
  refundedCommitment: damlTypes.Numeric,
  totalPaidOut: damlTypes.Numeric,
}

export declare interface SettlementInterface {
  Archive: 
    damlTypes.Choice<Settlement, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<Settlement, undefined>>;
}
export declare const Settlement:
  damlTypes.Template<Settlement, undefined, '#vindex:Vindex:Settlement'> &
  damlTypes.ToInterface<Settlement, never> &
  SettlementInterface

export declare type SetupAndPost = {
  postingId: string,
  requirements: string,
  briefUri: string,
  budgetAmount: damlTypes.Numeric,
  commitmentRequired: damlTypes.Numeric,
  maxRevisions: damlTypes.Int,
  latePenaltyPct: damlTypes.Numeric,
  maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime,
  recruitmentMode: string,
  eligibleWorkers: string[],
  publicParty: damlTypes.Party,
  holdingCidOpt: damlTypes.Optional<damlTypes.ContractId<Vindex_Token.TokenHolding>>,
}

export declare const SetupAndPost:
  damlTypes.Serializable<SetupAndPost>

export declare type Spend = {
  amt: damlTypes.Numeric,
}

export declare const Spend:
  damlTypes.Serializable<Spend>

export declare type SubmitMilestone = {
  deliverableHash: string,
  deliverableUri: string,
}

export declare const SubmitMilestone:
  damlTypes.Serializable<SubmitMilestone>

export declare type TakeDownPosting = {
  actor: damlTypes.Party,
}

export declare const TakeDownPosting:
  damlTypes.Serializable<TakeDownPosting>

export declare type Tally = {
  acceptPower: damlTypes.Numeric,
  rejectPower: damlTypes.Numeric,
  castPower: damlTypes.Numeric,
  total: damlTypes.Numeric,
}

export declare const Tally:
  damlTypes.Serializable<Tally>

export declare type VaultType =
  | 'BudgetV'
  | 'CommitmentV'


export declare const VaultType:
  damlTypes.Serializable<VaultType> & { readonly keys: VaultType[] } & { readonly [e in VaultType]: e }

export declare type Vote =
  | 'ACCEPT'
  | 'REJECT'


export declare const Vote:
  damlTypes.Serializable<Vote> & { readonly keys: Vote[] } & { readonly [e in Vote]: e }

export declare type VotingModel =
  | 'SimpleMajority'
  | 'SuperMajority'
  | 'Weighted'


export declare const VotingModel:
  damlTypes.Serializable<VotingModel> & { readonly keys: VotingModel[] } & { readonly [e in VotingModel]: e }

export declare type WithdrawPlan = {
}

export declare const WithdrawPlan:
  damlTypes.Serializable<WithdrawPlan>

export declare type WorkPlan = {
  investorPartyCid: damlTypes.ContractId<InvestorParty>,
  members: damlTypes.Party[],
  contributions: Contribution[],
  config: GovernanceConfig,
  worker: damlTypes.Party,
  agent: damlTypes.Party,
  requirements: string,
  briefUri: string,
  milestones: MilestoneSpec[],
  maxSubmissions: damlTypes.Int,
  budgetVault: damlTypes.ContractId<AssetVault>,
  commitmentRequired: damlTypes.Numeric,
  maxRevisions: damlTypes.Int,
  latePenaltyPct: damlTypes.Numeric,
  maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime,
}

export declare interface WorkPlanInterface {
  ApprovePlan: 
    damlTypes.Choice<WorkPlan, ApprovePlan, damlTypes.ContractId<Project>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<WorkPlan, undefined>>;
  Archive: 
    damlTypes.Choice<WorkPlan, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<WorkPlan, undefined>>;
  ProposePlanAgain: 
    damlTypes.Choice<WorkPlan, ProposePlanAgain, damlTypes.ContractId<WorkPlan>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<WorkPlan, undefined>>;
  RejectPlan: 
    damlTypes.Choice<WorkPlan, RejectPlan, damlTypes.ContractId<PlanningMandate>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<WorkPlan, undefined>>;
  WithdrawPlan: 
    damlTypes.Choice<WorkPlan, WithdrawPlan, damlTypes.ContractId<PlanningMandate>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<WorkPlan, undefined>>;
}
export declare const WorkPlan:
  damlTypes.Template<WorkPlan, undefined, '#vindex:Vindex:WorkPlan'> &
  damlTypes.ToInterface<WorkPlan, never> &
  WorkPlanInterface

export declare type WorkerViolation = {
  actor: damlTypes.Party,
}

export declare const WorkerViolation:
  damlTypes.Serializable<WorkerViolation>
