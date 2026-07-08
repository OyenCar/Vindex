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

var pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 = require('@daml.js/daml-prim-DA-Types-1.0.0');
var pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 = require('@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0');
var pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946 = require('@daml.js/daml-stdlib-DA-Time-Types-1.0.0');

exports.AcceptInvite = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.AgentVerdict = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      rejectionValid: damlTypes.Bool.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      rejectionValid: damlTypes.Bool.encode(__typed__.rejectionValid),
    };
  },
};

exports.Application = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:Application',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:Application',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        members: damlTypes.List(damlTypes.Party).decoder,
        applicant: damlTypes.Party.decoder,
        presentationHash: damlTypes.Text.decoder,
        presentationUri: damlTypes.Text.decoder,
        contactLink: damlTypes.Text.decoder,
        postingCid: damlTypes.ContractId(exports.ProjectPosting).decoder,
        postingId: damlTypes.Text.decoder,
      });
    }),
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
    },
    Archive: {
      template: function () { return exports.Application; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.Application, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.Apply = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      applicant: damlTypes.Party.decoder,
      presentationHash: damlTypes.Text.decoder,
      presentationUri: damlTypes.Text.decoder,
      contactLink: damlTypes.Text.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      applicant: damlTypes.Party.encode(__typed__.applicant),
      presentationHash: damlTypes.Text.encode(__typed__.presentationHash),
      presentationUri: damlTypes.Text.encode(__typed__.presentationUri),
      contactLink: damlTypes.Text.encode(__typed__.contactLink),
    };
  },
};

exports.ApprovePlan = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
    };
  },
};

exports.AssetVault = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:AssetVault',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:AssetVault',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        vaultType: exports.VaultType.decoder,
        funders: damlTypes.List(damlTypes.Party).decoder,
        stakeholders: damlTypes.List(damlTypes.Party).decoder,
        amount: damlTypes.Numeric(10).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        vaultType: exports.VaultType.encode(__typed__.vaultType),
        funders: damlTypes.List(damlTypes.Party).encode(__typed__.funders),
        stakeholders: damlTypes.List(damlTypes.Party).encode(__typed__.stakeholders),
        amount: damlTypes.Numeric(10).encode(__typed__.amount),
      };
    },
    Archive: {
      template: function () { return exports.AssetVault; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    Release: {
      template: function () { return exports.AssetVault; },
      choiceName: 'Release',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Release.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Release.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.AssetVault).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.AssetVault).encode(__typed__); },
    },
    Settle: {
      template: function () { return exports.AssetVault; },
      choiceName: 'Settle',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Settle.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Settle.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Numeric(10).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Numeric(10).encode(__typed__); },
    },
    Spend: {
      template: function () { return exports.AssetVault; },
      choiceName: 'Spend',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Spend.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Spend.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.AssetVault).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.AssetVault).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.AssetVault, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.CancelMandate = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.CastProposalVote = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      voter: damlTypes.Party.decoder,
      vote: exports.Vote.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      voter: damlTypes.Party.encode(__typed__.voter),
      vote: exports.Vote.encode(__typed__.vote),
    };
  },
};

exports.CastVote = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      voter: damlTypes.Party.decoder,
      vote: exports.Vote.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      voter: damlTypes.Party.encode(__typed__.voter),
      vote: exports.Vote.encode(__typed__.vote),
    };
  },
};

exports.Contribution = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      investor: damlTypes.Party.decoder,
      projectFunding: damlTypes.Numeric(10).decoder,
      weight: damlTypes.Numeric(10).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      investor: damlTypes.Party.encode(__typed__.investor),
      projectFunding: damlTypes.Numeric(10).encode(__typed__.projectFunding),
      weight: damlTypes.Numeric(10).encode(__typed__.weight),
    };
  },
};

exports.DeclineInvite = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.EditPostingDescription = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      newRequirements: damlTypes.Text.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      newRequirements: damlTypes.Text.encode(__typed__.newRequirements),
    };
  },
};

