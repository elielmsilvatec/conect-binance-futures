const Sequelize = require("sequelize");
const connection = require("./database");

const Futures = connection.define('futuros', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    simbulo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    time_frame: {
        type: Sequelize.STRING,
        allowNull: true
    },
    operação: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    ultima_vela: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    },
    

});

module.exports = Futures;