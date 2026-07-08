// Generated from ../../Vindex/Token/module.daml

/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';

import * as pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4 from '@daml.js/daml-prim-DA-Types-1.0.0';
import * as pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69 from '@daml.js/ghc-stdlib-DA-Internal-Template-1.0.0';

export declare type Burn = {
  holdingCid: damlTypes.ContractId<TokenHolding>,
}

export declare const Burn:
  damlTypes.Serializable<Burn>

export declare type HoldingView = {
  owner: damlTypes.Party,
  instrumentId: InstrumentId,
  amount: damlTypes.Numeric,
  meta: TokenMeta,
}

export declare const HoldingView:
  damlTypes.Serializable<HoldingView>

export declare type InstrumentId = {
  admin: damlTypes.Party,
  id: string,
}

export declare const InstrumentId:
  damlTypes.Serializable<InstrumentId>

export declare type Merge = {
  otherCid: damlTypes.ContractId<TokenHolding>,
}

export declare const Merge:
  damlTypes.Serializable<Merge>

export declare type Mint = {
  owner: damlTypes.Party,
  amount: damlTypes.Numeric,
}

export declare const Mint:
  damlTypes.Serializable<Mint>

export declare type Split = {
  splitAmount: damlTypes.Numeric,
}

export declare const Split:
  damlTypes.Serializable<Split>

export declare type TokenHolding = {
  owner: damlTypes.Party,
  custodian: damlTypes.Party,
  instrumentId: InstrumentId,
  amount: damlTypes.Numeric,
  meta: TokenMeta,
}

export declare interface TokenHoldingInterface {
  Archive: 
    damlTypes.Choice<TokenHolding, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenHolding, undefined>>;
  Merge: 
    damlTypes.Choice<TokenHolding, Merge, damlTypes.ContractId<TokenHolding>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenHolding, undefined>>;
  Split: 
    damlTypes.Choice<TokenHolding, Split, pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.ContractId<TokenHolding>, damlTypes.ContractId<TokenHolding>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenHolding, undefined>>;
  Transfer: 
    damlTypes.Choice<TokenHolding, Transfer, pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.ContractId<TokenHolding>, damlTypes.Optional<damlTypes.ContractId<TokenHolding>>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenHolding, undefined>>;
}
export declare const TokenHolding:
  damlTypes.Template<TokenHolding, undefined, '#vindex:Vindex.Token:TokenHolding'> &
  damlTypes.ToInterface<TokenHolding, never> &
  TokenHoldingInterface

export declare type TokenMeta = {
  name: string,
  symbol: string,
  decimals: damlTypes.Int,
  iconUri: string,
  description: string,
}

export declare const TokenMeta:
  damlTypes.Serializable<TokenMeta>

export declare type TokenRegistry = {
  admin: damlTypes.Party,
  instrumentId: InstrumentId,
  meta: TokenMeta,
  totalSupply: damlTypes.Numeric,
  observers: damlTypes.Party[],
}

export declare interface TokenRegistryInterface {
  Archive: 
    damlTypes.Choice<TokenRegistry, pkg9e70a8b3510d617f8a136213f33d6a903a10ca0eeec76bb06ba55d1ed9680f69.DA.Internal.Template.Archive, {}, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenRegistry, undefined>>;
  Burn: 
    damlTypes.Choice<TokenRegistry, Burn, damlTypes.ContractId<TokenRegistry>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenRegistry, undefined>>;
  Mint: 
    damlTypes.Choice<TokenRegistry, Mint, pkg5aee9b21b8e9a4c4975b5f4c4198e6e6e8469df49e2010820e792f393db870f4.DA.Types.Tuple2<damlTypes.ContractId<TokenRegistry>, damlTypes.ContractId<TokenHolding>>, undefined> &
    damlTypes.ChoiceFrom<damlTypes.Template<TokenRegistry, undefined>>;
}
export declare const TokenRegistry:
  damlTypes.Template<TokenRegistry, undefined, '#vindex:Vindex.Token:TokenRegistry'> &
  damlTypes.ToInterface<TokenRegistry, never> &
  TokenRegistryInterface

export declare type Transfer = {
  newOwner: damlTypes.Party,
  transferAmount: damlTypes.Numeric,
}

export declare const Transfer:
  damlTypes.Serializable<Transfer>
