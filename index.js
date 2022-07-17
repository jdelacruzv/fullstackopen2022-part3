const express = require("express");
const app = express();
// Important that dotenv is imported before the model person
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const PORT = process.env.PORT;
const Person = require("./models/person")

// Configure morgan so that it also shows the data sent in HTTP POST requests:
morgan.token("data", (request, response) => {
	return request.data;
});

app.use((request, response, next) => {
	request.data = JSON.stringify(request.body);
	next();
});

app.use(morgan(`:method :url :res[content-length] - :response-time ms :data`));

// To make express show static content (index.html, style.css and the JavaScript, etc.)
app.use(express.static("build"));

// Activate the json-parser and implement an initial handler for dealing with the HTTP POST requests
app.use(express.json());

// Middleware to use and allow for requests from all origins
app.use(cors());

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
		// 400 bad request
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
			if (person) {
				response.json(person);
			} else {
				// 404 not found
				response.status(404).end();
			}
		})
		.catch(error => next(error));
});

// Delete person by id
app.delete("/api/persons/:id", (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(result => {
			// 204 no content
			response.status(204).end();
		})
		.catch(error => next(error));
});

// Set error handling into middleware
const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	// If the error was caused by an invalid object id for Mongo.
	if (error.name === "CastError") {
		return response.status(400).send({ error: "formatted id" });
	}

	// Middleware passes the error forward to the default Express error handler
	next(error);
};

// Handler of requests with result to errors
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});