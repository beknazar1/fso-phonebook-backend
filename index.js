require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const PORT = process.env.PORT;

// Logging configuration
morgan.token("post-content", function(req, res) {
  if (req.method === "POST") return JSON.stringify(req.body);
});


// Middleware
app.use(express.static("build"));
app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :post-content"));
app.use(cors());


// API routing
app.get('/api/info', (req, res) => {
  Person.estimatedDocumentCount()
    .then(count => {
      res.json({message: `There are ${count} people in the phonebook on ${Date()}`})
    })
})

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    const arr = [];
    persons.map(person => arr.push(person.toJSON()));
    res.json(arr);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person){
        res.json(person.toJSON())
      } else {
       res.status(404).end()
      }
    })
    .catch(error => next(error))
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name and/or number is missing"
    });
  }

  let person = {
    name: body.name,
    number: body.number
  }

  Person.create(person)
    .then(savedPerson => {
      res.json(savedPerson.toJSON());
    })
    .catch(error => next(error))
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  let person ={
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(savedPerson => {
      res.json(savedPerson.toJSON());
    })
    .catch(error => next(error))
});

// Error handlers
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
