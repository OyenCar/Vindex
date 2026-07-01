# Canton EVM Bridge - Experimental (NOT RECOMMENDED)

## ⚠️ WARNING
This is an experimental solution that is **NOT** suitable for your current Vindex project.
The standard Canton sandbox does **NOT** have a built-in EVM execution layer.

## Why is this difficult?

1. **Canton Coin is not yet publicly released** - it is still in internal development by Digital Asset.
2. **Different architectures**:
   - Canton: UTXO-based Daml
   - EVM: Account-based Solidity
3. **Vindex is designed to be Canton-native** - switching to EVM means rewriting all smart contracts in Solidity.

---

## If You Still Want EVM Wallet Integration

### Hybrid Approach (Custom Bridge)

You would need to build a **custom middleware** that translates:

```
Rabby/MetaMask Wallet (EVM JSON-RPC)
    ↓
Custom Bridge Service (Node.js/Python)
    ↓ translate RPC calls → Daml commands
Canton HTTP JSON Ledger API (port 7575)
```

#### Components to Build:

1. **EVM JSON-RPC Server Mock** (port 8545)
2. **Address-to-Party ID mapping**
3. **Transaction translator**:
   - `eth_sendTransaction` → `createCommand` or `exerciseCommand`
   - `eth_call` → `query` contracts
   - `eth_getBalance` → query `AssetVault` contracts

#### Example Bridge Skeleton (Node.js)

```javascript
// evm-canton-bridge.js - CONCEPTUAL EXAMPLE ONLY
const express = require('express');
const { Ledger } = require('@daml/ledger');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Mapping EVM address → Canton Party
const addressToParty = {
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb': 'Investor::12201234...',
  '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed': 'Worker::12205678...'
};

// Mock EVM JSON-RPC endpoint
app.post('/', async (req, res) => {
  const { method, params, id, jsonrpc } = req.body;

  console.log(`EVM RPC Call: ${method}`, params);

  switch(method) {
    case 'eth_chainId':
      return res.json({ jsonrpc, id, result: '0x539' }); // 1337 in hex

    case 'eth_accounts':
      return res.json({ 
        jsonrpc, 
        id, 
        result: Object.keys(addressToParty) 
      });

    case 'eth_getBalance':
      // Translate to query AssetVault in Canton
      const address = params[0];
      const party = addressToParty[address];
      
      if (!party) {
        return res.json({ 
          jsonrpc, 
          id, 
          error: { code: -32000, message: 'Party not found' }
        });
      }

      // Query balance from Canton
      try {
        const ledger = new Ledger({ token: generateToken(party) });
        // Query AssetVault contracts...
        // const vaults = await ledger.query(...);
        
        // Mock response
        return res.json({ 
          jsonrpc, 
          id, 
          result: '0xde0b6b3a7640000' // 1 ETH in hex wei
        });
      } catch (error) {
        return res.json({ 
          jsonrpc, 
          id, 
          error: { code: -32603, message: error.message }
        });
      }

    case 'eth_sendTransaction':
      // Translate EVM tx → Canton command
      const tx = params[0];
      // Parse tx.data to determine which Daml choice is being called
      // Execute via Canton JSON API
      return res.json({ 
        jsonrpc, 
        id, 
        result: '0x' + Math.random().toString(16).substr(2, 64) 
      });

    default:
      return res.json({ 
        jsonrpc, 
        id, 
        error: { code: -32601, message: 'Method not implemented' }
      });
  }
});

function generateToken(party) {
  // Implement JWT generation corresponding to the /api/auth web3/daml logic
  return 'YOUR_JWT_TOKEN';
}

app.listen(8545, () => {
  console.log('EVM-Canton Bridge running on http://localhost:8545');
  console.log('⚠️  This is a minimal bridge - many RPC methods are not implemented');
});
```

#### Setup:

```bash
# Install dependencies
npm init -y
npm install express @daml/ledger @daml/types body-parser jsonwebtoken

# Run the bridge
node evm-canton-bridge.js

# In another terminal, run Canton
cd SmartContract
daml sandbox --port 6865
daml json-api --ledger-host localhost --ledger-port 6865 --http-port 7575
```

#### Rabby/MetaMask Wallet Configuration:

1. Open your Web3 Wallet
2. Go to Settings → Networks → Add Custom Network
3. Input:
   - **Network Name**: Canton Local (Bridge)
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `CANT` (or any symbol)

---

### Drawbacks of This Approach:

❌ **No transaction signing** - Canton uses party auth, not private keys.  
❌ **No real smart contracts on EVM** - all state translation is mocked.  
❌ **Wallets cannot view Daml contracts directly** - requires manual mappings.  
❌ **Very high maintenance complexity**.  
❌ **Vindex contracts are already in Daml** - must be rewritten in Solidity for native EVM support.

---

## Recommendations

### ✅ For Vindex: Use Canton Native UI

Your project already has the correct architecture:

```typescript
// FrontEnd/components/daml/PartyConnect.tsx
// This is correct for Canton
const connectParty = async (partyId: string, role: Role) => {
  const token = await fetchToken(partyId);
  const ledger = new Ledger({ token, httpBaseUrl, wsBaseUrl });
  // ... ready to use Daml contracts
};
```

### ✅ For User Onboarding: Use Party Aliases

Instead of complex EVM wallet bridges, create a user-friendly UX layer:

```typescript
// Map human-readable names to Canton Party IDs
const partyRegistry = {
  'alice@vindex.io': 'Investor::1220abc...',
  'bob@vindex.io': 'Worker::1220def...'
};
```

---

## Conclusion

**There is no easy or official way to connect EVM wallets directly to the Canton sandbox.**

If your goal is to:
- ✅ **Deploy Vindex on Canton** → Proceed with the current architecture (already correct).
- ❌ **Use EVM wallets natively** → You must rewrite all contracts in Solidity and deploy them to an EVM chain (Ethereum, Polygon, L2s, etc.).

Canton and EVM are two different paradigms. Choose one and commit to its architecture.
