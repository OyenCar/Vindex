"use strict";
/* eslint-disable-next-line no-unused-vars */
function __export(m) {
/* eslint-disable-next-line no-prototype-builtins */
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable-next-line no-unused-vars */
var jtv = require('@mojotech/json-type-validation');
/* eslint-disable-next-line no-unused-vars */
var damlTypes = require('@daml/types');
/* eslint-disable-next-line no-unused-vars */
var damlLedger = require('@daml/ledger');

var pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7 = require('@daml.js/40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7');
var pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a = require('@daml.js/733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a');
var pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662 = require('@daml.js/d14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662');


exports.TopUpAgentFee = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, proposalCid: damlTypes.ContractId(exports.GovernanceProposal).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    proposalCid: damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__.proposalCid),
  };
}
,
};



exports.ResolveAfterViolation = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, proposalCid: damlTypes.ContractId(exports.GovernanceProposal).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    proposalCid: damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__.proposalCid),
  };
}
,
};



exports.WorkerViolation = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.AgentVerdict = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({rejectionValid: damlTypes.Bool.decoder, }); }),
  encode: function (__typed__) {
  return {
    rejectionValid: damlTypes.Bool.encode(__typed__.rejectionValid),
  };
}
,
};



exports.FinalizeReview = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, reviewCid: damlTypes.ContractId(exports.MilestoneReview).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    reviewCid: damlTypes.ContractId(exports.MilestoneReview).encode(__typed__.reviewCid),
  };
}
,
};



exports.SubmitMilestone = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({deliverableHash: damlTypes.Text.decoder, deliverableUri: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    deliverableHash: damlTypes.Text.encode(__typed__.deliverableHash),
    deliverableUri: damlTypes.Text.encode(__typed__.deliverableUri),
  };
}
,
};



