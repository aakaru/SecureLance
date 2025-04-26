import mongoose from 'mongoose';

const GigSchema = new mongoose.Schema({
    clientAddress: {
        type: String,
        required: true,
        lowercase: true,
    },
    freelancerAddress: {
        type: String,
        lowercase: true,
        default: null,
    },
    description: {
        type: String,
        required: true,
    },
    budget: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Open', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Open',
    },
    contractGigId: {
        type: String,
        required: true,
        unique: true,
    },
    escrowContractAddress: {
        type: String,
        required: true,
        lowercase: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

GigSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

GigSchema.index({ clientAddress: 1 });
GigSchema.index({ freelancerAddress: 1 });
GigSchema.index({ status: 1 });

export default mongoose.model('Gig', GigSchema);
