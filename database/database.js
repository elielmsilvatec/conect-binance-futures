const Sequelize = require('sequelize');
const conect = true

let sequelize;

if ( conect === true) {
  // Conexão de produção
  sequelize = new Sequelize('binance', 'admin', 'eliza2018', {
    host: 'database-1.cmsvx57e2kc5.us-east-1.rds.amazonaws.com',
    dialect: 'mysql'
  });
  // console.log('conectado ao banco Produção')
  sequelize.sync({ alter: true })
  .then(() => {
    // console.log('Banco de dados atualizado com sucesso.');
  })
  .catch(err => {
    // console.error('Erro ao atualizar o banco de dados:', err);
  });
}
sequelize.authenticate()
  .then(() => {
    // console.log('Connection has been established successfully.');
  })
  .catch(err => {
    // console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;

// DELETE FROM vendas WHERE id = 1;
// select * from vendas

// TRUNCATE TABLE tbl_teste_incremento;  -> deleta todos os registros

// atualizando vários itens ao mesmo tempo
// SET SQL_SAFE_UPDATES = 0;
// UPDATE vendas
// SET tipo_pagamento = 'Débito'
// WHERE tipo_pagamento = 'debito';