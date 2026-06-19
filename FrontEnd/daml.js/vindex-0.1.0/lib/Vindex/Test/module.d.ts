// Generated from Vindex/Test.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import * as damlLedger from '@daml/ledger';

import * as Vindex from '../../Vindex/module';

export declare type Ctx = {
  i1: damlTypes.Party;
  worker: damlTypes.Party;
  agent: damlTypes.Party;
  ip: damlTypes.ContractId<Vindex.InvestorParty>;
  proj: damlTypes.ContractId<Vindex.Project>;
};

export declare const Ctx:
  damlTypes.Serializable<Ctx> & {
  }
;

