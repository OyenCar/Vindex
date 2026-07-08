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

exports.Burn = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      holdingCid: damlTypes.ContractId(exports.TokenHolding).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      holdingCid: damlTypes.ContractId(exports.TokenHolding).encode(__typed__.holdingCid),
    };
  },
};

exports.HoldingView = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      owner: damlTypes.Party.decoder,
      instrumentId: exports.InstrumentId.decoder,
      amount: damlTypes.Numeric(10).decoder,
      meta: exports.TokenMeta.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      owner: damlTypes.Party.encode(__typed__.owner),
      instrumentId: exports.InstrumentId.encode(__typed__.instrumentId),
      amount: damlTypes.Numeric(10).encode(__typed__.amount),
      meta: exports.TokenMeta.encode(__typed__.meta),
    };
  },
};

exports.InstrumentId = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      admin: damlTypes.Party.decoder,
      id: damlTypes.Text.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      admin: damlTypes.Party.encode(__typed__.admin),
      id: damlTypes.Text.encode(__typed__.id),
    };
  },
};

exports.Merge = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      otherCid: damlTypes.ContractId(exports.TokenHolding).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      otherCid: damlTypes.ContractId(exports.TokenHolding).encode(__typed__.otherCid),
    };
  },
};

exports.Mint = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      owner: damlTypes.Party.decoder,
      amount: damlTypes.Numeric(10).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      owner: damlTypes.Party.encode(__typed__.owner),
      amount: damlTypes.Numeric(10).encode(__typed__.amount),
    };
  },
};

exports.Split = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      splitAmount: damlTypes.Numeric(10).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      splitAmount: damlTypes.Numeric(10).encode(__typed__.splitAmount),
    };
  },
};

exports.TokenHolding = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex.Token:TokenHolding',
    templateIdWithPackageId: '#d15c40d824c1c6453570505947e3f5044dde237edcf81a4a3bcc443e55d88600:Vindex.Token:TokenHolding',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        owner: damlTypes.Party.decoder,
        custodian: damlTypes.Party.decoder,
        instrumentId: exports.InstrumentId.decoder,
        amount: damlTypes.Numeric(10).decoder,
        meta: exports.TokenMeta.decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        owner: damlTypes.Party.encode(__typed__.owner),
        custodian: damlTypes.Party.encode(__typed__.custodian),
        instrumentId: exports.InstrumentId.encode(__typed__.instrumentId),
        amount: damlTypes.Numeric(10).encode(__typed__.amount),
        meta: exports.TokenMeta.encode(__typed__.meta),
      };
    },
    Archive: {
      template: function () { return exports.TokenHolding; },
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
    Merge: {
      template: function () { return exports.TokenHolding; },
      choiceName: 'Merge',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Merge.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Merge.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.TokenHolding).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.TokenHolding).encode(__typed__); },
    },
    Split: {
      template: function () { return exports.TokenHolding; },
      choiceName: 'Split',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Split.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Split.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.TokenHolding), damlTypes.ContractId(exports.TokenHolding)).decoder;
      }),
      resultEncode: function (__typed__) { return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.TokenHolding), damlTypes.ContractId(exports.TokenHolding)).encode(__typed__); },
    },
    Transfer: {
      template: function () { return exports.TokenHolding; },
      choiceName: 'Transfer',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Transfer.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Transfer.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.TokenHolding), damlTypes.Optional(damlTypes.ContractId(exports.TokenHolding))).decoder;
      }),
      resultEncode: function (__typed__) { return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.TokenHolding), damlTypes.Optional(damlTypes.ContractId(exports.TokenHolding))).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.TokenHolding, ['d15c40d824c1c6453570505947e3f5044dde237edcf81a4a3bcc443e55d88600', '#vindex']);

exports.TokenMeta = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      name: damlTypes.Text.decoder,
      symbol: damlTypes.Text.decoder,
      decimals: damlTypes.Int.decoder,
      iconUri: damlTypes.Text.decoder,
      description: damlTypes.Text.decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      name: damlTypes.Text.encode(__typed__.name),
      symbol: damlTypes.Text.encode(__typed__.symbol),
      decimals: damlTypes.Int.encode(__typed__.decimals),
      iconUri: damlTypes.Text.encode(__typed__.iconUri),
      description: damlTypes.Text.encode(__typed__.description),
    };
  },
};

exports.TokenRegistry = damlTypes.assembleTemplate(
  {
    templateId: '#vindex:Vindex.Token:TokenRegistry',
    templateIdWithPackageId: '#d15c40d824c1c6453570505947e3f5044dde237edcf81a4a3bcc443e55d88600:Vindex.Token:TokenRegistry',
    keyDecoder: jtv.constant(undefined),
    keyEncode: function () { throw 'EncodeError'; },
    decoder: damlTypes.lazyMemo(function () {
      return jtv.object({
        admin: damlTypes.Party.decoder,
        instrumentId: exports.InstrumentId.decoder,
        meta: exports.TokenMeta.decoder,
        totalSupply: damlTypes.Numeric(10).decoder,
        observers: damlTypes.List(damlTypes.Party).decoder,
      });
    }),
    encode: function (__typed__) {
      return {
        admin: damlTypes.Party.encode(__typed__.admin),
        instrumentId: exports.InstrumentId.encode(__typed__.instrumentId),
        meta: exports.TokenMeta.encode(__typed__.meta),
        totalSupply: damlTypes.Numeric(10).encode(__typed__.totalSupply),
        observers: damlTypes.List(damlTypes.Party).encode(__typed__.observers),
      };
    },
    Archive: {
      template: function () { return exports.TokenRegistry; },
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
    Burn: {
      template: function () { return exports.TokenRegistry; },
      choiceName: 'Burn',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Burn.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Burn.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return damlTypes.ContractId(exports.TokenRegistry).decoder;
      }),
      resultEncode: function (__typed__) { return damlTypes.ContractId(exports.TokenRegistry).encode(__typed__); },
    },
    Mint: {
      template: function () { return exports.TokenRegistry; },
      choiceName: 'Mint',
      argumentDecoder: damlTypes.lazyMemo(function () {
        return exports.Mint.decoder;
      }),
      argumentEncode: function (__typed__) { return exports.Mint.encode(__typed__); },
      resultDecoder: damlTypes.lazyMemo(function () {
        return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.TokenRegistry), damlTypes.ContractId(exports.TokenHolding)).decoder;
      }),
      resultEncode: function (__typed__) { return pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2(damlTypes.ContractId(exports.TokenRegistry), damlTypes.ContractId(exports.TokenHolding)).encode(__typed__); },
    },
  },
);

damlTypes.registerTemplate(exports.TokenRegistry, ['d15c40d824c1c6453570505947e3f5044dde237edcf81a4a3bcc443e55d88600', '#vindex']);

exports.Transfer = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      newOwner: damlTypes.Party.decoder,
      transferAmount: damlTypes.Numeric(10).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      newOwner: damlTypes.Party.encode(__typed__.newOwner),
      transferAmount: damlTypes.Numeric(10).encode(__typed__.transferAmount),
    };
  },
};
