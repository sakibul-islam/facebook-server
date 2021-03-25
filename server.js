const express = require("express");
const cors = require("cors");
const app = express();

var multer = require('multer');
var upload = multer();

const { graphqlHTTP } = require("express-graphql");
const { rootSchema } = require("./graphql/root-schema");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/facebook", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use(cors());
app.use(
	"/graphql",
	graphqlHTTP({
		schema: rootSchema,
		graphiql: true,
	})
);

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.use(upload.array()); 
app.post("/post/new", (req, res) => {
	console.log(req);
	res.send('Done')
})

app.listen(3001, () => {
	console.log("server is listing 3001");
});