exports.Project = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:Project',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder, members: damlTypes.List(damlTypes.Party).decoder, contributions: damlTypes.List(exports.Contribution).decoder, config: exports.GovernanceConfig.decoder, worker: damlTypes.Party.decoder, agent: damlTypes.Party.decoder, milestones: damlTypes.List(exports.MilestoneSpec).decoder, requirements: damlTypes.Text.decoder, briefUri: damlTypes.Text.decoder, currentIndex: damlTypes.Int.decoder, status: exports.MStatus.decoder, submissionCount: damlTypes.Int.decoder, maxSubmissions: damlTypes.Int.decoder, workerDeadline: damlTypes.Time.decoder, agentOpCost: damlTypes.Numeric(10).decoder, budgetVault: damlTypes.ContractId(exports.AssetVault).decoder, commitmentVault: damlTypes.ContractId(exports.AssetVault).decoder, agentFeeVault: damlTypes.ContractId(exports.AssetVault).decoder, paidOut: damlTypes.Numeric(10).decoder, currentSubmissionHash: damlTypes.Optional(damlTypes.Text).decoder, currentSubmissionUri: damlTypes.Optional(damlTypes.Text).decoder, rejectionReasons: damlTypes.Optional(damlTypes.List(damlTypes.Text)).decoder, }); }),
  encode: function (__typed__) {
  return {
    investorPartyCid: damlTypes.ContractId(exports.InvestorParty).encode(__typed__.investorPartyCid),
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
    config: exports.GovernanceConfig.encode(__typed__.config),
    worker: damlTypes.Party.encode(__typed__.worker),
    agent: damlTypes.Party.encode(__typed__.agent),
    milestones: damlTypes.List(exports.MilestoneSpec).encode(__typed__.milestones),
    requirements: damlTypes.Text.encode(__typed__.requirements),
    briefUri: damlTypes.Text.encode(__typed__.briefUri),
    currentIndex: damlTypes.Int.encode(__typed__.currentIndex),
    status: exports.MStatus.encode(__typed__.status),
    submissionCount: damlTypes.Int.encode(__typed__.submissionCount),
    maxSubmissions: damlTypes.Int.encode(__typed__.maxSubmissions),
    workerDeadline: damlTypes.Time.encode(__typed__.workerDeadline),
    agentOpCost: damlTypes.Numeric(10).encode(__typed__.agentOpCost),
    budgetVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.budgetVault),
    commitmentVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.commitmentVault),
    agentFeeVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.agentFeeVault),
    paidOut: damlTypes.Numeric(10).encode(__typed__.paidOut),
    currentSubmissionHash: damlTypes.Optional(damlTypes.Text).encode(__typed__.currentSubmissionHash),
    currentSubmissionUri: damlTypes.Optional(damlTypes.Text).encode(__typed__.currentSubmissionUri),
    rejectionReasons: damlTypes.Optional(damlTypes.List(damlTypes.Text)).encode(__typed__.rejectionReasons),
  };
}
,
  AgentVerdict: {
    template: function () { return exports.Project; },
    choiceName: 'AgentVerdict',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AgentVerdict.decoder; }),
    argumentEncode: function (__typed__) { return exports.AgentVerdict.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).encode(__typed__); },
  },
  FinalizeReview: {
    template: function () { return exports.Project; },
    choiceName: 'FinalizeReview',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.FinalizeReview.decoder; }),
    argumentEncode: function (__typed__) { return exports.FinalizeReview.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).encode(__typed__); },
  },
  ResolveAfterViolation: {
    template: function () { return exports.Project; },
    choiceName: 'ResolveAfterViolation',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ResolveAfterViolation.decoder; }),
    argumentEncode: function (__typed__) { return exports.ResolveAfterViolation.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).encode(__typed__); },
  },
  WorkerViolation: {
    template: function () { return exports.Project; },
    choiceName: 'WorkerViolation',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.WorkerViolation.decoder; }),
    argumentEncode: function (__typed__) { return exports.WorkerViolation.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Project).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Project).encode(__typed__); },
  },
  SubmitMilestone: {
    template: function () { return exports.Project; },
    choiceName: 'SubmitMilestone',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.SubmitMilestone.decoder; }),
    argumentEncode: function (__typed__) { return exports.SubmitMilestone.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Project).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Project).encode(__typed__); },
  },
  TopUpAgentFee: {
    template: function () { return exports.Project; },
    choiceName: 'TopUpAgentFee',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TopUpAgentFee.decoder; }),
    argumentEncode: function (__typed__) { return exports.TopUpAgentFee.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Project).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Project).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.Project; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.Project, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.Settlement = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:Settlement',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({members: damlTypes.List(damlTypes.Party).decoder, worker: damlTypes.Party.decoder, agent: damlTypes.Party.decoder, reason: damlTypes.Text.decoder, refundedBudget: damlTypes.Numeric(10).decoder, refundedCommitment: damlTypes.Numeric(10).decoder, refundedAgentFee: damlTypes.Numeric(10).decoder, totalPaidOut: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    worker: damlTypes.Party.encode(__typed__.worker),
    agent: damlTypes.Party.encode(__typed__.agent),
    reason: damlTypes.Text.encode(__typed__.reason),
    refundedBudget: damlTypes.Numeric(10).encode(__typed__.refundedBudget),
    refundedCommitment: damlTypes.Numeric(10).encode(__typed__.refundedCommitment),
    refundedAgentFee: damlTypes.Numeric(10).encode(__typed__.refundedAgentFee),
    totalPaidOut: damlTypes.Numeric(10).encode(__typed__.totalPaidOut),
  };
}
,
  Archive: {
    template: function () { return exports.Settlement; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.Settlement, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.ProposePlanAgain = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newMilestones: damlTypes.List(exports.MilestoneSpec).decoder, newMaxSubmissions: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    newMilestones: damlTypes.List(exports.MilestoneSpec).encode(__typed__.newMilestones),
    newMaxSubmissions: damlTypes.Int.encode(__typed__.newMaxSubmissions),
  };
}
,
};



