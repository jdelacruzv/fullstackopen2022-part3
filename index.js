const express = require("express");
const app = express();
const PORT = 3001;

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

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});