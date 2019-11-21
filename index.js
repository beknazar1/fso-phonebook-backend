const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

morgan.token('post-content', function(req, res) {
  if (req.method === 'POST') 
    return JSON.stringify(req.body);
})

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-content'));
app.use(cors());

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const now = new Date();
  res.send(`Phonebook has info for ${persons.length} people\n${now}`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);
  if (!person) {
    return res.status(404).json({
      error: 'person does not exist'
    })
  }
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const deletedPerson = persons.find(p => p.id === id);
  if (!deletedPerson) {
    return res.status(404). json({
      error: 'person does not exist'
    })
  }
  persons = persons.filter(p => p.id !== id);
  res.json(deletedPerson);
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400). json({
      error: 'name and/or number is missing'
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return res.status(403). json({
      error: 'name already exists, but must be unique'
    })
  }
  
  let newPerson = {
    name: body.name, 
    number: body.number, 
    id: generateId()
  };
  persons.push(newPerson);

  res.json(newPerson);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const generateId = () => {
  let randomId;
  let retries = 0;
  
  do {
    randomId = Math.floor(Math.random()*100000);
    retries++;
  } while (persons.find(person => person.id === randomId) && retries < 1000)
  
  return randomId;
};