exports.FinalizeReview = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      reviewCid: damlTypes.ContractId(exports.MilestoneReview).decoder,
      waiveLatePenalty: damlTypes.Bool.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      reviewCid: damlTypes.ContractId(exports.MilestoneReview).encode(__typed__.reviewCid),
      waiveLatePenalty: damlTypes.Bool.encode(__typed__.waiveLatePenalty),
    };
  },
};

exports.GovernanceConfig = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      maxInvestors: damlTypes.Int.decoder,
      votingModel: exports.VotingModel.decoder,
      thresholdFraction: damlTypes.Numeric(10).decoder,
      weighted: damlTypes.Bool.decoder,
      quorumFraction: damlTypes.Numeric(10).decoder,
      defaultReviewWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      maxInvestors: damlTypes.Int.encode(__typed__.maxInvestors),
      votingModel: exports.VotingModel.encode(__typed__.votingModel),
      thresholdFraction: damlTypes.Numeric(10).encode(__typed__.thresholdFraction),
      weighted: damlTypes.Bool.encode(__typed__.weighted),
      quorumFraction: damlTypes.Numeric(10).encode(__typed__.quorumFraction),
      defaultReviewWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.defaultReviewWindow),
    };
  },
};

exports.GovernanceProposal = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:GovernanceProposal',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:GovernanceProposal',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        members: damlTypes.List(damlTypes.Party).decoder,
        contributions: damlTypes.List(exports.Contribution).decoder,
        config: exports.GovernanceConfig.decoder,
        agent: damlTypes.Party.decoder,
        purpose: damlTypes.Text.decoder,
        action: exports.ProposalAction.decoder,
        votes: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).decoder,
        deadline: damlTypes.Time.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
        contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
        config: exports.GovernanceConfig.encode(__typed__.config),
        agent: damlTypes.Party.encode(__typed__.agent),
        purpose: damlTypes.Text.encode(__typed__.purpose),
        action: exports.ProposalAction.encode(__typed__.action),
        votes: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).encode(__typed__.votes),
        deadline: damlTypes.Time.encode(__typed__.deadline),
      };
    },
    Archive: {
      template: function () { return exports.GovernanceProposal; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    CastProposalVote: {
      template: function () { return exports.GovernanceProposal; },
      choiceName: 'CastProposalVote',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.CastProposalVote.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.CastProposalVote.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.GovernanceProposal).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.GovernanceProposal, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.InvestorInvite = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:InvestorInvite',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:InvestorInvite',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder,
        members: damlTypes.List(damlTypes.Party).decoder,
        admin: damlTypes.Party.decoder,
        invitee: damlTypes.Party.decoder,
        proposedContribution: exports.Contribution.decoder,
        agent: damlTypes.Party.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        investorPartyCid: damlTypes.ContractId(exports.InvestorParty).encode(__typed__.investorPartyCid),
        members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
        admin: damlTypes.Party.encode(__typed__.admin),
        invitee: damlTypes.Party.encode(__typed__.invitee),
        proposedContribution: exports.Contribution.encode(__typed__.proposedContribution),
        agent: damlTypes.Party.encode(__typed__.agent),
      };
    },
    AcceptInvite: {
      template: function () { return exports.InvestorInvite; },
      choiceName: 'AcceptInvite',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AcceptInvite.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AcceptInvite.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.InvestorParty).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.InvestorParty).encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.InvestorInvite; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    DeclineInvite: {
      template: function () { return exports.InvestorInvite; },
      choiceName: 'DeclineInvite',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.DeclineInvite.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.DeclineInvite.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.InvestorInvite, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.InvestorParty = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:InvestorParty',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:InvestorParty',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        admin: damlTypes.Party.decoder,
        members: damlTypes.List(damlTypes.Party).decoder,
        pending: damlTypes.List(damlTypes.Party).decoder,
        contributions: damlTypes.List(exports.Contribution).decoder,
        config: exports.GovernanceConfig.decoder,
        agent: damlTypes.Party.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        admin: damlTypes.Party.encode(__typed__.admin),
        members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
        pending: damlTypes.List(damlTypes.Party).encode(__typed__.pending),
        contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
        config: exports.GovernanceConfig.encode(__typed__.config),
        agent: damlTypes.Party.encode(__typed__.agent),
      };
    },
    Archive: {
      template: function () { return exports.InvestorParty; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    InviteInvestor: {
      template: function () { return exports.InvestorParty; },
      choiceName: 'InviteInvestor',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.InviteInvestor.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.InviteInvestor.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.InvestorInvite).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.InvestorInvite).encode(__typed__); },
    },
    OpenProposal: {
      template: function () { return exports.InvestorParty; },
      choiceName: 'OpenProposal',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.OpenProposal.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.OpenProposal.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.GovernanceProposal).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__); },
    },
    SetupAndPost: {
      template: function () { return exports.InvestorParty; },
      choiceName: 'SetupAndPost',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.SetupAndPost.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.SetupAndPost.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.ProjectPosting), damlTypes.ContractId(exports.AssetVault)).decoder;
      }),
      resultEncode: function (__typed__) { return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.ProjectPosting), damlTypes.ContractId(exports.AssetVault)).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.InvestorParty, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.InviteInvestor = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      invitee: damlTypes.Party.decoder,
      proposedContribution: exports.Contribution.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      invitee: damlTypes.Party.encode(__typed__.invitee),
      proposedContribution: exports.Contribution.encode(__typed__.proposedContribution),
    };
  },
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
  keys: ['Inactive', 'Active', 'Submitted', 'RejPending', 'Revision', 'Accepted', 'Completed', 'Failed'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.MStatus.Inactive),
      jtv.constant(exports.MStatus.Active),
      jtv.constant(exports.MStatus.Submitted),
      jtv.constant(exports.MStatus.RejPending),
      jtv.constant(exports.MStatus.Revision),
      jtv.constant(exports.MStatus.Accepted),
      jtv.constant(exports.MStatus.Completed),
      jtv.constant(exports.MStatus.Failed),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};