exports.WithdrawPlan = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.RejectPlan = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.ApprovePlan = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.WorkPlan = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:WorkPlan',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder, members: damlTypes.List(damlTypes.Party).decoder, contributions: damlTypes.List(exports.Contribution).decoder, config: exports.GovernanceConfig.decoder, worker: damlTypes.Party.decoder, agent: damlTypes.Party.decoder, requirements: damlTypes.Text.decoder, briefUri: damlTypes.Text.decoder, milestones: damlTypes.List(exports.MilestoneSpec).decoder, maxSubmissions: damlTypes.Int.decoder, budgetVault: damlTypes.ContractId(exports.AssetVault).decoder, agentFeeVault: damlTypes.ContractId(exports.AssetVault).decoder, agentOpCost: damlTypes.Numeric(10).decoder, commitmentRequired: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    investorPartyCid: damlTypes.ContractId(exports.InvestorParty).encode(__typed__.investorPartyCid),
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
    config: exports.GovernanceConfig.encode(__typed__.config),
    worker: damlTypes.Party.encode(__typed__.worker),
    agent: damlTypes.Party.encode(__typed__.agent),
    requirements: damlTypes.Text.encode(__typed__.requirements),
    briefUri: damlTypes.Text.encode(__typed__.briefUri),
    milestones: damlTypes.List(exports.MilestoneSpec).encode(__typed__.milestones),
    maxSubmissions: damlTypes.Int.encode(__typed__.maxSubmissions),
    budgetVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.budgetVault),
    agentFeeVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.agentFeeVault),
    agentOpCost: damlTypes.Numeric(10).encode(__typed__.agentOpCost),
    commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
  };
}
,
  ApprovePlan: {
    template: function () { return exports.WorkPlan; },
    choiceName: 'ApprovePlan',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ApprovePlan.decoder; }),
    argumentEncode: function (__typed__) { return exports.ApprovePlan.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Project).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Project).encode(__typed__); },
  },
  RejectPlan: {
    template: function () { return exports.WorkPlan; },
    choiceName: 'RejectPlan',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.RejectPlan.decoder; }),
    argumentEncode: function (__typed__) { return exports.RejectPlan.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.PlanningMandate).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.PlanningMandate).encode(__typed__); },
  },
  ProposePlanAgain: {
    template: function () { return exports.WorkPlan; },
    choiceName: 'ProposePlanAgain',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProposePlanAgain.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProposePlanAgain.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.WorkPlan).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.WorkPlan).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.WorkPlan; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  WithdrawPlan: {
    template: function () { return exports.WorkPlan; },
    choiceName: 'WithdrawPlan',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.WithdrawPlan.decoder; }),
    argumentEncode: function (__typed__) { return exports.WithdrawPlan.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.PlanningMandate).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.PlanningMandate).encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.WorkPlan, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.CancelMandate = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.ProposePlan = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({milestones: damlTypes.List(exports.MilestoneSpec).decoder, maxSubmissions: damlTypes.Int.decoder, }); }),
  encode: function (__typed__) {
  return {
    milestones: damlTypes.List(exports.MilestoneSpec).encode(__typed__.milestones),
    maxSubmissions: damlTypes.Int.encode(__typed__.maxSubmissions),
  };
}
,
};



exports.PlanningMandate = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:PlanningMandate',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder, members: damlTypes.List(damlTypes.Party).decoder, contributions: damlTypes.List(exports.Contribution).decoder, config: exports.GovernanceConfig.decoder, worker: damlTypes.Party.decoder, agent: damlTypes.Party.decoder, requirements: damlTypes.Text.decoder, briefUri: damlTypes.Text.decoder, budgetVault: damlTypes.ContractId(exports.AssetVault).decoder, agentFeeVault: damlTypes.ContractId(exports.AssetVault).decoder, agentOpCost: damlTypes.Numeric(10).decoder, commitmentRequired: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    investorPartyCid: damlTypes.ContractId(exports.InvestorParty).encode(__typed__.investorPartyCid),
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
    config: exports.GovernanceConfig.encode(__typed__.config),
    worker: damlTypes.Party.encode(__typed__.worker),
    agent: damlTypes.Party.encode(__typed__.agent),
    requirements: damlTypes.Text.encode(__typed__.requirements),
    briefUri: damlTypes.Text.encode(__typed__.briefUri),
    budgetVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.budgetVault),
    agentFeeVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.agentFeeVault),
    agentOpCost: damlTypes.Numeric(10).encode(__typed__.agentOpCost),
    commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
  };
}
,
  ProposePlan: {
    template: function () { return exports.PlanningMandate; },
    choiceName: 'ProposePlan',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProposePlan.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProposePlan.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.WorkPlan).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.WorkPlan).encode(__typed__); },
  },
  CancelMandate: {
    template: function () { return exports.PlanningMandate; },
    choiceName: 'CancelMandate',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CancelMandate.decoder; }),
    argumentEncode: function (__typed__) { return exports.CancelMandate.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.PlanningMandate; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.PlanningMandate, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.SetRejectionReasons = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, reasons: damlTypes.List(damlTypes.Text).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    reasons: damlTypes.List(damlTypes.Text).encode(__typed__.reasons),
  };
}
,
};



exports.CastVote = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({voter: damlTypes.Party.decoder, vote: exports.Vote.decoder, }); }),
  encode: function (__typed__) {
  return {
    voter: damlTypes.Party.encode(__typed__.voter),
    vote: exports.Vote.encode(__typed__.vote),
  };
}
,
};



