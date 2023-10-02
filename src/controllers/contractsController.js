const { Op } = require('sequelize');
const { Contract } = require('../model');

async function getContractById(req, res) {
    const { id } = req.params;
    const { profile } = req;

    try {
        const contract = await Contract.findOne({ where: { id } });

        if (!contract) {
            return res.status(404).json({ error: 'Contract not found' });
        }

        if (![contract.ClientId, contract.ContractorId].includes(profile.id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(contract);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function listContracts(req, res) {
    const { profile } = req;

    try {
        const contracts = await Contract.findAll({
            where: {
                [Op.or]: [{ ContractorId: profile.id }, { ClientId: profile.id }],
                status: {
                    [Op.ne]: 'terminated',
                },
            },
        });

        res.json(contracts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    getContractById,
    listContracts,
};