exports.MarkFailed = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
    };
  },
};

exports.MilestoneReview = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:MilestoneReview',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:MilestoneReview',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        members: damlTypes.List(damlTypes.Party).decoder,
        worker: damlTypes.Party.decoder,
        agent: damlTypes.Party.decoder,
        contributions: damlTypes.List(exports.Contribution).decoder,
        config: exports.GovernanceConfig.decoder,
        milestoneIndex: damlTypes.Int.decoder,
        cycle: damlTypes.Int.decoder,
        votes: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).decoder,
        deadline: damlTypes.Time.decoder,
        rejectionReasons: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(damlTypes.Text)).decoder),
      });
    }),
    encode: function (__typed__) {
      return {
        members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
        worker: damlTypes.Party.encode(__typed__.worker),
        agent: damlTypes.Party.encode(__typed__.agent),
        contributions: damlTypes.List(exports.Contribution).encode(__typed__.contributions),
        config: exports.GovernanceConfig.encode(__typed__.config),
        milestoneIndex: damlTypes.Int.encode(__typed__.milestoneIndex),
        cycle: damlTypes.Int.encode(__typed__.cycle),
        votes: damlTypes.List(pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.Party, exports.Vote)).encode(__typed__.votes),
        deadline: damlTypes.Time.encode(__typed__.deadline),
        rejectionReasons: damlTypes.Optional(damlTypes.List(damlTypes.Text)).encode(__typed__.rejectionReasons),
      };
    },
    Archive: {
      template: function () { return exports.MilestoneReview; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    CastVote: {
      template: function () { return exports.MilestoneReview; },
      choiceName: 'CastVote',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.CastVote.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.CastVote.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.MilestoneReview).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.MilestoneReview).encode(__typed__); },
    },
    SetRejectionReasons: {
      template: function () { return exports.MilestoneReview; },
      choiceName: 'SetRejectionReasons',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.SetRejectionReasons.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.SetRejectionReasons.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.MilestoneReview).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.MilestoneReview).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.MilestoneReview, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.MilestoneSpec = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      deliverablesHash: damlTypes.Text.decoder,
      payment: damlTypes.Numeric(10).decoder,
      workerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder,
      reviewWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder,
      violationPct: damlTypes.Numeric(10).decoder,
      isFinal: damlTypes.Bool.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      deliverablesHash: damlTypes.Text.encode(__typed__.deliverablesHash),
      payment: damlTypes.Numeric(10).encode(__typed__.payment),
      workerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.workerWindow),
      reviewWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.reviewWindow),
      violationPct: damlTypes.Numeric(10).encode(__typed__.violationPct),
      isFinal: damlTypes.Bool.encode(__typed__.isFinal),
    };
  },
};