exports.MilestoneReview = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:MilestoneReview',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({members: damlTypes.List(damlTypes.Party).decoder, worker: damlTypes.Party.decoder, agent: damlTypes.Party.decoder, contributions: damlTypes.List(exports.Contribution).decoder, config: exports.GovernanceConfig.decoder, milestoneIndex: damlTypes.Int.decoder, cycle: damlTypes.Int.decoder, votes: damlTypes.List(pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).decoder, deadline: damlTypes.Time.decoder, rejectionReasons: damlTypes.Optional(damlTypes.List(damlTypes.Text)).decoder, }); }),
  encode: function (__typed__) {
  return {
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    worker: damlTypes.Party.encode(__typed__.worker),
    agent: damlTypes.Party.encode(__typed__.agent),
    contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
    config: exports.GovernanceConfig.encode(__typed__.config),
    milestoneIndex: damlTypes.Int.encode(__typed__.milestoneIndex),
    cycle: damlTypes.Int.encode(__typed__.cycle),
    votes: damlTypes.List(pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).encode(__typed__.votes),
    deadline: damlTypes.Time.encode(__typed__.deadline),
    rejectionReasons: damlTypes.Optional(damlTypes.List(damlTypes.Text)).encode(__typed__.rejectionReasons),
  };
}
,
  CastVote: {
    template: function () { return exports.MilestoneReview; },
    choiceName: 'CastVote',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CastVote.decoder; }),
    argumentEncode: function (__typed__) { return exports.CastVote.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.MilestoneReview).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.MilestoneReview).encode(__typed__); },
  },
  SetRejectionReasons: {
    template: function () { return exports.MilestoneReview; },
    choiceName: 'SetRejectionReasons',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.SetRejectionReasons.decoder; }),
    argumentEncode: function (__typed__) { return exports.SetRejectionReasons.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.MilestoneReview).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.MilestoneReview).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.MilestoneReview; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.MilestoneReview, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.CastProposalVote = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({voter: damlTypes.Party.decoder, vote: exports.Vote.decoder, }); }),
  encode: function (__typed__) {
  return {
    voter: damlTypes.Party.encode(__typed__.voter),
    vote: exports.Vote.encode(__typed__.vote),
  };
}
,
};



exports.GovernanceProposal = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:GovernanceProposal',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({members: damlTypes.List(damlTypes.Party).decoder, contributions: damlTypes.List(exports.Contribution).decoder, config: exports.GovernanceConfig.decoder, agent: damlTypes.Party.decoder, purpose: damlTypes.Text.decoder, action: exports.ProposalAction.decoder, votes: damlTypes.List(pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).decoder, deadline: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
    config: exports.GovernanceConfig.encode(__typed__.config),
    agent: damlTypes.Party.encode(__typed__.agent),
    purpose: damlTypes.Text.encode(__typed__.purpose),
    action: exports.ProposalAction.encode(__typed__.action),
    votes: damlTypes.List(pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).encode(__typed__.votes),
    deadline: damlTypes.Time.encode(__typed__.deadline),
  };
}
,
  CastProposalVote: {
    template: function () { return exports.GovernanceProposal; },
    choiceName: 'CastProposalVote',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.CastProposalVote.decoder; }),
    argumentEncode: function (__typed__) { return exports.CastProposalVote.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.GovernanceProposal).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.GovernanceProposal; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.GovernanceProposal, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.TakeDownPosting = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
  };
}
,
};



exports.EditPostingDescription = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, newRequirements: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    newRequirements: damlTypes.Text.encode(__typed__.newRequirements),
  };
}
,
};



exports.SelectWorker = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({actor: damlTypes.Party.decoder, proposalCid: damlTypes.ContractId(exports.GovernanceProposal).decoder, applicationCid: damlTypes.ContractId(exports.Application).decoder, }); }),
  encode: function (__typed__) {
  return {
    actor: damlTypes.Party.encode(__typed__.actor),
    proposalCid: damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__.proposalCid),
    applicationCid: damlTypes.ContractId(exports.Application).encode(__typed__.applicationCid),
  };
}
,
};



exports.Apply = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({applicant: damlTypes.Party.decoder, presentationHash: damlTypes.Text.decoder, presentationUri: damlTypes.Text.decoder, contactLink: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    applicant: damlTypes.Party.encode(__typed__.applicant),
    presentationHash: damlTypes.Text.encode(__typed__.presentationHash),
    presentationUri: damlTypes.Text.encode(__typed__.presentationUri),
    contactLink: damlTypes.Text.encode(__typed__.contactLink),
  };
}
,
};



