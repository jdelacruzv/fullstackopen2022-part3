const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const url = process.env.MONGODB_URI;
console.log("connecting to", url);

// Database connection
mongoose.connect(url)
	.then(result => {
		console.log("Connected to MongoDB");
	})
	.catch(error => {
		console.log("Error connecting to MongoDB", error.message);
	});

// Define the Schema (how the data will be stored in the database)
const personSchema = new mongoose.Schema({
	// Define specific validation rules for each field
	name: {
		type: String,
		minLength: [3, "Name must have at least 3 characters"],
		required: [true, "Username required"],
		unique: true
	},
	number: {
		type: String,
		minLength: [8, "Number must have at least 8 characters"],
		validate: {
			validator: (val) => {
				return /^\d{2,3}-\d+$/.test(val);
			},
			message: (props) => `${props.value} is not a valid phone number!`
		},
		required: [true, "User's phone number is required"],
	},
});

personSchema.plugin(uniqueValidator);

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