exports.OpenProposal = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      purpose: damlTypes.Text.decoder,
      action: exports.ProposalAction.decoder,
      deadline: damlTypes.Time.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      purpose: damlTypes.Text.encode(__typed__.purpose),
      action: exports.ProposalAction.encode(__typed__.action),
      deadline: damlTypes.Time.encode(__typed__.deadline),
    };
  },
};

exports.PlanningMandate = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:PlanningMandate',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:PlanningMandate',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder,
        members: damlTypes.List(damlTypes.Party).decoder,
        contributions: damlTypes.List(exports.Contribution).decoder,
        config: exports.GovernanceConfig.decoder,
        worker: damlTypes.Party.decoder,
        agent: damlTypes.Party.decoder,
        requirements: damlTypes.Text.decoder,
        briefUri: damlTypes.Text.decoder,
        budgetVault: damlTypes.ContractId(exports.AssetVault).decoder,
        commitmentRequired: damlTypes.Numeric(10).decoder,
        maxRevisions: damlTypes.Int.decoder,
        latePenaltyPct: damlTypes.Numeric(10).decoder,
        maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder,
      });
    }),
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
        commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
        maxRevisions: damlTypes.Int.encode(__typed__.maxRevisions),
        latePenaltyPct: damlTypes.Numeric(10).encode(__typed__.latePenaltyPct),
        maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.maxWorkerWindow),
      };
    },
    Archive: {
      template: function () { return exports.PlanningMandate; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    CancelMandate: {
      template: function () { return exports.PlanningMandate; },
      choiceName: 'CancelMandate',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.CancelMandate.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.CancelMandate.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    ProposePlan: {
      template: function () { return exports.PlanningMandate; },
      choiceName: 'ProposePlan',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.ProposePlan.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.ProposePlan.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.WorkPlan).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.WorkPlan).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.PlanningMandate, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.Project = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:Project',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:Project',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder,
        members: damlTypes.List(damlTypes.Party).decoder,
        contributions: damlTypes.List(exports.Contribution).decoder,
        config: exports.GovernanceConfig.decoder,
        worker: damlTypes.Party.decoder,
        agent: damlTypes.Party.decoder,
        milestones: damlTypes.List(exports.MilestoneSpec).decoder,
        requirements: damlTypes.Text.decoder,
        briefUri: damlTypes.Text.decoder,
        currentIndex: damlTypes.Int.decoder,
        status: exports.MStatus.decoder,
        submissionCount: damlTypes.Int.decoder,
        maxSubmissions: damlTypes.Int.decoder,
        workerDeadline: damlTypes.Time.decoder,
        agentVerdictDeadline: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Time).decoder),
        latePenaltyPct: damlTypes.Numeric(10).decoder,
        submittedLate: damlTypes.Bool.decoder,
        budgetVault: damlTypes.ContractId(exports.AssetVault).decoder,
        commitmentVault: damlTypes.ContractId(exports.AssetVault).decoder,
        paidOut: damlTypes.Numeric(10).decoder,
        currentSubmissionHash: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder),
        currentSubmissionUri: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.Text).decoder),
        rejectionReasons: jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.List(damlTypes.Text)).decoder),
      });
    }),
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
        agentVerdictDeadline: damlTypes.Optional(damlTypes.Time).encode(__typed__.agentVerdictDeadline),
        latePenaltyPct: damlTypes.Numeric(10).encode(__typed__.latePenaltyPct),
        submittedLate: damlTypes.Bool.encode(__typed__.submittedLate),
        budgetVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.budgetVault),
        commitmentVault: damlTypes.ContractId(exports.AssetVault).encode(__typed__.commitmentVault),
        paidOut: damlTypes.Numeric(10).encode(__typed__.paidOut),
        currentSubmissionHash: damlTypes.Optional(damlTypes.Text).encode(__typed__.currentSubmissionHash),
        currentSubmissionUri: damlTypes.Optional(damlTypes.Text).encode(__typed__.currentSubmissionUri),
        rejectionReasons: damlTypes.Optional(damlTypes.List(damlTypes.Text)).encode(__typed__.rejectionReasons),
      };
    },
    AgentVerdict: {
      template: function () { return exports.Project; },
      choiceName: 'AgentVerdict',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.AgentVerdict.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.AgentVerdict.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.Project)).decoder);
      }),
      resultEncode: function (__typed__) { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.Project; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    FinalizeReview: {
      template: function () { return exports.Project; },
      choiceName: 'FinalizeReview',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.FinalizeReview.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.FinalizeReview.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.Project)).decoder);
      }),
      resultEncode: function (__typed__) { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).encode(__typed__); },
    },
    MarkFailed: {
      template: function () { return exports.Project; },
      choiceName: 'MarkFailed',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.MarkFailed.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.MarkFailed.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    ResolveAfterViolation: {
      template: function () { return exports.Project; },
      choiceName: 'ResolveAfterViolation',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.ResolveAfterViolation.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.ResolveAfterViolation.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.Project)).decoder);
      }),
      resultEncode: function (__typed__) { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).encode(__typed__); },
    },
    ResolveStalePending: {
      template: function () { return exports.Project; },
      choiceName: 'ResolveStalePending',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.ResolveStalePending.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.ResolveStalePending.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return jtv.Decoder.withDefault(null, damlTypes.Optional(damlTypes.ContractId(exports.Project)).decoder);
      }),
      resultEncode: function (__typed__) { return damlTypes.Optional(damlTypes.ContractId(exports.Project)).encode(__typed__); },
    },
    SubmitMilestone: {
      template: function () { return exports.Project; },
      choiceName: 'SubmitMilestone',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.SubmitMilestone.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.SubmitMilestone.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.Project).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Project).encode(__typed__); },
    },
    WorkerViolation: {
      template: function () { return exports.Project; },
      choiceName: 'WorkerViolation',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.WorkerViolation.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.WorkerViolation.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.Project).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Project).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.Project, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.ProjectPosting = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:ProjectPosting',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:ProjectPosting',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        postingId: damlTypes.Text.decoder,
        investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder,
        members: damlTypes.List(damlTypes.Party).decoder,
        contributions: damlTypes.List(exports.Contribution).decoder,
        config: exports.GovernanceConfig.decoder,
        agent: damlTypes.Party.decoder,
        requirements: damlTypes.Text.decoder,
        briefUri: damlTypes.Text.decoder,
        budgetVault: damlTypes.ContractId(exports.AssetVault).decoder,
        commitmentRequired: damlTypes.Numeric(10).decoder,
        maxRevisions: damlTypes.Int.decoder,
        latePenaltyPct: damlTypes.Numeric(10).decoder,
        maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder,
        recruitmentMode: damlTypes.Text.decoder,
        eligibleWorkers: damlTypes.List(damlTypes.Text).decoder,
        publicParty: damlTypes.Party.decoder,
      });
    }),
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
        commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
        maxRevisions: damlTypes.Int.encode(__typed__.maxRevisions),
        latePenaltyPct: damlTypes.Numeric(10).encode(__typed__.latePenaltyPct),
        maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.maxWorkerWindow),
        recruitmentMode: damlTypes.Text.encode(__typed__.recruitmentMode),
        eligibleWorkers: damlTypes.List(damlTypes.Text).encode(__typed__.eligibleWorkers),
        publicParty: damlTypes.Party.encode(__typed__.publicParty),
      };
    },
    Apply: {
      template: function () { return exports.ProjectPosting; },
      choiceName: 'Apply',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Apply.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Apply.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.Application).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Application).encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.ProjectPosting; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    EditPostingDescription: {
      template: function () { return exports.ProjectPosting; },
      choiceName: 'EditPostingDescription',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.EditPostingDescription.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.EditPostingDescription.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.ProjectPosting).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.ProjectPosting).encode(__typed__); },
    },
    SelectWorker: {
      template: function () { return exports.ProjectPosting; },
      choiceName: 'SelectWorker',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.SelectWorker.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.SelectWorker.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.PlanningMandate).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.PlanningMandate).encode(__typed__); },
    },
    TakeDownPosting: {
      template: function () { return exports.ProjectPosting; },
      choiceName: 'TakeDownPosting',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.TakeDownPosting.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.TakeDownPosting.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.ProjectPosting, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.ProposalAction = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.object({
        tag: jtv.constant("SelectWinner"),
        value: damlTypes.Party.decoder,
      }),
      jtv.object({
        tag: jtv.constant("ResolveContinue"),
        value: damlTypes.Unit.decoder,
      }),
      jtv.object({
        tag: jtv.constant("ResolveStop"),
        value: damlTypes.Unit.decoder,
      }),
    );
  }),
  encode: function (__typed__) {
    switch(__typed__.tag) {
      case 'SelectWinner': return {tag: __typed__.tag, value: damlTypes.Party.encode(__typed__.value)};
      case 'ResolveContinue': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      case 'ResolveStop': return {tag: __typed__.tag, value: damlTypes.Unit.encode(__typed__.value)};
      default: throw 'unrecognized type tag: ' + __typed__.tag + ' while serializing a value of type ProposalAction';
    }
  },
};

