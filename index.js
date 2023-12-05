const ethRoutes = require('./eth');


const express = require('express');
const app = express();
// const Database = require('./database/FuturosModel')

// Configurar o mecanismo de visualização
app.set('view engine', 'ejs');  // Use EJS como mecanismo de visualização
app.set('views', __dirname + '/views');  // Especifique o diretório de views (caso não esteja na raiz)


// Rota padrão para '/'

// app.get('/', async (req, res) => {

//     try {
         
//       const futuros = await Database.findAll();
//       res.render('app', {
//       futuros
//       })
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
   
//   })
  

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
