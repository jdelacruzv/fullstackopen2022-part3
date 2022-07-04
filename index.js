const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

let persons = [
	{
		id: 1,
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: 2,
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: 3,
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: 4,
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

// Using a predefined format string
// app.use(morgan("dev"));
// app.use(morgan("tiny"));

// Activate the json-parser and implement an initial handler for dealing with the HTTP POST requests
app.use(express.json());

app.use(cors());

// Configure morgan so that it also shows the data sent in HTTP POST requests:
morgan.token("data", (request, response) => {
	return request.data;
});

app.use((request, response, next) => {
	request.data = JSON.stringify(request.body);
	next();
});

app.use(morgan(`:method :url :res[content-length] - :response-time ms :data`));

// Get main path
app.get("/", (request, response) => {
	response.send("<h1>Home</h1>");
});

// Get all persons
app.get("/api/persons", (resquest, response) => {
	response.json(persons);
});

// Get info and date of persons
app.get("/info", (request, response) => {
	const result = `Phonebook has info for ${persons.length} people`;
	const date = new Date().toString();	
	response.send(`${result} <br><br> ${date}`);
});

// Get person by id 
app.get("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	const person = persons.find(p => p.id === id);
	if (!person) return response.status(404).end();
	response.json(person);
});

// Delete person by id
app.delete("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	persons = persons.filter(person => person.id !== id);
	response.status(204).end();
});

const generatedId = () => {
	const newId = Math.floor(Math.random() * 1000000);
	return newId;
};

// Create person
app.post("/api/persons", (request, response) => {
	const body = request.body;
	// If the received data is missing a value for the content property, the
	// server will respond to the request with the status code 400 bad request:
	if (!body.name || !body.number) {
		return response.status(400).json({
			error: "missing name and/or number",
		});
	}

	const checkName = persons.find(person => person.name === body.name);
	if (checkName) {
		return response.status(400).json({
			error: "name must be unique",
		});
	}

	const person = {
		id: generatedId(),
		name: body.name,
		number: body.number,
	};

	persons = persons.concat(person);
	response.json(person);
});	

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});