exports.ProposePlan = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      milestones: damlTypes.List(exports.MilestoneSpec).decoder,
      maxSubmissions: damlTypes.Int.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      milestones: damlTypes.List(exports.MilestoneSpec).encode(__typed__.milestones),
      maxSubmissions: damlTypes.Int.encode(__typed__.maxSubmissions),
    };
  },
};

exports.ProposePlanAgain = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      newMilestones: damlTypes.List(exports.MilestoneSpec).decoder,
      newMaxSubmissions: damlTypes.Int.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      newMilestones: damlTypes.List(exports.MilestoneSpec).encode(__typed__.newMilestones),
      newMaxSubmissions: damlTypes.Int.encode(__typed__.newMaxSubmissions),
    };
  },
};

exports.RejectPlan = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
    };
  },
};

exports.Release = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      amt: damlTypes.Numeric(10).decoder,
      beneficiary: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      amt: damlTypes.Numeric(10).encode(__typed__.amt),
      beneficiary: damlTypes.Party.encode(__typed__.beneficiary),
    };
  },
};

exports.ResolveAfterViolation = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      proposalCid: damlTypes.ContractId(exports.GovernanceProposal).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      proposalCid: damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__.proposalCid),
    };
  },
};

exports.ResolveStalePending = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
    };
  },
};

