# SecureLance - Blockchain-Based Freelancing Platform

A decentralized freelancing platform built using blockchain technology for secure, transparent contract management and payments.

## Overview

SecureLance connects clients and freelancers in a trustless environment, using smart contracts for escrow services and milestone-based payments. The platform eliminates intermediaries, reduces fees, and provides reliable dispute resolution.

## Features

- Blockchain-based escrow system
- Smart contract milestone management
- Decentralized reputation system
- Secure file submission through IPFS
- Transparent client-freelancer agreements
- Wallet integration

## Technology Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- Backend: Node.js, Express
- Blockchain: Ethereum, Solidity
- Storage: IPFS via Pinata
- Authentication: JWT with wallet signatures

## Getting Started

```sh
# Clone the repository
git clone https://github.com/aakaru/SecureLance.git

# Install dependencies
npm install

# Start the frontend development server
npm run dev

# Start the backend server
cd backend && npm install && npm start
```

## Project Structure

- `/src` - Frontend React application
- `/contracts` - Solidity smart contracts
- `/backend` - Node.js API server
- `/public` - Static assets
