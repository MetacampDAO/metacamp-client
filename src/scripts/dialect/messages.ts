// https://docs.dialect.to/documentation/messaging/typescript

// Common imports
import {
    Dialect,
    DialectCloudEnvironment,
    DialectSdk,
  } from '@dialectlabs/sdk';
  
  // Solana-specific imports
  import {
    Solana,
    SolanaSdkFactory,
    NodeDialectSolanaWalletAdapter
  } from '@dialectlabs/blockchain-sdk-solana';
  
  const environment: DialectCloudEnvironment = 'development';
  
  const sdk: DialectSdk<Solana> = Dialect.sdk(
    {
      environment,
    },
    SolanaSdkFactory.create({
      // IMPORTANT: must set environment variable DIALECT_SDK_CREDENTIALS
      // to your dapp's Solana messaging wallet keypair e.g. [170,23, . . . ,300]
      wallet: NodeDialectSolanaWalletAdapter.create(),
    }),
  );


import type {
    // ... previous imports
    Thread,
    ThreadId,
  } from '@dialectlabs/sdk';
  
  // ... code from previous examples
  
  // Fetch all threads the wallet is a part of, across all provided backends
  const threads: Thread[] = await sdk.threads.findAll();