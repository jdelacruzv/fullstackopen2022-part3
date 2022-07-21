const express = require("express");
const app = express();
// Important that dotenv is imported before the model person
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const PORT = process.env.PORT;
const Person = require("./models/person");

// Configure morgan so that it also shows the data sent in HTTP POST requests:
morgan.token("data", (request, response) => {
	return request.data;
});

app.use((request, response, next) => {
	request.data = JSON.stringify(request.body);
	next();
});

app.use(morgan(":method :url :res[content-length] - :response-time ms :data"));

// To make express show static content (index.html, style.css and the JavaScript, etc.)
app.use(express.static("build"));

// Activate the json-parser and implement an initial handler for dealing with the HTTP POST requests
app.use(express.json());

// Middleware to use and allow for requests from all origins
app.use(cors());

// Get info and date of persons
app.get("/info", (request, response) => {
	Person.countDocuments()
		.then(docsCount => {
			const result = `Phonebook has info for ${docsCount} contacts`;
			const date = new Date();
			response.send(`${result} <br><br> ${date}`);
		})
		.catch(error => console.error(error));
});

// Create person
app.post("/api/persons", (request, response, next) => {
	const body = request.body;

	const person = new Person ({
		name: body.name,
		number: body.number,
	});

	person
		.save()
		.then(savedPerson => {
			response.json(savedPerson);
		})
		.catch(error => next(error));
});

// Read all persons
app.get("/api/persons", (resquest, response) => {
	Person
		.find({})
		.then(persons => {
			if (!persons.length) {
				response.status(204).json({
					error: "Content is not available"
				});
			} else {
				response.json(persons);
			}
		})
		.catch(error => console.error(error));
});

// Read person by id
app.get("/api/persons/:id", (request, response, next) => {
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

// Update person by id
app.put("/api/persons/:id", (request, response, next) => {
	const { name, number } = request.body;

	// We added the optional { new: true } parameter, which will cause our event
	// handler to be called with the new modified document instead of the original
	Person.findByIdAndUpdate(
		request.params.id,
		{ name, number },
		{ new: true, runValidators: true, context: "query" }
	)
		.then((updatedPerson) => {
			if (updatedPerson) {
				response.json(updatedPerson);
			} else {
				response.status(404).send({
					error: "Could not find entry with the id provided"
				});
			}
		})
		.catch((error) => next(error));
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

// Unknown endpoint routes
const unknownEndPoint = (request, response) => {
	response.status(404).send({
		error: "unknown endpoint"
	});
};

// Handler of requests with unknown endpoint
app.use(unknownEndPoint);

// Set error handling into middleware
const errorHandler = (error, request, response, next) => {
	console.error(error.message);

	// If the error was caused by an invalid object id for Mongo.
	if (error.name === "CastError") {
		return response.status(400).send({ error: "formatted id" });
	}
	// If the error was caused by validation errors
	else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	}

	// Middleware passes the error forward to the default Express error handler
	next(error);
};

// Handler of requests with result to errors
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});