exports.ProjectPosting = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:ProjectPosting',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({postingId: damlTypes.Text.decoder, investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder, members: damlTypes.List(damlTypes.Party).decoder, contributions: damlTypes.List(exports.Contribution).decoder, config: exports.GovernanceConfig.decoder, agent: damlTypes.Party.decoder, requirements: damlTypes.Text.decoder, briefUri: damlTypes.Text.decoder, budgetVault: damlTypes.ContractId(exports.AssetVault).decoder, agentFeeVault: damlTypes.ContractId(exports.AssetVault).decoder, agentOpCost: damlTypes.Numeric(10).decoder, commitmentRequired: damlTypes.Numeric(10).decoder, recruitmentMode: damlTypes.Text.decoder, eligibleWorkers: damlTypes.List(damlTypes.Text).decoder, publicParty: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    postingId: damlTypes.Text.encode(__typed__.postingId),
    investorPartyCid: damlTypes.ContractId(exports.InvestorParty).encode(__typed__.investorPartyCid),
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
    config: exports.GovernanceConfig.encode(__typed__.config),
    agent: damlTypes.Party.encode(__typed__.agent),
    requirements: damlTypes.Text.encode(__typed__.requirements),
    briefUri: damlTypes.Text.encode(__typed__.briefUri),
    budgetVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.budgetVault),
    agentFeeVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.agentFeeVault),
    agentOpCost: damlTypes.Numeric(10).encode(__typed__.agentOpCost),
    commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
    recruitmentMode: damlTypes.Text.encode(__typed__.recruitmentMode),
    eligibleWorkers: damlTypes.List(damlTypes.Text).encode(__typed__.eligibleWorkers),
    publicParty: damlTypes.Party.encode(__typed__.publicParty),
  };
}
,
  SelectWorker: {
    template: function () { return exports.ProjectPosting; },
    choiceName: 'SelectWorker',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.SelectWorker.decoder; }),
    argumentEncode: function (__typed__) { return exports.SelectWorker.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.PlanningMandate).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.PlanningMandate).encode(__typed__); },
  },
  Apply: {
    template: function () { return exports.ProjectPosting; },
    choiceName: 'Apply',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Apply.decoder; }),
    argumentEncode: function (__typed__) { return exports.Apply.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Application).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Application).encode(__typed__); },
  },
  EditPostingDescription: {
    template: function () { return exports.ProjectPosting; },
    choiceName: 'EditPostingDescription',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.EditPostingDescription.decoder; }),
    argumentEncode: function (__typed__) { return exports.EditPostingDescription.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.ProjectPosting).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.ProjectPosting).encode(__typed__); },
  },
  TakeDownPosting: {
    template: function () { return exports.ProjectPosting; },
    choiceName: 'TakeDownPosting',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.TakeDownPosting.decoder; }),
    argumentEncode: function (__typed__) { return exports.TakeDownPosting.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.ProjectPosting; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.ProjectPosting, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.Application = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:Application',
  keyDecoder: damlTypes.lazyMemo(function () { return damlTypes.lazyMemo(function () { return pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2(damlTypes.Party, damlTypes.Text).decoder; }); }),
  keyEncode: function (__typed__) { return pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple2(damlTypes.Party, damlTypes.Text).encode(__typed__); },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({members: damlTypes.List(damlTypes.Party).decoder, applicant: damlTypes.Party.decoder, presentationHash: damlTypes.Text.decoder, presentationUri: damlTypes.Text.decoder, contactLink: damlTypes.Text.decoder, postingCid: damlTypes.ContractId(exports.ProjectPosting).decoder, postingId: damlTypes.Text.decoder, }); }),
  encode: function (__typed__) {
  return {
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    applicant: damlTypes.Party.encode(__typed__.applicant),
    presentationHash: damlTypes.Text.encode(__typed__.presentationHash),
    presentationUri: damlTypes.Text.encode(__typed__.presentationUri),
    contactLink: damlTypes.Text.encode(__typed__.contactLink),
    postingCid: damlTypes.ContractId(exports.ProjectPosting).encode(__typed__.postingCid),
    postingId: damlTypes.Text.encode(__typed__.postingId),
  };
}
,
  Archive: {
    template: function () { return exports.Application; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.Application, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.DeclineInvite = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.AcceptInvite = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.InvestorInvite = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:InvestorInvite',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder, members: damlTypes.List(damlTypes.Party).decoder, admin: damlTypes.Party.decoder, invitee: damlTypes.Party.decoder, proposedContribution: exports.Contribution.decoder, agent: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    investorPartyCid: damlTypes.ContractId(exports.InvestorParty).encode(__typed__.investorPartyCid),
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    admin: damlTypes.Party.encode(__typed__.admin),
    invitee: damlTypes.Party.encode(__typed__.invitee),
    proposedContribution: exports.Contribution.encode(__typed__.proposedContribution),
    agent: damlTypes.Party.encode(__typed__.agent),
  };
}
,
  AcceptInvite: {
    template: function () { return exports.InvestorInvite; },
    choiceName: 'AcceptInvite',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.AcceptInvite.decoder; }),
    argumentEncode: function (__typed__) { return exports.AcceptInvite.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.InvestorParty).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.InvestorParty).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.InvestorInvite; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  DeclineInvite: {
    template: function () { return exports.InvestorInvite; },
    choiceName: 'DeclineInvite',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.DeclineInvite.decoder; }),
    argumentEncode: function (__typed__) { return exports.DeclineInvite.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.InvestorInvite, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.SetupAndPost = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({postingId: damlTypes.Text.decoder, requirements: damlTypes.Text.decoder, briefUri: damlTypes.Text.decoder, budgetAmount: damlTypes.Numeric(10).decoder, agentFeeAmount: damlTypes.Numeric(10).decoder, agentOpCost: damlTypes.Numeric(10).decoder, commitmentRequired: damlTypes.Numeric(10).decoder, recruitmentMode: damlTypes.Text.decoder, eligibleWorkers: damlTypes.List(damlTypes.Text).decoder, publicParty: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    postingId: damlTypes.Text.encode(__typed__.postingId),
    requirements: damlTypes.Text.encode(__typed__.requirements),
    briefUri: damlTypes.Text.encode(__typed__.briefUri),
    budgetAmount: damlTypes.Numeric(10).encode(__typed__.budgetAmount),
    agentFeeAmount: damlTypes.Numeric(10).encode(__typed__.agentFeeAmount),
    agentOpCost: damlTypes.Numeric(10).encode(__typed__.agentOpCost),
    commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
    recruitmentMode: damlTypes.Text.encode(__typed__.recruitmentMode),
    eligibleWorkers: damlTypes.List(damlTypes.Text).encode(__typed__.eligibleWorkers),
    publicParty: damlTypes.Party.encode(__typed__.publicParty),
  };
}
,
};



