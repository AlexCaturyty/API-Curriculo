const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const { Pool } = require('pg');
const database = require('./databaseConfig'); 

const pool = new Pool({
    connectionString: database.connectionString,
});

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/',(req,res) => {
    res.json({ info: 'API do meu curriculo com Node.js, Express e ElephantSQL (POSTGRES)'})
});

// GET
app.get('/curriculo', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM curriculo');
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).send('Erro interno do servidor');
    }
});

// GET BY ID
app.get('/curriculo/:id', async (req, res) => {
    const curriculoId = req.params.id;
  
    try {
      const result = await pool.query('SELECT * FROM curriculo WHERE id = $1', [curriculoId]);
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Currículo não encontrado' });
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Erro ao consultar o banco de dados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// POST 
    app.post('/criar-curriculo', async (req, res) => {
        const { NomeCompleto, Endereco, Telefone, Email, ExperienciaProfissional, Educacao, Habilidades } = req.body;
    

        if (NomeCompleto == null || Email == null) {
            return res.status(400).json({ message: 'NomeCompleto e email são campos obrigatórios' });
        }
        try {
        const result = await pool.query(
            'INSERT INTO curriculo (NomeCompleto, Endereco, Telefone, Email, ExperienciaProfissional, Educacao, Habilidades) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [NomeCompleto, Endereco, Telefone, Email, ExperienciaProfissional, Educacao, Habilidades]
        );
    
        res.status(201).json(result.rows[0]);
        } catch (error) {
        console.error('Erro ao inserir no banco de dados:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
        }
    });

// UPDATE
app.put('/editar-curriculo/:id', async (req, res) => {
  const curriculoId = req.params.id;
  const { NomeCompleto, Endereco, Telefone, Email, ExperienciaProfissional, Educacao, Habilidades } = req.body;

  if (!NomeCompleto || !Email) {
    return res.status(400).json({ message: 'Nome Completo e email são campos obrigatórios' });
  }

  try {
    const result = await pool.query(
      'UPDATE curriculo SET NomeCompleto = $1, Endereco = $2, Telefone = $3, Email = $4, ExperienciaProfissional = $5, Educacao = $6, Habilidades = $7 WHERE id = $8 RETURNING *',
      [NomeCompleto, Endereco, Telefone, Email, ExperienciaProfissional, Educacao, Habilidades, curriculoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Currículo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar no banco de dados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


// DELETE
app.delete('/deletar-curriculo/:id', async (req, res) => {
    const curriculoId = req.params.id;
  
    try {
      const result = await pool.query('DELETE FROM curriculo WHERE id = $1 RETURNING *', [curriculoId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Currículo não encontrado' });
      }
  
      res.json({ message: 'Currículo removido com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir do banco de dados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});