const {Contract} = require("../model");
const {Op} = require("sequelize");

async function payJobById (req, res) {
    const {Job, Profile} = req.app.get('models');
    const sequelize = req.app.get('sequelize');
    const {profile} = req;
    const {job_id} = req.params;

    try {
        const job = await Job.findOne({
            where: {id: job_id},
            include: [{model: Contract}],
        });

        if (!job) {
            return res.status(404).json({error: 'Job not found'});
        }

        if (!job.Contract || job.Contract.ClientId !== profile.id) {
            return res.status(403).json({error: 'You do not have permission to pay for this job'});
        }

        if (job.paid) {
            return res.status(400).json({error: 'This job has already been paid'});
        }

        const contractor = await Profile.findOne({where: {id: job.Contract.ContractorId}});

        if (profile.balance < job.price) {
            return res.status(400).json({error: 'Insufficient balance to pay for this job'});
        }

        await sequelize.transaction(async (transaction) => {
            profile.balance -= job.price;
            await profile.save({transaction});

            contractor.balance += job.price;
            await contractor.save({transaction});

            job.paid = true;
            job.paymentDate = new Date();
            await job.save({transaction});
        });

        res.json({message: 'Payment successful'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function listUnpaidJobs(req, res) {
    const {Job, Contract} = req.app.get('models');
    const {profile} = req;

    try {
        const activeContracts = await Contract.findAll({
            where: {
                [Op.or]: [{ContractorId: profile.id}, {ClientId: profile.id}],
                status: 'in_progress',
            },
        });

        const activeContractIds = activeContracts.map((contract) => contract.id);

        const unpaidJobs = await Job.findAll({
            where: {
                ContractId: activeContractIds,
                paid: {[Op.not]: true,},
            },
        });

        res.json(unpaidJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports = {
    payJobById,
    listUnpaidJobs
};
