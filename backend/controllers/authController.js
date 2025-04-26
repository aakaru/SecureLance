import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import crypto from 'crypto';
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};
const signupUser = async (req, res) => {
  const { username, walletAddress } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ username }, { walletAddress }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or Wallet Address already exists' });
    }
    const nonce = crypto.randomBytes(16).toString('hex');
    const user = await User.create({
      username,
      walletAddress,
      nonce,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        walletAddress: user.walletAddress,
        token: generateToken(user._id), 
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};
const getNonceToSign = async (req, res) => {
  const { address } = req.params;
  if (!ethers.isAddress(address)) {
    return res.status(400).json({ message: 'Invalid Ethereum address' });
  }
  try {
    let user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      const newNonce = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        walletAddress: address.toLowerCase(),
        username: `user_${address.substring(0, 6)}`, 
        nonce: newNonce
      });
      console.log(`New user created for address: ${address}`);
    } else {
      user.nonce = crypto.randomBytes(16).toString('hex');
      await user.save();
    }
    res.status(200).json({ nonce: user.nonce });
  } catch (error) {
    console.error("Error in getNonceToSign:", error);
    res.status(500).json({ message: 'Server error retrieving nonce', error: error.message });
  }
};
export const verifySignatureAndLogin = async (req, res) => {
  const { address, signature, username } = req.body;
  if (!ethers.isAddress(address) || !signature) {
    return res.status(400).json({ message: 'Address and signature are required' });
  }
  try {
    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found for this address. Cannot verify signature.' });
    }
    const messageToVerify = `Welcome to SecureLance! Sign this message to log in. Nonce: ${user.nonce}`;
    const recoveredAddress = ethers.verifyMessage(messageToVerify, signature);
    if (recoveredAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
      return res.status(401).json({ message: 'Signature verification failed. Invalid signature.' });
    }
    user.nonce = crypto.randomBytes(16).toString('hex');
    if (username && (user.username === `user_${user.walletAddress.substring(0, 6)}` || !user.username)) {
        const existingUsername = await User.findOne({ username: username });
        if (existingUsername && existingUsername.walletAddress !== user.walletAddress) {
            return res.status(400).json({ message: 'Username already taken.' });
        }
        user.username = username;
    }
    await user.save();
    const token = generateToken(user._id);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      walletAddress: user.walletAddress,
      token: token,
    });
  } catch (error) {
    console.error("Error in verifySignatureAndLogin:", error);
    if (error.message.includes('invalid arrayify value')) {
        return res.status(400).json({ message: 'Invalid signature format.'});
    }
    res.status(500).json({ message: 'Server error during signature verification', error: error.message });
  }
};
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password'); 
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next(); 
    } catch (error) {
      console.error('Error in auth middleware:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};
export { generateToken, signupUser, getNonceToSign, protect };
