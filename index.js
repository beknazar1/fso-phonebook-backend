require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const Person = require("./models/person");
const PORT = process.env.PORT;

// Logging configuration
const morgan = require("morgan");
morgan.token("post-content", function(req, res) {
  if (req.method === "POST") return JSON.stringify(req.body);
});


// Middleware
app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-content"
  )
);
app.use(cors());
app.use(express.static("build"));


// API routing
app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    const arr = [];
    persons.map(person => arr.push(person.toJSON()));
    res.json(arr);
  });
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (person === null) {
      res.status(404).json({ error: "person does not exist" });
    }
    res.json(person.toJSON());
  });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id).then(result => {
    if (result === null) {
      res.status(404).json({ error: "person does not exist" });
    }
    res.json(result.toJSON());
  });
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name and/or number is missing"
    });
  }

  let person = new Person({
    name: body.name,
    number: body.number
  });

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON());
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