exports.OpenProposal = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({purpose: damlTypes.Text.decoder, action: exports.ProposalAction.decoder, deadline: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    purpose: damlTypes.Text.encode(__typed__.purpose),
    action: exports.ProposalAction.encode(__typed__.action),
    deadline: damlTypes.Time.encode(__typed__.deadline),
  };
}
,
};



exports.InviteInvestor = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({invitee: damlTypes.Party.decoder, proposedContribution: exports.Contribution.decoder, }); }),
  encode: function (__typed__) {
  return {
    invitee: damlTypes.Party.encode(__typed__.invitee),
    proposedContribution: exports.Contribution.encode(__typed__.proposedContribution),
  };
}
,
};



exports.InvestorParty = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:InvestorParty',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({admin: damlTypes.Party.decoder, members: damlTypes.List(damlTypes.Party).decoder, pending: damlTypes.List(damlTypes.Party).decoder, contributions: damlTypes.List(exports.Contribution).decoder, config: exports.GovernanceConfig.decoder, agent: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    admin: damlTypes.Party.encode(__typed__.admin),
    members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
    pending: damlTypes.List(damlTypes.Party).encode(__typed__.pending),
    contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
    config: exports.GovernanceConfig.encode(__typed__.config),
    agent: damlTypes.Party.encode(__typed__.agent),
  };
}
,
  InviteInvestor: {
    template: function () { return exports.InvestorParty; },
    choiceName: 'InviteInvestor',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.InviteInvestor.decoder; }),
    argumentEncode: function (__typed__) { return exports.InviteInvestor.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.InvestorInvite).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.InvestorInvite).encode(__typed__); },
  },
  SetupAndPost: {
    template: function () { return exports.InvestorParty; },
    choiceName: 'SetupAndPost',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.SetupAndPost.decoder; }),
    argumentEncode: function (__typed__) { return exports.SetupAndPost.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple3(damlTypes.ContractId(exports.ProjectPosting), damlTypes.ContractId(exports.AssetVault), damlTypes.ContractId(exports.AssetVault)).decoder; }),
    resultEncode: function (__typed__) { return pkg40f452260bef3f29dede136108fc08a88d5a5250310281067087da6f0baddff7.DA.Types.Tuple3(damlTypes.ContractId(exports.ProjectPosting), damlTypes.ContractId(exports.AssetVault), damlTypes.ContractId(exports.AssetVault)).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.InvestorParty; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  OpenProposal: {
    template: function () { return exports.InvestorParty; },
    choiceName: 'OpenProposal',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.OpenProposal.decoder; }),
    argumentEncode: function (__typed__) { return exports.OpenProposal.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.GovernanceProposal).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.InvestorParty, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.Settle = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.VaultTopUp = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amt: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    amt: damlTypes.Numeric(10).encode(__typed__.amt),
  };
}
,
};



