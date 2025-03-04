# PushCola Subgraph

## Subgraph Endpoint
Synced at: https://thegraph.com/studio/subgraph/pushcolav5/

## Overview
This subgraph indexes events from the LazyMintFactory contract on Base network, tracking LazyMint deployments, coupon redemptions, token claims, and affiliate registrations.

## Entities
- **User**: Represents users who interact with the contracts
- **Coupon**: Represents LazyMint coupons created through the factory
- **Affiliate**: Tracks affiliate registrations for coupons
- **TokenMetadata**: Stores metadata for tokens retrieved from IPFS
- **CouponRedeemed**: Records coupon redemption events
- **TokenClaimed**: Records token claim events
- **LazyMintDeployed**: Records contract deployment events

## Contract Addresses
- LazyMintFactory: `0xC11679595D1Bd415b556d8E41e8b00311057d354` (Base network)
- Start Block: `23653189`

## Development Setup

### Prerequisites
- Node.js (v14 or later)
- NPM
- The Graph CLI

### Installation
