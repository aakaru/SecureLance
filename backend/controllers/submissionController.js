import Submission from '../models/Submission.js';
import asyncHandler from 'express-async-handler';
import { uploadFileToPinata } from './pinataUtil.js';
import fs from 'fs';

export const submitWork = asyncHandler(async (req, res) => {
    const { contractGigId, milestone, notes, user } = req.body;
    if (!req.file) {
        res.status(400);
        throw new Error('File is required');
    }
    if (!contractGigId || !user) {
        res.status(400);
        throw new Error('contractGigId and user are required');
    }
    const ipfsHash = await uploadFileToPinata(req.file.originalname, fs.createReadStream(req.file.path));
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const submission = await Submission.create({
        user,
        contractGigId,
        milestone,
        notes,
        ipfsUrl,
    });
    fs.unlink(req.file.path, () => {});
    res.status(201).json(submission);
});

export const getSubmissions = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.user) filter.user = req.query.user;
    if (req.query.contractGigId) filter.contractGigId = req.query.contractGigId;
    const submissions = await Submission.find(filter).sort({ createdAt: -1 }).populate('user', 'email');
    res.json(submissions);
});
