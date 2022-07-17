require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const PORT = process.env.PORT;
const Person = require("./models/person")

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

// Activate the json-parser and implement an initial handler for dealing with the HTTP POST requests
app.use(express.json());

// Middleware to use and allow for requests from all origins
app.use(cors());

// To make express show static content (index.html, style.css and the JavaScript, etc.)
app.use(express.static("build"));

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
	response.send("<h1>Home backend phonebook</h1>");
});

// Get info and date of persons
app.get("/info", (request, response) => {
	const result = `Phonebook has info for ${persons.length} people`;
	const date = new Date().toString();	
	response.send(`${result} <br><br> ${date}`);
});

// Create person
app.post("/api/persons", (request, response) => {
	const body = request.body;
	
	if (!body.name || !body.number) {
		return response.status(400).json({
			error: "missing name and/or number",
		});
	}

	// const checkName = persons.find((person) => person.name === body.name);
	// if (checkName) {
	// 	return response.status(400).json({
	// 		error: "name must be unique",
	// 	});
	// }

	const person = new Person ({
		name: body.name,
		number: body.number,
	});

	person
		.save()
		.then(savedPerson => {
			response.json(savedPerson);
		});
});	

// Read all persons
app.get("/api/persons", (resquest, response) => {
	Person
		.find({})
		.then(persons => {
			response.json(persons);
		});
});

// Read person by id
app.get("/api/persons/:id", (request, response) => {
	Person
		.findById(request.params.id)
		.then(person => {
			response.json(person);
		});
});

// Delete person by id
app.delete("/api/persons/:id", (request, response) => {
	Person.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end();
		})
		.catch(error => next(error));
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});