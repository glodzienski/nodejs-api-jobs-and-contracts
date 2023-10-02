async function getBestProfession(req, res) {
    const sequelize = req.app.get('sequelize');
    const {start, end} = req.query;

    try {
        if (!start || !end) {
            return res.status(400).json({error: 'Both start and end dates are required'});
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({error: 'Invalid date format'});
        }

        const result = await sequelize.query(
            `
                SELECT p.profession,
                       SUM(j.price) AS totalEarnings
                FROM Jobs AS j
                         INNER JOIN
                     Contracts AS c ON j.ContractId = c.id
                         INNER JOIN
                     Profiles AS p ON c.ContractorId = p.id
                WHERE j.paid = true
                  AND j.paymentDate BETWEEN :startDate AND :endDate
                GROUP BY p.profession
                ORDER BY totalEarnings DESC LIMIT 1;
            `,
            {
                replacements: {startDate, endDate},
                type: sequelize.QueryTypes.SELECT,
            }
        );

        if (result.length === 0) {
            return res.status(404).json({error: 'No data found for the specified date range'});
        }

        const {profession, totalEarnings} = result[0];

        res.json({profession, totalEarnings});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function getBestClients(req, res) {
    const sequelize = req.app.get('sequelize');
    const {start, end, limit = 2} = req.query;

    try {
        if (!start || !end) {
            return res.status(400).json({error: 'Both start and end dates are required'});
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({error: 'Invalid date format'});
        }

        const result = await sequelize
            .query(
                `
                    SELECT p.id,
                           p.firstName,
                           p.lastName,
                           SUM(j.price) AS paid
                    FROM Jobs AS j
                             INNER JOIN Contracts AS c ON j.ContractId = c.id
                             INNER JOIN Profiles AS p ON c.ClientId = p.id
                    WHERE j.paid = true
                      AND j.paymentDate BETWEEN :startDate AND :endDate
                    GROUP BY 1, 2, 3
                    ORDER BY 4 DESC LIMIT :limit;
                `,
                {
                    replacements: {startDate, endDate, limit: parseInt(limit)},
                    type: sequelize.QueryTypes.SELECT,
                }
            );

        if (result.length === 0) {
            return res.status(404).json({error: 'No data found for the specified date range'});
        }

        const treatedResult = result
            .map(({id, firstName, lastName, paid}) => {
                return {id, 'fullName': `${firstName}  ${lastName}`, paid}
            });

        res.json(treatedResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

module.exports = {
    getBestClients,
    getBestProfession
}