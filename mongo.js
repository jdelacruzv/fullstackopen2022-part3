const mongoose = require("mongoose");
const password = process.argv[2];
const username = "user-fullstackopen";
const database = "fullstackopen";
const name = process.argv[3];
const number = process.argv[4];
const url = `mongodb+srv://${username}:${password}@cluster0.a3agc.mongodb.net/${database}?retryWrites=true&w=majority`;

// Returns an array containing the command-line arguments
if (process.argv.length < 3) {
	console.log(
		"Please provide the password as an argument: node mongo.js <password>"
	);
	// Exit app
	process.exit(1);
}

// Define the Schema (how the data will be stored in the database)
const personSchema = new mongoose.Schema({
	name: String,
	number: String
});

// Define the model (compiled Schema)
const Person = mongoose.model("Person", personSchema);

// Database connection
mongoose.connect(url);

if (process.argv.length === 3) {
	// Get data from db
	Person
		.find({})
		.then((result) => {
			console.log("phonebook:");
			result.forEach((person) => {
				console.log(`${person.name} ${person.number}`);
			});
			return mongoose.connection.close();
		});
} else if (process.argv.length === 5) {
	// Create person object
	const person = new Person({
		name,
		number,
	});
	// Save data to db
	person
		.save()
		.then((result) => {
			console.log(`added ${name} number ${number} to phonebook`);
			console.log("closed connection!");
			return mongoose.connection.close();
		})
		.catch((error) => console.log(error));
} else {
	console.log(
		"Please provide the password, name, number as an argument: node mongo.js <password> <name> <number>"
	);
	process.exit(1);
}