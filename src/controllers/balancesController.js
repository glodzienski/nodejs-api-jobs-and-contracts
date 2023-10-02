const {Op} = require("sequelize");
async function listDepositsByUser(req, res) {
    const {Job} = req.app.get('models');
    const sequelize = req.app.get('sequelize');
    const {profile} = req;
    const {userId} = req.params;

    let {amount} = req.body;
    amount = parseInt(amount);

    try {
        if (profile.id !== parseInt(userId)) {
            return res.status(403).json({error: 'You do not have permission to deposit into this account'});
        }

        if (profile.type !== 'client') {
            return res.status(400).json({error: 'Only clients can make deposits'});
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({error: 'Deposit amount must be greater than zero'});
        }

        const clientContracts = await profile.getClientContracts();

        const jobsToPay = await Job.sum('price', {
            where: {
                ContractId: {[Op.in]: clientContracts.map((c) => c.id)},
                paid: {[Op.not]: true,},
            },
        });

        const maxDeposit = jobsToPay * 0.25;

        if (amount > maxDeposit) {
            return res.status(400).json({error: `Deposit amount exceeds the maximum allowed (${maxDeposit})`});
        }

        await sequelize.transaction(async (transaction) => {
            profile.balance += amount;
            await profile.save({transaction});
        });

        res.json({message: 'Deposit successful'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

module.exports = {
    listDepositsByUser
};
