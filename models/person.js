const mongoose = require("mongoose");
const url = process.env.MONGODB_URI;
console.log("connecting to", url);

// Database connection
mongoose.connect(url)
	.then(result => {
		console.log("Connected to MongoDB");
	})
	.catch(error => {
		console.log("Error connecting to MongoDB", error.message);
	})

// Define the Schema (how the data will be stored in the database)
const personSchema = new mongoose.Schema({
	name: String,
	number: String,
});

// Modify the schema so that the _id property comes in "id" format
// Remove _id and __v properties (mongo version control)
personSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

// Export the model
module.exports = mongoose.model("Person", personSchema);