exports.Spend = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amt: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    amt: damlTypes.Numeric(10).encode(__typed__.amt),
  };
}
,
};



exports.Release = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({amt: damlTypes.Numeric(10).decoder, beneficiary: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    amt: damlTypes.Numeric(10).encode(__typed__.amt),
    beneficiary: damlTypes.Party.encode(__typed__.beneficiary),
  };
}
,
};



exports.AssetVault = damlTypes.assembleTemplate(
{
  templateId: '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167:Vindex:AssetVault',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({vaultType: exports.VaultType.decoder, funders: damlTypes.List(damlTypes.Party).decoder, stakeholders: damlTypes.List(damlTypes.Party).decoder, amount: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    vaultType: exports.VaultType.encode(__typed__.vaultType),
    funders: damlTypes.List(damlTypes.Party).encode(__typed__.funders),
    stakeholders: damlTypes.List(damlTypes.Party).encode(__typed__.stakeholders),
    amount: damlTypes.Numeric(10).encode(__typed__.amount),
  };
}
,
  Release: {
    template: function () { return exports.AssetVault; },
    choiceName: 'Release',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Release.decoder; }),
    argumentEncode: function (__typed__) { return exports.Release.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.AssetVault).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.AssetVault).encode(__typed__); },
  },
  Spend: {
    template: function () { return exports.AssetVault; },
    choiceName: 'Spend',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Spend.decoder; }),
    argumentEncode: function (__typed__) { return exports.Spend.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.AssetVault).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.AssetVault).encode(__typed__); },
  },
  VaultTopUp: {
    template: function () { return exports.AssetVault; },
    choiceName: 'VaultTopUp',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.VaultTopUp.decoder; }),
    argumentEncode: function (__typed__) { return exports.VaultTopUp.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.AssetVault).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.AssetVault).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.AssetVault; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Settle: {
    template: function () { return exports.AssetVault; },
    choiceName: 'Settle',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Settle.decoder; }),
    argumentEncode: function (__typed__) { return exports.Settle.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Numeric(10).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Numeric(10).encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.AssetVault, ['29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167', '29513a7ac78bcd183b9445d7602992a6cfd7a9ad62ae03207611ee3c38d74167']);



exports.Tally = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({acceptPower: damlTypes.Numeric(10).decoder, rejectPower: damlTypes.Numeric(10).decoder, castPower: damlTypes.Numeric(10).decoder, total: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    acceptPower: damlTypes.Numeric(10).encode(__typed__.acceptPower),
    rejectPower: damlTypes.Numeric(10).encode(__typed__.rejectPower),
    castPower: damlTypes.Numeric(10).encode(__typed__.castPower),
    total: damlTypes.Numeric(10).encode(__typed__.total),
  };
}
,
};



exports.Contribution = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({investor: damlTypes.Party.decoder, projectFunding: damlTypes.Numeric(10).decoder, agentFeeFunding: damlTypes.Numeric(10).decoder, weight: damlTypes.Numeric(10).decoder, }); }),
  encode: function (__typed__) {
  return {
    investor: damlTypes.Party.encode(__typed__.investor),
    projectFunding: damlTypes.Numeric(10).encode(__typed__.projectFunding),
    agentFeeFunding: damlTypes.Numeric(10).encode(__typed__.agentFeeFunding),
    weight: damlTypes.Numeric(10).encode(__typed__.weight),
  };
}
,
};



