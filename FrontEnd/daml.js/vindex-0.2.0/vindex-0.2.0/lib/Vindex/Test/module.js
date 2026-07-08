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

var Vindex = require('../../Vindex/module');

exports.Ctx = {
  decoder: damlTypes.lazyMemo(function () {
    return jtv.object({
      i1: damlTypes.Party.decoder,
      worker: damlTypes.Party.decoder,
      agent: damlTypes.Party.decoder,
      ip: damlTypes.ContractId(Vindex.InvestorParty).decoder,
      proj: damlTypes.ContractId(Vindex.Project).decoder,
    });
  }),
  encode: function (__typed__) {
    return {
      i1: damlTypes.Party.encode(__typed__.i1),
      worker: damlTypes.Party.encode(__typed__.worker),
      agent: damlTypes.Party.encode(__typed__.agent),
      ip: damlTypes.ContractId(Vindex.InvestorParty).encode(__typed__.ip),
      proj: damlTypes.ContractId(Vindex.Project).encode(__typed__.proj),
    };
  },
};
