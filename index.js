const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

const url = `mongodb+srv://user-fullstackopen:dArJCo1BqlkhA8RK@cluster0.a3agc.mongodb.net/fullstackopen?retryWrites=true&w=majority`;
mongoose.connect(url);

const personSchema = new mongoose.Schema({
	name: String,
	number: String
});

personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

const Person = mongoose.model("Person", personSchema);

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

// READ: Get info and date of persons
app.get("/info", (request, response) => {
	const result = `Phonebook has info for ${persons.length} people`;
	const date = new Date().toString();	
	response.send(`${result} <br><br> ${date}`);
});

// READ all persons
app.get("/api/persons", (resquest, response) => {
	Person
		.find({})
		.then(persons => {
			response.json(persons);
		});
});

// READ person by id
app.get("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	const person = persons.find(p => p.id === id);
	if (!person) return response.status(404).end();
	response.json(person);
});

// DELETE person by id
app.delete("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	persons = persons.filter(person => person.id !== id);
	response.status(204).end();
});

const generatedId = () => {
	const newId = Math.floor(Math.random() * 1000000);
	return newId;
};

// CREATE person
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