exports.SelectWorker = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      proposalCid: damlTypes.ContractId(exports.GovernanceProposal).decoder,
      applicationCid: damlTypes.ContractId(exports.Application).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      proposalCid: damlTypes.ContractId(exports.GovernanceProposal).encode(__typed__.proposalCid),
      applicationCid: damlTypes.ContractId(exports.Application).encode(__typed__.applicationCid),
    };
  },
};

exports.SetRejectionReasons = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
      reasons: damlTypes.List(damlTypes.Text).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
      reasons: damlTypes.List(damlTypes.Text).encode(__typed__.reasons),
    };
  },
};

exports.Settle = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.Settlement = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:Settlement',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:Settlement',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        members: damlTypes.List(damlTypes.Party).decoder,
        worker: damlTypes.Party.decoder,
        agent: damlTypes.Party.decoder,
        reason: damlTypes.Text.decoder,
        refundedBudget: damlTypes.Numeric(10).decoder,
        refundedCommitment: damlTypes.Numeric(10).decoder,
        totalPaidOut: damlTypes.Numeric(10).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        members: damlTypes.List(damlTypes.Party).encode(__typed__.members),
        worker: damlTypes.Party.encode(__typed__.worker),
        agent: damlTypes.Party.encode(__typed__.agent),
        reason: damlTypes.Text.encode(__typed__.reason),
        refundedBudget: damlTypes.Numeric(10).encode(__typed__.refundedBudget),
        refundedCommitment: damlTypes.Numeric(10).encode(__typed__.refundedCommitment),
        totalPaidOut: damlTypes.Numeric(10).encode(__typed__.totalPaidOut),
      };
    },
    Archive: {
      template: function () { return exports.Settlement; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.Settlement, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.SetupAndPost = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      postingId: damlTypes.Text.decoder,
      requirements: damlTypes.Text.decoder,
      briefUri: damlTypes.Text.decoder,
      budgetAmount: damlTypes.Numeric(10).decoder,
      commitmentRequired: damlTypes.Numeric(10).decoder,
      maxRevisions: damlTypes.Int.decoder,
      latePenaltyPct: damlTypes.Numeric(10).decoder,
      maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder,
      recruitmentMode: damlTypes.Text.decoder,
      eligibleWorkers: damlTypes.List(damlTypes.Text).decoder,
      publicParty: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      postingId: damlTypes.Text.encode(__typed__.postingId),
      requirements: damlTypes.Text.encode(__typed__.requirements),
      briefUri: damlTypes.Text.encode(__typed__.briefUri),
      budgetAmount: damlTypes.Numeric(10).encode(__typed__.budgetAmount),
      commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
      maxRevisions: damlTypes.Int.encode(__typed__.maxRevisions),
      latePenaltyPct: damlTypes.Numeric(10).encode(__typed__.latePenaltyPct),
      maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.maxWorkerWindow),
      recruitmentMode: damlTypes.Text.encode(__typed__.recruitmentMode),
      eligibleWorkers: damlTypes.List(damlTypes.Text).encode(__typed__.eligibleWorkers),
      publicParty: damlTypes.Party.encode(__typed__.publicParty),
    };
  },
};