exports.GovernanceConfig = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({maxInvestors: damlTypes.Int.decoder, votingModel: exports.VotingModel.decoder, thresholdFraction: damlTypes.Numeric(10).decoder, weighted: damlTypes.Bool.decoder, quorumFraction: damlTypes.Numeric(10).decoder, defaultReviewWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime.decoder, }); }),
  encode: function (__typed__) {
  return {
    maxInvestors: damlTypes.Int.encode(__typed__.maxInvestors),
    votingModel: exports.VotingModel.encode(__typed__.votingModel),
    thresholdFraction: damlTypes.Numeric(10).encode(__typed__.thresholdFraction),
    weighted: damlTypes.Bool.encode(__typed__.weighted),
    quorumFraction: damlTypes.Numeric(10).encode(__typed__.quorumFraction),
    defaultReviewWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime.encode(__typed__.defaultReviewWindow),
  };
}
,
};



exports.MilestoneSpec = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({deliverablesHash: damlTypes.Text.decoder, payment: damlTypes.Numeric(10).decoder, workerWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime.decoder, reviewWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime.decoder, violationPct: damlTypes.Numeric(10).decoder, isFinal: damlTypes.Bool.decoder, }); }),
  encode: function (__typed__) {
  return {
    deliverablesHash: damlTypes.Text.encode(__typed__.deliverablesHash),
    payment: damlTypes.Numeric(10).encode(__typed__.payment),
    workerWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime.encode(__typed__.workerWindow),
    reviewWindow: pkg733e38d36a2759688a4b2c4cec69d48e7b55ecc8dedc8067b815926c917a182a.DA.Time.Types.RelTime.encode(__typed__.reviewWindow),
    violationPct: damlTypes.Numeric(10).encode(__typed__.violationPct),
    isFinal: damlTypes.Bool.encode(__typed__.isFinal),
  };
}
,
};



exports.ProposalAction = {
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.object({tag: jtv.constant('SelectWinner'), value: damlTypes.Party.decoder, }), jtv.object({tag: jtv.constant('ResolveContinue'), value: damlTypes.Unit.decoder, }), jtv.object({tag: jtv.constant('ResolveStop'), value: damlTypes.Unit.decoder, }), jtv.object({tag: jtv.constant('TopUp'), value: damlTypes.Numeric(10).decoder, })); }),
  encode: function (__typed__) {
  switch(__typed__.tag) {
    case 'SelectWinner': return {tag: __typed__.tag, value: damlTypes.Party.encode(__typed__.value)};
    case 'ResolveContinue': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    case 'ResolveStop': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
    case 'TopUp': return {tag: __typed__.tag, value: damlTypes.Numeric(10).encode(__typed__.value)};
    default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type ProposalAction';
  }
}
,
};



exports.VaultType = {
  BudgetV: 'BudgetV',
  CommitmentV: 'CommitmentV',
  AgentFeeV: 'AgentFeeV',
  keys: ['BudgetV','CommitmentV','AgentFeeV',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.VaultType.BudgetV), jtv.constant(exports.VaultType.CommitmentV), jtv.constant(exports.VaultType.AgentFeeV)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.MStatus = {
  Inactive: 'Inactive',
  Active: 'Active',
  Submitted: 'Submitted',
  RejPending: 'RejPending',
  Revision: 'Revision',
  Accepted: 'Accepted',
  Completed: 'Completed',
  Failed: 'Failed',
  keys: ['Inactive','Active','Submitted','RejPending','Revision','Accepted','Completed','Failed',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.MStatus.Inactive), jtv.constant(exports.MStatus.Active), jtv.constant(exports.MStatus.Submitted), jtv.constant(exports.MStatus.RejPending), jtv.constant(exports.MStatus.Revision), jtv.constant(exports.MStatus.Accepted), jtv.constant(exports.MStatus.Completed), jtv.constant(exports.MStatus.Failed)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.Vote = {
  ACCEPT: 'ACCEPT',
  REJECT: 'REJECT',
  keys: ['ACCEPT','REJECT',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.Vote.ACCEPT), jtv.constant(exports.Vote.REJECT)); }),
  encode: function (__typed__) { return __typed__; },
};



exports.VotingModel = {
  SimpleMajority: 'SimpleMajority',
  SuperMajority: 'SuperMajority',
  Weighted: 'Weighted',
  keys: ['SimpleMajority','SuperMajority','Weighted',],
  decoder: damlTypes.lazyMemo(function () { return jtv.oneOf(jtv.constant(exports.VotingModel.SimpleMajority), jtv.constant(exports.VotingModel.SuperMajority), jtv.constant(exports.VotingModel.Weighted)); }),
  encode: function (__typed__) { return __typed__; },
};