exports.Spend = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      amt: damlTypes.Numeric(10).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      amt: damlTypes.Numeric(10).encode(__typed__.amt),
    };
  },
};

exports.SubmitMilestone = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      deliverableHash: damlTypes.Text.decoder,
      deliverableUri: damlTypes.Text.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      deliverableHash: damlTypes.Text.encode(__typed__.deliverableHash),
      deliverableUri: damlTypes.Text.encode(__typed__.deliverableUri),
    };
  },
};

exports.TakeDownPosting = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
    };
  },
};

exports.Tally = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      acceptPower: damlTypes.Numeric(10).decoder,
      rejectPower: damlTypes.Numeric(10).decoder,
      castPower: damlTypes.Numeric(10).decoder,
      total: damlTypes.Numeric(10).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      acceptPower: damlTypes.Numeric(10).encode(__typed__.acceptPower),
      rejectPower: damlTypes.Numeric(10).encode(__typed__.rejectPower),
      castPower: damlTypes.Numeric(10).encode(__typed__.castPower),
      total: damlTypes.Numeric(10).encode(__typed__.total),
    };
  },
};

exports.VaultType = {
  BudgetV: 'BudgetV',
  CommitmentV: 'CommitmentV',
  keys: ['BudgetV', 'CommitmentV'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.VaultType.BudgetV),
      jtv.constant(exports.VaultType.CommitmentV),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};

exports.Vote = {
  ACCEPT: 'ACCEPT',
  REJECT: 'REJECT',
  keys: ['ACCEPT', 'REJECT'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.Vote.ACCEPT),
      jtv.constant(exports.Vote.REJECT),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};

exports.VotingModel = {
  SimpleMajority: 'SimpleMajority',
  SuperMajority: 'SuperMajority',
  Weighted: 'Weighted',
  keys: ['SimpleMajority', 'SuperMajority', 'Weighted'],
  decoder: damlTypes.lazyMemo(function () {
    return jtv.oneOf(
      jtv.constant(exports.VotingModel.SimpleMajority),
      jtv.constant(exports.VotingModel.SuperMajority),
      jtv.constant(exports.VotingModel.Weighted),
    );
  }),
  encode: function (__typed__) { return __typed__; },
};

exports.WithdrawPlan = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
    });
  }),
  encode: function (__typed__) {
    return {};
  },
};

exports.WorkPlan = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex:WorkPlan',
    templateIdWithPackageId: '#24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471:Vindex:WorkPlan',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        investorPartyCid: damlTypes.ContractId(exports.InvestorParty).decoder,
        members: damlTypes.List(damlTypes.Party).decoder,
        contributions: damlTypes.List(exports.Contribution).decoder,
        config: exports.GovernanceConfig.decoder,
        worker: damlTypes.Party.decoder,
        agent: damlTypes.Party.decoder,
        requirements: damlTypes.Text.decoder,
        briefUri: damlTypes.Text.decoder,
        milestones: damlTypes.List(exports.MilestoneSpec).decoder,
        maxSubmissions: damlTypes.Int.decoder,
        budgetVault: damlTypes.ContractId(exports.AssetVault).decoder,
        commitmentRequired: damlTypes.Numeric(10).decoder,
        maxRevisions: damlTypes.Int.decoder,
        latePenaltyPct: damlTypes.Numeric(10).decoder,
        maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.decoder,
      });
    }),
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
        commitmentRequired: damlTypes.Numeric(10).encode(__typed__.commitmentRequired),
        maxRevisions: damlTypes.Int.encode(__typed__.maxRevisions),
        latePenaltyPct: damlTypes.Numeric(10).encode(__typed__.latePenaltyPct),
        maxWorkerWindow: pkgb70db8369e1c461d5c70f1c86f526a29e9776c655e6ffc2560f95b05ccb8b946.DA.Time.Types.RelTime.encode(__typed__.maxWorkerWindow),
      };
    },
    ApprovePlan: {
      template: function () { return exports.WorkPlan; },
      choiceName: 'ApprovePlan',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.ApprovePlan.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.ApprovePlan.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.Project).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Project).encode(__typed__); },
    },
    Archive: {
      template: function () { return exports.WorkPlan; },
      choiceName: 'Archive',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.decoder;
      }),
      argumentEncode: function (__typed__) { return pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.Unit.decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
    },
    ProposePlanAgain: {
      template: function () { return exports.WorkPlan; },
      choiceName: 'ProposePlanAgain',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.ProposePlanAgain.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.ProposePlanAgain.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.WorkPlan).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.WorkPlan).encode(__typed__); },
    },
    RejectPlan: {
      template: function () { return exports.WorkPlan; },
      choiceName: 'RejectPlan',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.RejectPlan.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.RejectPlan.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.PlanningMandate).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.PlanningMandate).encode(__typed__); },
    },
    WithdrawPlan: {
      template: function () { return exports.WorkPlan; },
      choiceName: 'WithdrawPlan',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.WithdrawPlan.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.WithdrawPlan.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.PlanningMandate).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.PlanningMandate).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.WorkPlan, ['24e57209c46a06e87d6aa9bcead5bfb294de4b203e1074dd88122bc08c094471', '#vindex']);

exports.WorkerViolation = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      actor: damlTypes.Party.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      actor: damlTypes.Party.encode(__typed__.actor),
    };
  },
};
